-- =====================================================================
-- UrbanStore - setup database lengkap (DIHASILKAN oleh scripts/bundle-sql.mjs)
-- Jalankan SEKALI pada project Supabase yang masih kosong (SQL Editor -> Run).
-- Isi: 20261122000001_schema.sql, 20261122000002_functions.sql, 20261122000003_rls.sql, 20261122000004_seed.sql
-- =====================================================================


-- >>>>>>>>>> 20261122000001_schema.sql
-- =====================================================================
-- UrbanStore - skema database (Supabase / PostgreSQL)
-- 1/4: enum, tabel, indeks, trigger
--
-- Prinsip (mengacu PRD 6.4, 6.5, 8):
--  * Uang disimpan sebagai integer Rupiah (tanpa floating point).
--  * Harga dan stok bersumber dari database; browser tidak dipercaya.
--  * Status pembayaran dipisah dari status pemenuhan pesanan.
--  * Order, item, dan riwayat bersifat snapshot (tahan perubahan katalog).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enum
-- ---------------------------------------------------------------------
create type public.user_role as enum ('admin', 'customer');
create type public.product_category as enum ('Pria', 'Wanita', 'Aksesoris');
create type public.payment_method as enum ('qris', 'va', 'cc');
create type public.payment_status as enum
  ('pending', 'paid', 'failed', 'expired', 'refunded', 'cancelled');
create type public.fulfillment_status as enum
  ('unfulfilled', 'processing', 'shipped', 'completed', 'cancelled');

-- ---------------------------------------------------------------------
-- Util: updated_at otomatis
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Pengguna & peran
-- ---------------------------------------------------------------------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  phone       text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create unique index profiles_email_key on public.profiles (lower(email));
create index profiles_role_idx on public.profiles (role);
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

comment on table public.profiles is
  'Profil 1:1 dengan auth.users. Kolom role menentukan hak akses (admin/customer).';

-- Dipanggil setelah user baru mendaftar. Role SELALU customer; role tidak
-- pernah diambil dari metadata yang dikirim klien.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    left(coalesce(new.raw_user_meta_data ->> 'full_name', ''), 120),
    'customer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Katalog
-- ---------------------------------------------------------------------
create table public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique
                       check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sku                text not null unique,
  name               text not null,
  short_name         text not null,
  category           public.product_category not null,
  sub_category       text not null default '',
  tag_label          text not null default '',
  price              integer not null check (price >= 0),
  original_price     integer check (original_price is null or original_price >= price),
  image_url          text not null default '',
  default_size       text,
  extra_color_count  integer not null default 0 check (extra_color_count >= 0),
  badges             jsonb not null default '[]'::jsonb,
  specs              jsonb not null default '{}'::jsonb,
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index products_active_category_idx on public.products (is_active, category, sort_order);
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  url         text not null,
  sort_order  integer not null default 0
);
create index product_images_product_idx on public.product_images (product_id, sort_order);

create table public.product_colors (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  name        text not null,
  hex         text not null check (hex ~ '^#[0-9a-fA-F]{6}$'),
  sort_order  integer not null default 0,
  unique (product_id, name)
);

-- Stok dikelola per ukuran. `stock` = jumlah tersedia (sudah dikurangi order
-- yang masih menunggu pembayaran; dikembalikan saat batal/kedaluwarsa).
create table public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  size        text not null,
  stock       integer not null default 0 check (stock >= 0),
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, size)
);
create trigger product_variants_set_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Pengaturan & logistik
-- ---------------------------------------------------------------------
create table public.app_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);
create trigger app_settings_set_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

create table public.couriers (
  id                      text primary key check (id ~ '^[a-z0-9_-]+$'),
  name                    text not null,
  tier                    text not null default '',
  base_cost               integer not null check (base_cost >= 0),
  eta_min_days            integer not null default 1 check (eta_min_days >= 0),
  eta_max_days            integer not null default 1 check (eta_max_days >= eta_min_days),
  free_shipping_eligible  boolean not null default false,
  is_active               boolean not null default true,
  sort_order              integer not null default 0
);

