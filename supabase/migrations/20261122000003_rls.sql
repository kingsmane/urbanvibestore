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
