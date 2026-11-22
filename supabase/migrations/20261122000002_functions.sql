-- =====================================================================
-- UrbanStore - fungsi bisnis (RPC)
-- 2/4: helper peran, kupon, place_order, batal/kedaluwarsa, aksi admin
--
-- Semua fungsi bisnis memakai SECURITY DEFINER + search_path kosong, sehingga
-- klien tidak perlu (dan tidak punya) hak tulis langsung ke tabel order.
-- Pesan error berformat  kode:detail  agar mudah dipetakan di aplikasi.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Helper
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;

create or replace function public.get_setting_int(p_key text, p_default integer)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select (s.value #>> '{}')::integer from public.app_settings s where s.key = p_key),
    p_default
  );
$$;

-- Cegah eskalasi peran: lewat API (ada JWT pengguna), hanya admin yang boleh
-- mengubah kolom role. Tanpa JWT (SQL Editor / service role) diizinkan, sehingga
-- admin pertama dapat dibuat dengan UPDATE manual.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin() then
    raise exception 'forbidden:role_change';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ---------------------------------------------------------------------
-- Kupon (internal): kembalikan diskon atau alasan penolakan
-- ---------------------------------------------------------------------
create or replace function public.evaluate_voucher(
  p_code text, p_user uuid, p_subtotal integer
)
returns table (discount integer, reason text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v public.vouchers%rowtype;
  v_total_used integer;
  v_user_used integer;
begin
  select * into v from public.vouchers where code = upper(trim(p_code));
  if not found then
    return query select 0, 'not_found'; return;
  end if;
  if not v.is_active then
    return query select 0, 'inactive'; return;
  end if;
  if v.starts_at is not null and now() < v.starts_at then
    return query select 0, 'not_started'; return;
  end if;
  if v.expires_at is not null and now() > v.expires_at then
    return query select 0, 'expired'; return;
  end if;
  if p_subtotal < v.min_subtotal then
    return query select 0, 'min_subtotal'; return;
  end if;

  select count(*) into v_total_used
    from public.voucher_redemptions r where r.voucher_code = v.code;
  if v.max_redemptions is not null and v_total_used >= v.max_redemptions then
    return query select 0, 'exhausted'; return;
  end if;

  select count(*) into v_user_used
    from public.voucher_redemptions r
    where r.voucher_code = v.code and r.user_id = p_user;
  if v.per_user_limit is not null and v_user_used >= v.per_user_limit then
    return query select 0, 'user_limit'; return;
  end if;

  return query select least(v.discount_amount, greatest(p_subtotal, 0)), null::text;
end;
$$;

-- Untuk tampilan di checkout. Hasil akhir tetap dihitung ulang di place_order.
create or replace function public.validate_voucher(p_code text, p_subtotal integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  r record;
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  select * into r from public.evaluate_voucher(p_code, v_uid, coalesce(p_subtotal, 0));
  return jsonb_build_object(
    'valid', r.reason is null,
    'code', upper(trim(p_code)),
    'discount', r.discount,
    'reason', r.reason
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Stok (internal)
-- ---------------------------------------------------------------------
create or replace function public.restore_order_stock(p_order_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.product_variants v
     set stock = v.stock + t.q
    from (
      select oi.variant_id as vid, sum(oi.quantity)::integer as q
        from public.order_items oi
       where oi.order_id = p_order_id and oi.variant_id is not null
       group by oi.variant_id
    ) t
   where v.id = t.vid;
$$;

-- ---------------------------------------------------------------------
-- Kedaluwarsa pesanan yang belum dibayar: lepas stok & kupon
-- ---------------------------------------------------------------------
create or replace function public.expire_pending_orders()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select o.id
      from public.orders o
     where o.payment_status = 'pending'
       and o.fulfillment_status = 'unfulfilled'
       and o.payment_expires_at is not null
       and o.payment_expires_at < now()
     order by o.payment_expires_at
     for update skip locked
  loop
    update public.orders
       set payment_status = 'expired',
           fulfillment_status = 'cancelled',
           cancelled_at = now()
     where id = r.id;
    perform public.restore_order_stock(r.id);
    delete from public.voucher_redemptions where order_id = r.id;
    insert into public.order_events (order_id, event_type, from_status, to_status, note)
    values (r.id, 'expired', 'PENDING_PAYMENT', 'EXPIRED', 'Batas waktu pembayaran terlewati');
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- ---------------------------------------------------------------------
-- Buat pesanan: harga, stok, kupon, ongkir dihitung ulang di server
--
-- p_items   : [{ "product_slug": "prod-1", "size": "L", "color": "Chalk White", "quantity": 2 }]
-- p_address : { recipient_name, phone, email?, province?, city?, district?,
--               postal_code, full_address, courier_note? }
-- ---------------------------------------------------------------------
create or replace function public.place_order(
  p_items            jsonb,
  p_address          jsonb,
  p_courier_id       text,
  p_payment_method   public.payment_method,
  p_voucher_code     text,
  p_idempotency_key  uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid        uuid := (select auth.uid());
  v_existing   public.orders%rowtype;
  v_courier    public.couriers%rowtype;
  v_bad        record;
  v_color_bad  record;
  v_subtotal   integer;
  v_shipping   integer;
  v_service    integer;
  v_discount   integer := 0;
  v_voucher    text := nullif(upper(trim(coalesce(p_voucher_code, ''))), '');
  v_eval       record;
  v_free_min   integer;
  v_seq        bigint;
  v_order_id   uuid := gen_random_uuid();
  v_number     text;
  v_email      text;
  v_postal     text;
  v_total      integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_idempotency_key is null then
    raise exception 'invalid_request:idempotency_key';
  end if;

  -- Klik ganda / retry: kembalikan order yang sama.
  select * into v_existing from public.orders
   where user_id = v_uid and idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object(
      'id', v_existing.id, 'order_number', v_existing.order_number,
      'total', v_existing.total, 'status', v_existing.status, 'duplicate', true);
  end if;

  perform public.expire_pending_orders();

  -- Validasi input
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'invalid_items:empty_or_too_many';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items)
      as x(product_slug text, size text, color text, quantity integer)
    where x.product_slug is null or x.size is null
       or x.quantity is null or x.quantity not between 1 and 99
  ) then
    raise exception 'invalid_items:malformed';
  end if;

  if coalesce(trim(p_address ->> 'recipient_name'), '') = '' then
    raise exception 'invalid_address:recipient_name';
  end if;
  if coalesce(trim(p_address ->> 'phone'), '') = '' then
    raise exception 'invalid_address:phone';
  end if;
  if length(coalesce(trim(p_address ->> 'full_address'), '')) < 10 then
    raise exception 'invalid_address:full_address';
  end if;
  v_postal := nullif(trim(coalesce(p_address ->> 'postal_code', '')), '');
  if v_postal is null or v_postal !~ '^[0-9]{5}$' then
    raise exception 'invalid_address:postal_code';
  end if;

  select * into v_courier from public.couriers where id = p_courier_id and is_active;
  if not found then
    raise exception 'invalid_courier:%', coalesce(p_courier_id, '');
  end if;

  -- Semua baris harus mengacu ke produk aktif + ukuran yang ada.
  select x.product_slug, x.size into v_bad
    from jsonb_to_recordset(p_items)
           as x(product_slug text, size text, color text, quantity integer)
    left join public.products p on p.slug = x.product_slug and p.is_active
    left join public.product_variants v on v.product_id = p.id and v.size = x.size
   where v.id is null
   limit 1;
  if found then
    raise exception 'item_unavailable:%:%', v_bad.product_slug, v_bad.size;
  end if;

  -- Warna harus valid jika produk punya daftar warna.
  select x.product_slug, x.color into v_color_bad
    from jsonb_to_recordset(p_items)
           as x(product_slug text, size text, color text, quantity integer)
    join public.products p on p.slug = x.product_slug
   where nullif(x.color, '') is not null
     and exists (select 1 from public.product_colors c where c.product_id = p.id)
     and not exists (
       select 1 from public.product_colors c
        where c.product_id = p.id and c.name = x.color)
   limit 1;
  if found then
    raise exception 'invalid_color:%:%', v_color_bad.product_slug, v_color_bad.color;
  end if;

  -- Kunci baris stok (urut per id agar tidak deadlock).
  perform v.id
    from public.product_variants v
   where v.id in (
     select v2.id
       from jsonb_to_recordset(p_items)
              as x(product_slug text, size text, color text, quantity integer)
       join public.products p on p.slug = x.product_slug
       join public.product_variants v2 on v2.product_id = p.id and v2.size = x.size)
   order by v.id
     for update;

  select p.slug, v.size, v.stock into v_bad
    from (
      select x.product_slug, x.size, sum(x.quantity)::integer as q
        from jsonb_to_recordset(p_items)
               as x(product_slug text, size text, color text, quantity integer)
       group by x.product_slug, x.size
    ) t
    join public.products p on p.slug = t.product_slug
    join public.product_variants v on v.product_id = p.id and v.size = t.size
   where v.stock < t.q
   limit 1;
  if found then
    raise exception 'insufficient_stock:%:%:%', v_bad.slug, v_bad.size, v_bad.stock;
  end if;

  -- Subtotal dari harga di database (harga dari browser diabaikan).
  select sum(p.price::bigint * x.quantity)::integer into v_subtotal
    from jsonb_to_recordset(p_items)
           as x(product_slug text, size text, color text, quantity integer)
    join public.products p on p.slug = x.product_slug;

  -- Kupon
  if v_voucher is not null then
    select * into v_eval from public.evaluate_voucher(v_voucher, v_uid, v_subtotal);
    if v_eval.reason is not null then
      raise exception 'voucher_invalid:%', v_eval.reason;
    end if;
    v_discount := v_eval.discount;
  end if;

  -- Ongkir & biaya layanan
  v_free_min := public.get_setting_int('free_shipping_min_subtotal', 500000);
  v_shipping := case
    when v_courier.free_shipping_eligible and v_subtotal >= v_free_min then 0
    else v_courier.base_cost
  end;
  v_service := public.get_setting_int('service_fee', 0);
  v_total := v_subtotal + v_shipping + v_service - v_discount;

  -- Kurangi stok secara atomik
  update public.product_variants v
     set stock = v.stock - t.q
    from (
      select v2.id as vid, sum(x.quantity)::integer as q
        from jsonb_to_recordset(p_items)
               as x(product_slug text, size text, color text, quantity integer)
        join public.products p on p.slug = x.product_slug
        join public.product_variants v2 on v2.product_id = p.id and v2.size = x.size
       group by v2.id
    ) t
   where v.id = t.vid;

  v_seq := nextval('public.order_number_seq');
  v_number := 'URBN-' || to_char(now() at time zone 'Asia/Jakarta', 'YYYYMM')
              || '-' || to_char(v_seq, 'FM0000');
  select email into v_email from public.profiles where id = v_uid;
  v_email := coalesce(nullif(trim(p_address ->> 'email'), ''), v_email, '');

  insert into public.orders (
    id, order_number, user_id, payment_method,
    subtotal, shipping_fee, discount, service_fee, total, voucher_code,
    courier_id, courier_name, estimated_arrival,
    recipient_name, recipient_phone, recipient_email,
    ship_province, ship_city, ship_district, ship_postal_code, ship_address, courier_note,
    va_number, payment_expires_at, idempotency_key
  ) values (
    v_order_id, v_number, v_uid, p_payment_method,
    v_subtotal, v_shipping, v_discount, v_service, v_total, v_voucher,
    v_courier.id, v_courier.name,
    case when v_courier.eta_max_days = 0 then 'Hari ini (maks. 3 jam)'
         when v_courier.eta_min_days = v_courier.eta_max_days
         then v_courier.eta_min_days || ' hari kerja'
         else v_courier.eta_min_days || ' – ' || v_courier.eta_max_days || ' hari kerja' end,
    trim(p_address ->> 'recipient_name'), trim(p_address ->> 'phone'), v_email,
    nullif(trim(coalesce(p_address ->> 'province', '')), ''),
    nullif(trim(coalesce(p_address ->> 'city', '')), ''),
    nullif(trim(coalesce(p_address ->> 'district', '')), ''),
    v_postal, trim(p_address ->> 'full_address'),
    nullif(trim(coalesce(p_address ->> 'courier_note', '')), ''),
    case when p_payment_method = 'va' then '8277' || lpad(v_seq::text, 12, '0') end,
    now() + make_interval(mins => public.get_setting_int('payment_expiry_minutes', 15)),
    p_idempotency_key
  );

  insert into public.order_items (
    order_id, product_id, variant_id, name, sku, color, size,
    unit_price, quantity, line_total, image_url
  )
  select v_order_id, p.id, v.id, p.short_name, p.sku || '-' || v.size,
         coalesce(
           nullif(x.color, ''),
           (select c.name from public.product_colors c
             where c.product_id = p.id order by c.sort_order limit 1),
           'Default'),
         v.size, p.price, x.quantity, p.price * x.quantity, p.image_url
    from jsonb_to_recordset(p_items)
           as x(product_slug text, size text, color text, quantity integer)
    join public.products p on p.slug = x.product_slug
    join public.product_variants v on v.product_id = p.id and v.size = x.size;

  if v_voucher is not null then
    insert into public.voucher_redemptions (voucher_code, user_id, order_id)
    values (v_voucher, v_uid, v_order_id);
  end if;

  insert into public.order_events (order_id, event_type, to_status, actor_id)
  values (v_order_id, 'created', 'PENDING_PAYMENT', v_uid);

  return jsonb_build_object(
    'id', v_order_id, 'order_number', v_number,
    'total', v_total, 'status', 'PENDING_PAYMENT', 'duplicate', false);
end;
$$;

-- ---------------------------------------------------------------------
-- Batalkan pesanan
--  * customer: hanya pesanan miliknya yang belum dibayar
--  * admin   : juga pesanan yang sudah dibayar tetapi belum dikirim
--              (pembayaran ditandai refunded)
-- ---------------------------------------------------------------------
create or replace function public.cancel_order(p_order_id uuid, p_reason text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_admin boolean := public.is_admin();
  o public.orders%rowtype;
  v_from text;
  v_new_payment public.payment_status;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into o from public.orders where id = p_order_id for update;
  if not found or (o.user_id <> v_uid and not v_admin) then
    raise exception 'order_not_found';
  end if;

  if o.fulfillment_status in ('shipped', 'completed', 'cancelled') then
    raise exception 'not_cancellable:%', o.status;
  end if;

  if o.payment_status = 'pending' then
    v_new_payment := 'cancelled';
  elsif o.payment_status = 'paid' and v_admin then
    v_new_payment := 'refunded';
  else
    raise exception 'not_cancellable:%', o.status;
  end if;

  v_from := o.status;
  update public.orders
     set payment_status = v_new_payment,
         fulfillment_status = 'cancelled',
         cancelled_at = now()
   where id = o.id
   returning * into o;

  perform public.restore_order_stock(o.id);
  delete from public.voucher_redemptions where order_id = o.id;
  insert into public.order_events (order_id, event_type, from_status, to_status, actor_id, note)
  values (o.id, 'cancelled', v_from, o.status, v_uid, p_reason);

  return jsonb_build_object('id', o.id, 'status', o.status);
end;
$$;

-- ---------------------------------------------------------------------
-- Aksi admin
-- ---------------------------------------------------------------------
create or replace function public.admin_mark_order_paid(p_order_id uuid, p_note text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  if o.payment_status <> 'pending' or o.fulfillment_status <> 'unfulfilled' then
    raise exception 'invalid_transition:%:PAID', o.status;
  end if;

  update public.orders set payment_status = 'paid', paid_at = now()
   where id = o.id returning * into o;
  insert into public.order_events (order_id, event_type, from_status, to_status, actor_id, note)
  values (o.id, 'paid', 'PENDING_PAYMENT', o.status, (select auth.uid()), p_note);
  return jsonb_build_object('id', o.id, 'status', o.status);
end;
$$;

-- unfulfilled -> processing -> shipped (butuh resi) -> completed
create or replace function public.admin_update_fulfillment(
  p_order_id uuid,
  p_status   public.fulfillment_status,
  p_tracking text default null,
  p_note     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
  v_from text;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_status = 'cancelled' then
    raise exception 'use_cancel_order';
  end if;

  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'order_not_found';
  end if;
  v_from := o.status;

  if p_status = 'processing' and o.fulfillment_status = 'unfulfilled' and o.payment_status = 'paid' then
    update public.orders set fulfillment_status = 'processing' where id = o.id returning * into o;
  elsif p_status = 'shipped' and o.fulfillment_status = 'processing' then
    if coalesce(trim(p_tracking), '') = '' then
      raise exception 'tracking_required';
    end if;
    update public.orders
       set fulfillment_status = 'shipped', tracking_number = trim(p_tracking), shipped_at = now()
     where id = o.id returning * into o;
  elsif p_status = 'completed' and o.fulfillment_status = 'shipped' then
    update public.orders
       set fulfillment_status = 'completed', completed_at = now()
     where id = o.id returning * into o;
  else
    raise exception 'invalid_transition:%:%', v_from, p_status;
  end if;

  insert into public.order_events (order_id, event_type, from_status, to_status, actor_id, note)
  values (o.id, 'fulfillment', v_from, o.status, (select auth.uid()), p_note);
  return jsonb_build_object('id', o.id, 'status', o.status);
end;
$$;

create or replace function public.admin_set_user_role(p_user_id uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  if p_user_id = (select auth.uid()) then
    raise exception 'cannot_change_own_role';
  end if;
  update public.profiles set role = p_role where id = p_user_id;
  if not found then
    raise exception 'user_not_found';
  end if;
end;
$$;

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;
  return jsonb_build_object(
    'orders_by_status', (
      select coalesce(jsonb_object_agg(s.status, s.c), '{}'::jsonb)
        from (select status, count(*) as c from public.orders group by status) s),
    'revenue_paid', (
      select coalesce(sum(total), 0) from public.orders
       where payment_status = 'paid' and fulfillment_status <> 'cancelled'),
    'customers', (select count(*) from public.profiles where role = 'customer'),
    'active_products', (select count(*) from public.products where is_active),
    'low_stock_variants', (
      select count(*) from public.product_variants v
        join public.products p on p.id = v.product_id
       where p.is_active and v.stock <= 3)
  );
end;
$$;

-- Ganti alamat utama secara atomik (hormati RLS: security invoker).
create or replace function public.set_primary_address(p_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (select 1 from public.addresses where id = p_id) then
    raise exception 'address_not_found';
  end if;
  update public.addresses set is_primary = false
   where user_id = (select auth.uid()) and is_primary and id <> p_id;
  update public.addresses set is_primary = true where id = p_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Hak eksekusi: tutup untuk publik, buka hanya yang diperlukan
-- ---------------------------------------------------------------------
-- Supabase memberi EXECUTE otomatis ke anon/authenticated pada fungsi baru
-- (bukan lewat PUBLIC), jadi anon harus dicabut secara eksplisit.
revoke all on function public.is_admin() from public;
revoke all on function public.get_setting_int(text, integer) from public;
revoke all on function public.evaluate_voucher(text, uuid, integer) from public, anon, authenticated;
revoke all on function public.restore_order_stock(uuid) from public, anon, authenticated;
revoke all on function public.expire_pending_orders() from public, anon;
revoke all on function public.validate_voucher(text, integer) from public, anon;
revoke all on function public.place_order(jsonb, jsonb, text, public.payment_method, text, uuid) from public, anon;
revoke all on function public.cancel_order(uuid, text) from public, anon;
revoke all on function public.admin_mark_order_paid(uuid, text) from public, anon;
revoke all on function public.admin_update_fulfillment(uuid, public.fulfillment_status, text, text) from public, anon;
revoke all on function public.admin_set_user_role(uuid, public.user_role) from public, anon;
revoke all on function public.admin_dashboard_stats() from public, anon;
revoke all on function public.set_primary_address(uuid) from public, anon;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.prevent_role_escalation() from public, anon, authenticated;

-- is_admin() dipakai di kebijakan RLS, termasuk untuk pengunjung anonim.
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.get_setting_int(text, integer) to anon, authenticated;

grant execute on function public.validate_voucher(text, integer) to authenticated;
grant execute on function public.place_order(jsonb, jsonb, text, public.payment_method, text, uuid) to authenticated;
grant execute on function public.cancel_order(uuid, text) to authenticated;
grant execute on function public.expire_pending_orders() to authenticated;
grant execute on function public.set_primary_address(uuid) to authenticated;
grant execute on function public.admin_mark_order_paid(uuid, text) to authenticated;
grant execute on function public.admin_update_fulfillment(uuid, public.fulfillment_status, text, text) to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;