-- ---------------------------------------------------------------------
-- Kupon
-- ---------------------------------------------------------------------
create table public.vouchers (
  code              text primary key check (code = upper(code) and length(code) between 3 and 40),
  description       text not null default '',
  discount_amount   integer not null check (discount_amount > 0),
  min_subtotal      integer not null default 0 check (min_subtotal >= 0),
  starts_at         timestamptz,
  expires_at        timestamptz,
  max_redemptions   integer check (max_redemptions is null or max_redemptions > 0),
  per_user_limit    integer check (per_user_limit is null or per_user_limit > 0),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Data pelanggan
-- ---------------------------------------------------------------------
create table public.addresses (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles (id) on delete cascade,
  label           text not null default 'Rumah',
  recipient_name  text not null,
  phone           text not null,
  province        text,
  city            text,
  district        text,
  postal_code     text check (postal_code is null or postal_code ~ '^[0-9]{5}$'),
  full_address    text not null check (length(trim(full_address)) >= 10),
  courier_note    text,
  is_primary      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index addresses_user_idx on public.addresses (user_id);
create unique index addresses_one_primary_per_user on public.addresses (user_id) where is_primary;
create trigger addresses_set_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();

create table public.fit_profiles (
  user_id             uuid primary key references public.profiles (id) on delete cascade,
  height_cm           integer not null check (height_cm between 100 and 250),
  weight_kg           integer not null check (weight_kg between 30 and 300),
  preference          text not null check (preference in ('slim', 'regular', 'oversized')),
  recommended_top     text not null default '',
  recommended_bottom  text not null default '',
  calculated_size     text not null default '',
  updated_at          timestamptz not null default now()
);
create trigger fit_profiles_set_updated_at
  before update on public.fit_profiles
  for each row execute function public.set_updated_at();

create table public.newsletter_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  created_at  timestamptz not null default now()
);
create unique index newsletter_subscribers_email_key on public.newsletter_subscribers (lower(email));

-- ---------------------------------------------------------------------
-- Pesanan
-- ---------------------------------------------------------------------
create sequence public.order_number_seq;

create table public.orders (
  id                  uuid primary key default gen_random_uuid(),
  order_number        text not null unique,
  user_id             uuid not null references public.profiles (id) on delete restrict,

  payment_status      public.payment_status not null default 'pending',
  fulfillment_status  public.fulfillment_status not null default 'unfulfilled',
  -- Status gabungan untuk tampilan/filter, diturunkan dari dua kolom di atas.
  status              text generated always as (
    case
      when fulfillment_status = 'cancelled' and payment_status = 'expired'  then 'EXPIRED'
      when fulfillment_status = 'cancelled' and payment_status = 'refunded' then 'REFUNDED'
      when fulfillment_status = 'cancelled'                                 then 'CANCELLED'
      when fulfillment_status = 'completed'                                 then 'COMPLETED'
      when fulfillment_status = 'shipped'                                   then 'SHIPPED'
      when fulfillment_status = 'processing'                                then 'PROCESSING'
      when payment_status = 'paid'                                          then 'PAID'
      else 'PENDING_PAYMENT'
    end
  ) stored,

  payment_method      public.payment_method not null,
  subtotal            integer not null check (subtotal >= 0),
  shipping_fee        integer not null check (shipping_fee >= 0),
  discount            integer not null default 0 check (discount >= 0),
  service_fee         integer not null default 0 check (service_fee >= 0),
  total               integer not null check (total >= 0),
  constraint orders_total_consistent
    check (total = subtotal + shipping_fee + service_fee - discount),
  voucher_code        text references public.vouchers (code) on update cascade,

  courier_id          text references public.couriers (id),
  courier_name        text not null,
  tracking_number     text,
  estimated_arrival   text,

  recipient_name      text not null,
  recipient_phone     text not null,
  recipient_email     text not null,
  ship_province       text,
  ship_city           text,
  ship_district       text,
  ship_postal_code    text,
  ship_address        text not null,
  courier_note        text,

  va_number           text,
  payment_expires_at  timestamptz,
  paid_at             timestamptz,
  shipped_at          timestamptz,
  completed_at        timestamptz,
  cancelled_at        timestamptz,

  -- Mencegah pesanan ganda saat tombol diklik berulang (PRD CHK-06).
  idempotency_key     uuid not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index orders_user_created_idx on public.orders (user_id, created_at desc);
create index orders_status_created_idx on public.orders (status, created_at desc);
create index orders_pending_expiry_idx on public.orders (payment_expires_at)
  where payment_status = 'pending' and fulfillment_status = 'unfulfilled';
create unique index orders_va_number_key on public.orders (va_number) where va_number is not null;
create trigger orders_set_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  product_id  uuid references public.products (id) on delete set null,
  variant_id  uuid references public.product_variants (id) on delete set null,
  name        text not null,
  sku         text not null,
  color       text not null,
  size        text not null,
  unit_price  integer not null check (unit_price >= 0),
  quantity    integer not null check (quantity > 0),
  line_total  integer not null,
  constraint order_items_line_total_consistent check (line_total = unit_price * quantity),
  image_url   text not null default ''
);
create index order_items_order_idx on public.order_items (order_id);
create index order_items_variant_idx on public.order_items (variant_id);

create table public.voucher_redemptions (
  id            uuid primary key default gen_random_uuid(),
  voucher_code  text not null references public.vouchers (code) on update cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  order_id      uuid not null unique references public.orders (id) on delete cascade,
  created_at    timestamptz not null default now()
);
create index voucher_redemptions_code_idx on public.voucher_redemptions (voucher_code);
create index voucher_redemptions_user_idx on public.voucher_redemptions (user_id, voucher_code);

-- Jejak audit perubahan status pesanan.
create table public.order_events (
  id           bigint generated always as identity primary key,
  order_id     uuid not null references public.orders (id) on delete cascade,
  event_type   text not null,
  from_status  text,
  to_status    text,
  actor_id     uuid,
  note         text,
  created_at   timestamptz not null default now()
);
create index order_events_order_idx on public.order_events (order_id, created_at);


-- >>>>>>>>>> 20261122000002_functions.sql
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


-- >>>>>>>>>> 20261122000003_rls.sql
-- =====================================================================
-- UrbanStore - Row Level Security & hak akses
-- 3/4
--
-- Peran database Supabase: anon (belum login), authenticated (sudah login).
-- Peran aplikasi (admin/customer) ada di public.profiles.role dan diperiksa
-- lewat public.is_admin().
--
-- Prinsip:
--  * RLS aktif di SEMUA tabel public.
--  * Tabel pesanan tidak bisa ditulis langsung oleh klien; hanya lewat RPC.
--  * Customer hanya melihat datanya sendiri; admin melihat semuanya.
-- =====================================================================

alter table public.profiles               enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_colors         enable row level security;
alter table public.product_variants       enable row level security;
alter table public.app_settings           enable row level security;
alter table public.couriers               enable row level security;
alter table public.vouchers               enable row level security;
alter table public.addresses              enable row level security;
alter table public.fit_profiles           enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.voucher_redemptions    enable row level security;
alter table public.order_events           enable row level security;

-- ---------------------------------------------------------------------
-- Hak tabel (privilege). RLS menyaring baris; ini membatasi operasi/kolom.
-- ---------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;

-- profiles: baca; ubah hanya nama & telepon (role tidak bisa diubah klien)
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

-- katalog & konfigurasi: baca publik, tulis admin (dibatasi policy)
grant select on public.products, public.product_images, public.product_colors,
                public.product_variants, public.app_settings, public.couriers
  to anon, authenticated;
grant insert, update, delete on public.products, public.product_images,
                public.product_colors, public.product_variants,
                public.app_settings, public.couriers
  to authenticated;

grant select, insert, update, delete on public.vouchers to authenticated;

-- data pelanggan
grant select, insert, update, delete on public.addresses, public.fit_profiles to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select on public.newsletter_subscribers to authenticated;

-- pesanan: hanya baca (tulis lewat RPC security definer)
grant select on public.orders, public.order_items,
                public.voucher_redemptions, public.order_events
  to authenticated;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy profiles_select_own_or_admin on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- Katalog
-- ---------------------------------------------------------------------
create policy products_select on public.products
  for select to anon, authenticated
  using (is_active or public.is_admin());
create policy products_admin_write on public.products
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Tabel anak mengikuti visibilitas produk induknya (subquery tunduk pada RLS products).
create policy product_images_select on public.product_images
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));
create policy product_images_admin_write on public.product_images
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy product_colors_select on public.product_colors
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));
create policy product_colors_admin_write on public.product_colors
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy product_variants_select on public.product_variants
  for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id));
