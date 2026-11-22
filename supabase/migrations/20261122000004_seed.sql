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

