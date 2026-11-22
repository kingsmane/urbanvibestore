/**
 * Menghasilkan supabase/migrations/20261122000004_seed.sql dari src/data/storeData.ts.
 * Jalankan: npm run db:seed
 * Seed bersifat idempotent (aman dijalankan ulang): ON CONFLICT DO NOTHING.
 */
import { writeFileSync } from 'node:fs';
import { PRODUCTS } from '../src/data/storeData.ts';

const q = (v: string | null | undefined) => (v == null ? 'null' : `'${v.replace(/'/g, "''")}'`);
const j = (v: unknown) => `${q(JSON.stringify(v))}::jsonb`;

const out: string[] = [];
out.push(`-- =====================================================================
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
`);

PRODUCTS.forEach((p, i) => {
  out.push(`-- ${p.shortName}`);
  out.push(
    `insert into public.products (slug, sku, name, short_name, category, sub_category, tag_label, price, original_price, image_url, default_size, extra_color_count, badges, specs, sort_order)
values (${q(p.id)}, ${q(p.sku)}, ${q(p.name)}, ${q(p.shortName)}, ${q(p.category)}::public.product_category, ${q(p.subCategory)}, ${q(p.tagLabel)}, ${p.price}, ${p.originalPrice ?? 'null'}, ${q(p.image)}, ${q(p.defaultSize)}, ${p.extraColorCount ?? 0}, ${j(p.badges)}, ${j(p.specs)}, ${(i + 1) * 10})
on conflict (slug) do nothing;`
  );
  const colors = p.colors.map((c, k) => `(${q(c.name)}, ${q(c.hex)}, ${k})`).join(', ');
  out.push(
    `insert into public.product_colors (product_id, name, hex, sort_order)
select p.id, c.name, c.hex, c.ord from public.products p, (values ${colors}) as c(name, hex, ord)
where p.slug = ${q(p.id)} on conflict (product_id, name) do nothing;`
  );
  const sizes = p.sizes.map((s, k) => `(${q(s.code)}, ${s.stock}, ${k})`).join(', ');
  out.push(
    `insert into public.product_variants (product_id, size, stock, sort_order)
select p.id, s.size, s.stock, s.ord from public.products p, (values ${sizes}) as s(size, stock, ord)
where p.slug = ${q(p.id)} on conflict (product_id, size) do nothing;`
  );
  const gallery = p.gallery.map((u, k) => `(${q(u)}, ${k})`).join(', ');
  out.push(
    `insert into public.product_images (product_id, url, sort_order)
select p.id, g.url, g.ord from public.products p, (values ${gallery}) as g(url, ord)
where p.slug = ${q(p.id)}
  and not exists (select 1 from public.product_images i where i.product_id = p.id);
`
  );
});

writeFileSync(new URL('../supabase/migrations/20261122000004_seed.sql', import.meta.url), out.join('\n') + '\n');
console.log(`seed.sql: ${PRODUCTS.length} produk`);