create policy product_variants_admin_write on public.product_variants
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Konfigurasi
-- ---------------------------------------------------------------------
create policy app_settings_select on public.app_settings
  for select to anon, authenticated using (true);
create policy app_settings_admin_write on public.app_settings
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy couriers_select on public.couriers
  for select to anon, authenticated using (is_active or public.is_admin());
create policy couriers_admin_write on public.couriers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Kupon: hanya admin. Customer memvalidasi lewat RPC validate_voucher().
create policy vouchers_admin_all on public.vouchers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Data pelanggan (hanya pemilik)
-- ---------------------------------------------------------------------
create policy addresses_owner_all on public.addresses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy fit_profiles_owner_all on public.fit_profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy newsletter_insert on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);
create policy newsletter_admin_select on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- Pesanan (baca saja; pemilik atau admin)
-- ---------------------------------------------------------------------
create policy orders_select_own_or_admin on public.orders
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

create policy order_items_select on public.order_items
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id));

create policy order_events_select on public.order_events
  for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id));

create policy voucher_redemptions_select on public.voucher_redemptions
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());


-- >>>>>>>>>> 20261122000004_seed.sql
-- =====================================================================
-- UrbanStore - data awal (seed)
-- 4/4  | DIHASILKAN otomatis oleh scripts/generate-seed.mts - jangan edit manual.
-- Idempotent: aman dijalankan ulang.
-- =====================================================================

insert into public.app_settings (key, value) values
  ('free_shipping_min_subtotal', '500000'::jsonb),
  ('service_fee',                '1000'::jsonb),
  ('payment_expiry_minutes',     '15'::jsonb)
on conflict (key) do nothing;

insert into public.couriers
  (id, name, tier, base_cost, eta_min_days, eta_max_days, free_shipping_eligible, sort_order)
values
  ('jnt',     'J&T Express Regular',    'Standard', 12000, 2, 4, true,  1),
  ('sicepat', 'SiCepat BEST',           'Next Day', 18000, 1, 1, false, 2),
  ('instant', 'Instant GoSend / Grab',  'Kilat',    35000, 0, 0, false, 3)
on conflict (id) do nothing;

insert into public.vouchers (code, description, discount_amount, min_subtotal, per_user_limit) values
  ('URBANFIRST',    'Voucher pembelian pertama',  50000, 0, 1),
  ('ESSENTIAL2026', 'Voucher koleksi Essential',  50000, 0, null)
on conflict (code) do nothing;

