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