-- Oversized Heavyweight Tee
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-1', 'URBN-TSH-001', 'Oversized Heavyweight Tee - Charcoal', 'Oversized Heavyweight Tee', 'Pria'::public.product_category, 'Pria // Esensial', 'Ready', 249000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxohio_lrkWtKrdiB3ljAk78Wb6ahTapEIq6L3HppyfVZItVm_Ir2J9KyJVwzbSo98vVP49fo1NTDmonmG5j6BHNIWu95oQE42KeJFJEsH1qFMbn6Twg3uRGB19pkt54BvnGDKCSzNn5cStsAWonwTDawMbEd6gpnDp5qgbciS4GI431yqWcIR1Apuyfam2D_y4pZ75LoEubGS-2GWno-kYevcRc6xWrXAfIWezfxM', 'L', 2, '[{"text":"New Drop","variant":"white"},{"text":"280 GSM","variant":"promo"}]'::jsonb, '{"density":"220 GSM","silhouette":"Boxy Oversized","detailLabel":"Kerah Leher","detailValue":"High Rib 3.0 cm","fitNote":"Model tinggi 182 cm, berat 72 kg mengenakan ukuran L","materialTag":"100% Cotton 24S","carePoints":["• 100% Combed Cotton 24s (220 GSM) dengan tekstur rapat dan padat.","• Kerah rajut double-ribbed 3.0 cm anti-melar.","• Instruksi pencucian: Cuci mesin air dingin (maks 30°C), jangan gunakan pemutih berbahan klorin, setrika temperatur sedang dari sisi dalam, jemur rata di tempat teduh."]}'::jsonb, 10)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Charcoal Black', '#1C1D21', 0), ('Chalk White', '#ECEEEF', 1), ('Olive Green', '#495441', 2)) as c(name, hex, ord)
where p.slug = 'prod-1' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('S', 3, 0), ('M', 12, 1), ('L', 15, 2), ('XL', 0, 3), ('XXL', 1, 4)) as s(size, stock, ord)
where p.slug = 'prod-1' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuBglhlDFavWJLW5P9pXvahuHdZSf6WK62-xdGG0PEeZc9vOdNcWrGmpw8Zeaj2FShR3psEtsImo0p3R7AVo16-Hzy3tuD26-Cys6KHroAj8XGXs87ujmbh3VpSroJ82KbvwdkPBoY0yrKUp_xZrBDYzIc5gYDiieYfojQmsIo94RR64o75N5M1xbhDw0TlNFaiTc4224yNL3EPNzt0wZ8eQlank_bUzrEH1omPt6Pes', 0), ('https://lh3.googleusercontent.com/aida-public/AB6AXuADh9JZg2bwstQyeU_dyhSuPaY8JT8LIGOYHyWv8tLDbsX8M6zYfWVvbjqAIFBoaPvOMVYmXcJU0mjghisCdwKFe6Uv7WB6Xrc9GWdqX-c0FXh6JYwz-Fs52AlAFtUqeuCnxJsn5mqXQu5XUQuJ7v8k0KmGThFK5A-wRW6NK_Ufu3jgaYMEIXuW4ztKQETPijyAz57J2UaohsbJ74vPM2r5sL3tUqBopsoPNLcmR8M_', 1), ('https://lh3.googleusercontent.com/aida-public/AB6AXuDrk9tWosZ3vBm3dpsXwg1I73XhgU3LHC3QuIG9o81kAgy1HWKCsQNpphcbYZ0TaduZyOM-ucMM5BVdyrfhjkJUnzPHorLUQcNSl1h6rM3gsGrKFQGfhexiGe8mKXy0tXBLF9yOmZRxDqdxroxhGXqrMS09jZukgeoAvy61X3aWaWNL6ocS8qIFflSFWj67iG0IYoOjcGjH6Rk0gnNFOqsqga3cH_xMhp9gVsGs3gf6', 2), ('https://lh3.googleusercontent.com/aida-public/AB6AXuCr7P9yIs103Aj3mbpRBlp0wEUdjpMuxFWv8sbP3qj25G5V_XlyKL42kF6V_XzrxDIyfRKt4OCkZJBOvYV3dKoloa2rvpwGQcgO7IMrb2DLe_6xSSh6DuyFwiftkq6XVsjogjF-Z79WnwaKAKcTxmtf8j_kJvxsOSw04PFtc9Kc22jlq4EWtZXMQzMvskUS3nxrK-ZXMVr2ghemTWF3byVTyj0q9i2sPca5BrarHuHe', 3), ('https://lh3.googleusercontent.com/aida-public/AB6AXuACPSPBazgyXyVeCA84uAyie582fEJjsumw-6et6cmwxKwlB9vMUxkzlssQDEk86_gPrwwe2WKlnAqzvsXbrmZBl1-kZHXtniVRCp-cLshLEgq9IUgX9M8TR3HwxKNR--P4QzntVdGah2ct9CbBXS9QMINylDxqqR_XrFR2SrzR5stc29Oy2ICc2sGRn9H8booU4M3Uao7tlCv7yx7AxB8Qg32xGhqsYyi5-QokI4LQ', 4)) as g(url, ord)
where p.slug = 'prod-1'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Boxy Minimalist Linen Shirt
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-2', 'URBN-SHT-002', 'Boxy Minimalist Linen Shirt - Sand', 'Boxy Minimalist Linen Shirt', 'Pria'::public.product_category, 'Pria // Kemeja', 'Pure Linen', 389000, 450000, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQ_A_IZ0erNMfjhMtXCGvU-q17VjJ1M9lGZWxcWQVNxgk0p3qsLuFYPaDIuIZVz2Zs7RQzHWHAibpdF-mOWF82ssFKExDwMoC7M9fcCBbaikSRpD8Q-IUkcHLLaFHydMlkNhKfjQF_qJyyQnWsXohC7oVKTjCumwmUWTAdCYxpQ3M_8RqSm51QaF8iBHrgDPwOFma_IUkyU5UmpKpqBfHvvjkZ_pkA8wZXN9BRikpM', 'M', 0, '[{"text":"Best Seller","variant":"promo"},{"text":"Diskon 14%","variant":"dark"}]'::jsonb, '{"density":"185 GSM Linen","silhouette":"Boxy Camp Cut","detailLabel":"Kancing","detailValue":"Mother of Pearl","fitNote":"Model tinggi 180 cm, berat 70 kg mengenakan ukuran M","materialTag":"100% European Flax Linen","carePoints":["• 100% Pure European Flax Linen dengan sirkulasi udara tinggi untuk iklim tropis.","• Potongan boxy camp collar yang rileks namun terstruktur.","• Cuci lembut dengan air dingin, hindari pemerasan kuat, setrika uap saat masih agak lembap."]}'::jsonb, 20)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Sand Beige', '#e4d8c5', 0), ('Obsidian Black', '#292524', 1)) as c(name, hex, ord)
where p.slug = 'prod-2' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('S', 5, 0), ('M', 9, 1), ('L', 4, 2), ('XL', 2, 3)) as s(size, stock, ord)
where p.slug = 'prod-2' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuBQ_A_IZ0erNMfjhMtXCGvU-q17VjJ1M9lGZWxcWQVNxgk0p3qsLuFYPaDIuIZVz2Zs7RQzHWHAibpdF-mOWF82ssFKExDwMoC7M9fcCBbaikSRpD8Q-IUkcHLLaFHydMlkNhKfjQF_qJyyQnWsXohC7oVKTjCumwmUWTAdCYxpQ3M_8RqSm51QaF8iBHrgDPwOFma_IUkyU5UmpKpqBfHvvjkZ_pkA8wZXN9BRikpM', 0), ('https://lh3.googleusercontent.com/aida-public/AB6AXuCABh2P6ttxQg4XX6S5hoKV2Eo7gxUWh2jKkdcN6gmTIYzhlv5Amse6EM-vMGeZpiVKh_2n2jSddLyELl2C93rJO84c93_7f8dNcwZi68zwoNPeQmpI486ZZVi6x92dBdi1bJNE_HmkFg5A-CW2SF1F3n9WVFaN1ISk-vvGfHQMF-ddgChKhsomshlc2XOmhugIcX6POR6NdhD89HM-CaMUey5T0uWV-r3YDSN1-Q29', 1), ('https://lh3.googleusercontent.com/aida-public/AB6AXuCPY_jyWhTmay8K5_Ud69SGhZ4VWio6gIikf9pNbee6HIwtUQ-dK0ZBB3mr1Bzlt5r4VUbPUJGBG05FupOAnVL-z9wyiMq0ITlQSOwOyNDHfYOLe0NE_rIFMRBpH2IiFuJmO68qAOlm99RbGbsge1QnV-mqvKQgJwlWv-k3EoWFpeBPzrOm5Kf7OYOuZy2hpvzWB_XhEKaNOPxl74YT94ZBqtYZedOpT_S-cwVvQu9V', 2), ('https://lh3.googleusercontent.com/aida-public/AB6AXuC3weazbwFp09QW0IKGsZZ_stVr1gqbiP-i3VLrM9L-te6H3pFOhpKnhL23HWMtLWw4o_mDnA04J-DyYUiismvaHAniuGaWnba-dwyD7bJ1fpAvEgXMpcYOzNSZ9CzNHRA48oWvCNym0iuYJ4pNNL_VUR4f-DgEXQgi0IcSvH-ey_2X6cVps9Oz8150ZExts9G5XUEOwAxi6QTNyncqxVCSFzzBpdy1XbumtP9NsXrB', 3)) as g(url, ord)
where p.slug = 'prod-2'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Wide-Leg Pleated Trousers
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-3', 'URBN-TRS-003', 'Wide-Leg Pleated Trousers - Ink Black', 'Wide-Leg Pleated Trousers', 'Wanita'::public.product_category, 'Wanita // Celana', 'Tailored', 479000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZAU3c3uk7qyCaJhNZGffuRg-kO-Y3KAoWE1IjCAF--hKXhidvZfKLQulppl6MizhHUuNkWu66sQTEGViVq_cj1OI2JSkXtGil-8JDMDeAupLYadzxOirNqb2e9zek1B_hmzIrR4mNUxleDxFk-aweAUgHLR2o-VPcgnttPXr3H9jr2bWTZxiE7KbSEm0aEzVmdFzQA7Y6bzclkT-SGz4XlvJd7KNQCpfzFAAS5YSp', '28', 0, '[{"text":"Trending","variant":"promo"}]'::jsonb, '{"density":"260 GSM Twill","silhouette":"High-Waist Wide","detailLabel":"Lipatan Depan","detailValue":"Double Architectural Pleat","fitNote":"Model tinggi 170 cm, berat 52 kg mengenakan ukuran 28","materialTag":"Poly-Rayon Twill","carePoints":["• Drape jatuh sempurna dengan struktur pinggang tinggi yang tegas.","• Dilengkapi saku samping tersembunyi dan pengait logam internal.","• Cuci dingin atau dry clean untuk menjaga ketajaman lipatan pleat."]}'::jsonb, 30)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Ink Black', '#000000', 0), ('Stone Grey', '#d4d4d4', 1)) as c(name, hex, ord)
where p.slug = 'prod-3' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('26', 6, 0), ('28', 10, 1), ('30', 3, 2)) as s(size, stock, ord)
where p.slug = 'prod-3' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuDZAU3c3uk7qyCaJhNZGffuRg-kO-Y3KAoWE1IjCAF--hKXhidvZfKLQulppl6MizhHUuNkWu66sQTEGViVq_cj1OI2JSkXtGil-8JDMDeAupLYadzxOirNqb2e9zek1B_hmzIrR4mNUxleDxFk-aweAUgHLR2o-VPcgnttPXr3H9jr2bWTZxiE7KbSEm0aEzVmdFzQA7Y6bzclkT-SGz4XlvJd7KNQCpfzFAAS5YSp', 0), ('https://lh3.googleusercontent.com/aida-public/AB6AXuCw14YRvisUi6Nx_-38l57WG34s5Qu0kndBz0bfgbPUKS0qZdKRvB1zosKk2sCXfsttSzbT5uRBA4_dVUjZ7dArGt5bhiqehBMrft574N8lBa1zAAs1IvQIVEfk4pqmE3ZAskTpsz3Gpc0YsaqcEmP7v4WIOeTpTVH_bUT-8DPGfCMSWGeNJ3yD3YO0fbWqCeYcmRNEE7yFA1kdVOi60vHn9IxY_FpVYkk7Hnp7HFOI', 1), ('https://lh3.googleusercontent.com/aida-public/AB6AXuDV9fKkWm1cOMCD4NNYuqsCMJs3yIW-DFnjknp2ok4YWRKP9NrM1XOyx7PcFyLsL2QHAvVzKU-z4pF8epI0OWMr7SD6nVtbOEf5soAMcyDKcXIeXlg-X9qamfgsb5-PTyYSLIqamwMopiGcv1PhZQ03mNEwYBgno8Kd5drvmTOFsveAoflRStJrs6diTQrYGyzjVKXwnWSa3dP-Qar9jiMGkMZmrhxqEGrUTu1IfojM', 2), ('https://lh3.googleusercontent.com/aida-public/AB6AXuBYQiGggPIhja1aaDV4IfPVaEhoPR6Lo_lSUaoOMpS-X3GKPH2bMuv8a3Q4ni6Jh4EiP9BAQj5JHsPcpWmZp1CoIesDe13JzoA8BlnfqPciWW5H5dThMc-Qm7EXNy8EeXcGIA_9nj_DgCADO3wfESH0YY4twqLHGRSZOYfkXcm2lQBWXQVISE6tg3BfLpjNhX4m8w5VK8B2r1zkfxWH9buMWSGUFRdWzHPpXjPeJEJW', 3)) as g(url, ord)
where p.slug = 'prod-3'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Cropped Structured Blazer
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-4', 'URBN-BLZ-004', 'Cropped Structured Blazer - Bone White', 'Cropped Structured Blazer', 'Wanita'::public.product_category, 'Wanita // Outerwear', 'Restock SS26', 629000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTz5Rio15Ag5qCF90iJIEJC8l6rVCKCMzqv2vEGqQ-jvHQ8HqkM5EgfoGz1oN0S7TlgK-eGxe37FVWUXxQT9-69bMRHQW0oidMlYDN6Un7CxLijNafD03PyZBAEvPZJ9-yTItOrJVdEPAPBKA9NxZgL9BMWHUNEiW5ZeAX7a05wih17Vz4XECrnS7daEN4e6moOA6PhWNdLn12gPtXRKtAnf--MTNpIGPeOGQ8iVCt', 'M', 0, '[{"text":"Habis","variant":"soldout"}]'::jsonb, '{"density":"310 GSM Gabardine","silhouette":"Cropped Boxy","detailLabel":"Konstruksi Bahu","detailValue":"Soft Tailored Pad","fitNote":"Seluruh varian ukuran saat ini sedang habis terjual (Restock SS26)","materialTag":"Structured Gabardine","carePoints":["• Siluet cropped arsitektural dengan lapel minimalis.","• Disarankan dry clean saja untuk menjaga struktur bantalan bahu."]}'::jsonb, 40)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Bone White', '#e7e5e4', 0)) as c(name, hex, ord)
where p.slug = 'prod-4' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('S', 0, 0), ('M', 0, 1), ('L', 0, 2)) as s(size, stock, ord)
where p.slug = 'prod-4' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuBTz5Rio15Ag5qCF90iJIEJC8l6rVCKCMzqv2vEGqQ-jvHQ8HqkM5EgfoGz1oN0S7TlgK-eGxe37FVWUXxQT9-69bMRHQW0oidMlYDN6Un7CxLijNafD03PyZBAEvPZJ9-yTItOrJVdEPAPBKA9NxZgL9BMWHUNEiW5ZeAX7a05wih17Vz4XECrnS7daEN4e6moOA6PhWNdLn12gPtXRKtAnf--MTNpIGPeOGQ8iVCt', 0)) as g(url, ord)
where p.slug = 'prod-4'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Relaxed Japanese Raw Denim
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-5', 'URBN-DNM-005', 'Relaxed Japanese Raw Denim - Deep Indigo', 'Relaxed Japanese Raw Denim', 'Pria'::public.product_category, 'Pria // Denim', 'Kojima Mill', 549000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCKYL7fMV4z66PtlI9OENMp_2yoTLz_6YEZhPWKxLmYEA6FVbWL4bTyOSFQJNq1ux6B-wvDfrL1w43-bUOOApeTsZQFTkYB0TUum6FZSS7xVzQC3YxtkuUGOAhdDDWnKxygUrwf8m2qFEq4VGwXtWNyi0JYtDXA3rrr7ZOUfA0gZ9xr7rS5khlib23xqWyAGURBU3GlDMsXcDKZZrfRNMDq7mD03K6sbM142fcjj4Pz', '30', 0, '[{"text":"14.5 oz Selvedge","variant":"dark"}]'::jsonb, '{"density":"14.5 oz Selvedge","silhouette":"Relaxed Straight","detailLabel":"Tenunan","detailValue":"Red-Line Shuttle Loom","fitNote":"Model tinggi 181 cm, berat 71 kg mengenakan ukuran 30","materialTag":"100% Kojima Raw Cotton","carePoints":["• 14.5 oz Japanese Rope-Dyed Indigo Selvedge Denim dari Kojima.","• Jahitan rantai (chain-stitch) pada hem bawah dan rivet tembaga matte.","• Rendam air dingin secara berkala (soak wash) dengan deterjen khusus denim."]}'::jsonb, 50)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Deep Indigo', '#1e1b4b', 0)) as c(name, hex, ord)
where p.slug = 'prod-5' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('28', 4, 0), ('30', 8, 1), ('32', 5, 2), ('34', 2, 3)) as s(size, stock, ord)
where p.slug = 'prod-5' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuCKYL7fMV4z66PtlI9OENMp_2yoTLz_6YEZhPWKxLmYEA6FVbWL4bTyOSFQJNq1ux6B-wvDfrL1w43-bUOOApeTsZQFTkYB0TUum6FZSS7xVzQC3YxtkuUGOAhdDDWnKxygUrwf8m2qFEq4VGwXtWNyi0JYtDXA3rrr7ZOUfA0gZ9xr7rS5khlib23xqWyAGURBU3GlDMsXcDKZZrfRNMDq7mD03K6sbM142fcjj4Pz', 0), ('https://lh3.googleusercontent.com/aida-public/AB6AXuBm2I3siBPaoJ48oHxEdw3cBhpHVKACRsVRub9eLDRHhGqd_h2v-8g2cCR2kB93z3C8FgtvEmdvKRFRnnMQ2kTLstr3EoQxxZOhmgzo9ky3yS4JI0OeXNfl-PmBtR2_ru_YIrXhCB9c63iv_I4uYtfvEYqdXrainPTtlaNCkDnRWMHVy81mEgtHFs7Tsp4dS1ZXpoPINYTIZbhVDMrff3II8qlxTugzlEYK5_SqF5Uf', 1), ('https://lh3.googleusercontent.com/aida-public/AB6AXuAU1yTemLOwMCGPTWgj-QfL3GAP6WFEyr2Dxw33pDXxrPe2WEtR9Xz0BSdaZHMjkpFRGiqx_6X7EZfbg6xX4L89bmscygLqq_LabsWimQzxFuK3rWo2yT7ZrNgmMrMSeyJnra_zunH8NvAkVAp33q8DqC3FcLMuIC3FDvBNnyNgIEY8z6Pgxhy9DfyFOh_VE8BF-MJv_hHd-2hMSPpBGQD3lC-etvOAfifaO0pqmahE', 2)) as g(url, ord)
where p.slug = 'prod-5'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Ribbed Knit Asymmetric Top
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-6', 'URBN-KNT-006', 'Ribbed Knit Asymmetric Top - Sage Green', 'Ribbed Knit Asymmetric Top', 'Wanita'::public.product_category, 'Wanita // Atasan', 'Organic Rib', 299000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzxmYFhiLjhBCPkYVu_ACyzuhhovgy5I1Y0c4B0Sh5-IHXxCjr44cvXz9OXiF5-f-BZkcJNthysW09COedQ-HAf5kww6ye1jzcAEwS7gSYNvH4aT95m3j-afhbzfoTcQ-KT_riMTKUVHyzF71h7FCk9FKloqe4POKmOrdrVrSejrgiJxC1QNuNROg_hb0uWd_wNQYgjL97WMTDBSmsRCaQSVo4vcWdbyzoBhtTTSEQ', 'S', 0, '[{"text":"New Siluet","variant":"promo"}]'::jsonb, '{"density":"240 GSM Knit","silhouette":"Sculpted Fit","detailLabel":"Garis Leher","detailValue":"Asymmetric Collarbone Cut","fitNote":"Model tinggi 168 cm, berat 51 kg mengenakan ukuran S","materialTag":"Organic Cotton Modal","carePoints":["• Rajutan rib organik elastis yang mengikuti kontur tubuh dengan lembut.","• Jangan digantung saat basah; jemur mendatar agar panjang rajutan tetap stabil."]}'::jsonb, 60)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Sage Green', '#065f46', 0), ('Warm Cream', '#e5e5e5', 1)) as c(name, hex, ord)
where p.slug = 'prod-6' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('S', 7, 0), ('M', 9, 1), ('L', 3, 2)) as s(size, stock, ord)
where p.slug = 'prod-6' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuDzxmYFhiLjhBCPkYVu_ACyzuhhovgy5I1Y0c4B0Sh5-IHXxCjr44cvXz9OXiF5-f-BZkcJNthysW09COedQ-HAf5kww6ye1jzcAEwS7gSYNvH4aT95m3j-afhbzfoTcQ-KT_riMTKUVHyzF71h7FCk9FKloqe4POKmOrdrVrSejrgiJxC1QNuNROg_hb0uWd_wNQYgjL97WMTDBSmsRCaQSVo4vcWdbyzoBhtTTSEQ', 0)) as g(url, ord)
where p.slug = 'prod-6'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Utility Minimalist Crossbody Pouch
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-7', 'URBN-BAG-007', 'Utility Minimalist Crossbody Pouch', 'Utility Minimalist Crossbody Pouch', 'Aksesoris'::public.product_category, 'Aksesoris // Tas', 'Water-repellent', 219000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk7Cj0OuzCybmVGVtNlIRX9BbdlZXL8Oax8clIYzu1BytJnFRG6rH9KoWwaLGVT9JReCjQOjylrxhcuEWXzgUDF9KrxGkFWBXH1JBBYFa_-fJrzL8c0ExMYTCY-q-oR2EBGtE26NR_C1sLr5c0xuzR7ImCHTHwsqsGez6DNa48tsNKH7tn9jwCXU6Gz5XD37eqX5mphhAj2d4LGu18v6TGOnU_r6tQsX-3y8kUNyiM', 'OS', 0, '[{"text":"Cordura®","variant":"white"}]'::jsonb, '{"density":"500D Cordura®","silhouette":"Compact Modular","detailLabel":"Ritsleting","detailValue":"YKK AquaGuard® Matte","fitNote":"Dimensi: 22 cm × 16 cm × 6 cm (Tali dapat disesuaikan)","materialTag":"Ballistic Nylon","carePoints":["• Material 500D Cordura® tahan gesekan dan percikan air hujan.","• Tiga kompartemen internal untuk paspor, ponsel, dan kunci.","• Bersihkan dengan kain lembap; jangan dimasukkan ke mesin cuci."]}'::jsonb, 70)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Ultra Matte Black', '#171717', 0)) as c(name, hex, ord)
where p.slug = 'prod-7' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('OS', 14, 0)) as s(size, stock, ord)
where p.slug = 'prod-7' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuDk7Cj0OuzCybmVGVtNlIRX9BbdlZXL8Oax8clIYzu1BytJnFRG6rH9KoWwaLGVT9JReCjQOjylrxhcuEWXzgUDF9KrxGkFWBXH1JBBYFa_-fJrzL8c0ExMYTCY-q-oR2EBGtE26NR_C1sLr5c0xuzR7ImCHTHwsqsGez6DNa48tsNKH7tn9jwCXU6Gz5XD37eqX5mphhAj2d4LGu18v6TGOnU_r6tQsX-3y8kUNyiM', 0), ('https://lh3.googleusercontent.com/aida-public/AB6AXuC5-yfa0Qu7RUVCdI2VnACYtc6r6jTcRMY1GIMtRf4fY9NrOH6Ho-_pUfyqy2pPvVZV_V1HKA3eBpyy-4MVuBcAeK7L9TgjnZqakJFcRcLRqgPhpMVyTijBijW76cOKio23bQYngNA88LXnyS8B-XEvzNX9I5GiC4rSNha_HnkIO321H2ZksX9AUgDKjKqQDMiD0uLRTV2Fdr_OC0RcOdHzpYk-Gk4oyf0wyhvYhIhz', 1), ('https://lh3.googleusercontent.com/aida-public/AB6AXuDhHjuJxONw08c30wMaQFAucDirLqMUmERZkWjq_mZZb1djB_sVQ388AdHJ7JS8JXkswS8fS781v1i31mByNp1bXMbJs-B_v-DFum4CYFjt_u-K79zDaf5LjwUz_AQgSXsPCaIoyWYczcYW0GyzGjPTMfNvpKY24q7BTdNDca-deCRuL6HvFYTcZPtLuaK2-wwg0BCc2lxJuEYnLSYWi_Hs41J1kNTKFD_JUuPMx1sZ', 2)) as g(url, ord)
where p.slug = 'prod-7'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Everyday Wool Blend Overcoat
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-8', 'URBN-COT-008', 'Everyday Wool Blend Overcoat - Slate', 'Everyday Wool Blend Overcoat', 'Wanita'::public.product_category, 'Wanita // Mantel', 'Wool Blend', 899000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuDS05yKpnO4AUAQ7Q9fEHdO-U4vqCu8FMYvOm5NZLKBiCdFi4YeECk3Fs67vwu0Kn4266t3zByyE2eCKFXJc4qaQ8u6cQHQjMha7Pkm6m_9W3XaS52f3RodXc8bAqivS3fXBrr-IXBohm0ieiacxoBcWk3PAOSyjq99RLzOas5mmQgoyvVSnrUjpjwxt3Vmc7USUYhkrCC8XGd0evCIdDrdpLYOX5SK8jKzJrZLSZkh', 'M', 0, '[{"text":"Premium Cut","variant":"promo"}]'::jsonb, '{"density":"420 GSM Wool","silhouette":"Relaxed Drop Shoulder","detailLabel":"Penutup Depan","detailValue":"Concealed Placket","fitNote":"Model tinggi 173 cm, berat 54 kg mengenakan ukuran M","materialTag":"60% Wool / 40% Tencel","carePoints":["• Campuran wol merino lembut dan serat Tencel dengan bobot jatuh presisi.","• Kancing depan tersembunyi untuk siluet monolitik yang bersih.","• Khusus perawatan Dry Clean profesional."]}'::jsonb, 80)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Slate Gray', '#475569', 0), ('Pitch Black', '#1c1917', 1)) as c(name, hex, ord)
where p.slug = 'prod-8' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('S', 4, 0), ('M', 6, 1), ('L', 2, 2)) as s(size, stock, ord)
where p.slug = 'prod-8' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuDS05yKpnO4AUAQ7Q9fEHdO-U4vqCu8FMYvOm5NZLKBiCdFi4YeECk3Fs67vwu0Kn4266t3zByyE2eCKFXJc4qaQ8u6cQHQjMha7Pkm6m_9W3XaS52f3RodXc8bAqivS3fXBrr-IXBohm0ieiacxoBcWk3PAOSyjq99RLzOas5mmQgoyvVSnrUjpjwxt3Vmc7USUYhkrCC8XGd0evCIdDrdpLYOX5SK8jKzJrZLSZkh', 0)) as g(url, ord)
where p.slug = 'prod-8'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Vibram Sole Leather Derbies
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-derbies', 'URBN-SHO-009', 'Vibram Sole Leather Derbies - Archive Black', 'Vibram Sole Leather Derbies', 'Aksesoris'::public.product_category, 'Aksesoris // Alas Kaki', 'Vibram Sole', 899000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5-JsITeGQLaGdNoZX_mmapNqpJu4Rp2qMa1ye_ksqvn5XC_kpxVqzIs4MmYgfBE-6tEEAQZXt-CBUR9VXb-vLcHjBtRksXRmk2vCU89FKpiUfcaA94LEwJAc525kI3OCvPel7Vfff2blQ6YWsKR1MTLu1xJtNbPdwy2b-YIHC_O9j2Oowqy3TKaF6fcRutn7CHmYSv3cHJrtvZrEJPHff92-f-40nH-xiQ618q7CS', '42', 0, '[{"text":"Full Grain","variant":"dark"}]'::jsonb, '{"density":"Full-Grain Leather","silhouette":"Classic Derby","detailLabel":"Sol","detailValue":"Vibram Lug Sole","fitNote":"Ukuran EU; pilih satu ukuran di atas bila berada di antara dua ukuran","materialTag":"Full-Grain Leather","carePoints":["• Kulit full-grain dengan sol Vibram tahan selip untuk pemakaian harian.","• Bersihkan dengan kain lembap dan semir netral; hindari rendaman air."]}'::jsonb, 90)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Archive Black', '#1a1a1a', 0)) as c(name, hex, ord)
where p.slug = 'prod-derbies' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('40', 3, 0), ('41', 6, 1), ('42', 8, 2), ('43', 5, 3), ('44', 2, 4)) as s(size, stock, ord)
where p.slug = 'prod-derbies' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuA5-JsITeGQLaGdNoZX_mmapNqpJu4Rp2qMa1ye_ksqvn5XC_kpxVqzIs4MmYgfBE-6tEEAQZXt-CBUR9VXb-vLcHjBtRksXRmk2vCU89FKpiUfcaA94LEwJAc525kI3OCvPel7Vfff2blQ6YWsKR1MTLu1xJtNbPdwy2b-YIHC_O9j2Oowqy3TKaF6fcRutn7CHmYSv3cHJrtvZrEJPHff92-f-40nH-xiQ618q7CS', 0)) as g(url, ord)
where p.slug = 'prod-derbies'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);

-- Heavy Ribbed Socks (2-Pack)
insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values ('prod-socks', 'URBN-SOK-010', 'Heavy Ribbed Socks (2-Pack) - Archive Black', 'Heavy Ribbed Socks (2-Pack)', 'Aksesoris'::public.product_category, 'Aksesoris // Kaus Kaki', 'Heavy Rib', 99000, null, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAXOdyhHPShzVT_wPTe9U5kiJXEcQz2CrrcSCzFgyh4CmQYZx-W5uyzfZ5IEhu16Mxdk8kI_ZEshhEKxWf7iBPVgo_bo-c4UrXWWvJej5rriV7MoX8sDWUJxLtTnWgK51uDGKiXedzHoHhjkLzeJso5fXsWvRJt_xxGONkPEGOmPMx5bfPB741pNCptolbG4bj0x1_F4YHCz4TsCS2ZCdQ0rNW6iXYiqUZRh9apfXh9', 'OS', 0, '[]'::jsonb, '{"density":"Heavy Rib Knit","silhouette":"Crew Length","detailLabel":"Isi","detailValue":"2 pasang per kemasan","fitNote":"Satu ukuran (OS), cocok untuk EU 39 - 45","materialTag":"Cotton Blend","carePoints":["• Rajutan rib tebal yang menahan bentuk dan nyaman dipakai seharian.","• Cuci mesin air dingin; jemur di tempat teduh."]}'::jsonb, 100)
on conflict (slug) do nothing;
insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ('Archive Black', '#1a1a1a', 0)) as c(name, hex, ord)
where p.slug = 'prod-socks' on conflict (product_id, name) do nothing;
insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ('OS', 40, 0)) as s(size, stock, ord)
where p.slug = 'prod-socks' on conflict (product_id, size) do nothing;
insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ('https://lh3.googleusercontent.com/aida-public/AB6AXuAXOdyhHPShzVT_wPTe9U5kiJXEcQz2CrrcSCzFgyh4CmQYZx-W5uyzfZ5IEhu16Mxdk8kI_ZEshhEKxWf7iBPVgo_bo-c4UrXWWvJej5rriV7MoX8sDWUJxLtTnWgK51uDGKiXedzHoHhjkLzeJso5fXsWvRJt_xxGONkPEGOmPMx5bfPB741pNCptolbG4bj0x1_F4YHCz4TsCS2ZCdQ0rNW6iXYiqUZRh9apfXh9', 0)) as g(url, ord)
where p.slug = 'prod-socks'
  and not exists (select 1 from public.product_images i where i.product_id = p.id);
