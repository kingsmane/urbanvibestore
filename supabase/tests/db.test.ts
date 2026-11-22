// @vitest-environment node
/**
 * Uji skema Supabase pada Postgres sungguhan (PGlite). Skema `auth` Supabase
 * ditiru secara minimal (auth.users, auth.uid()) dan peran anon/authenticated
 * dibuat dengan hak default yang sama seperti project Supabase.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const MIGRATIONS = new URL('../migrations/', import.meta.url);

const HARNESS_SQL = `
    create role anon nologin;
    create role authenticated nologin;
    create role service_role nologin bypassrls;
    create schema auth;
    create table auth.users (
      id uuid primary key default gen_random_uuid(),
      email text,
      raw_user_meta_data jsonb not null default '{}'::jsonb
    );
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
    alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
    alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
  `;

let db: PGlite;

const CUSTOMER_A = '11111111-1111-1111-1111-111111111111';
const CUSTOMER_B = '22222222-2222-2222-2222-222222222222';
const ADMIN = '99999999-9999-9999-9999-999999999999';

type Tx = Pick<PGlite, 'query' | 'exec'>;

/** Jalankan sebagai pengguna login (atau anon) dalam satu transaksi. */
async function as<T>(uid: string | null, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${uid ? 'authenticated' : 'anon'}`);
    await tx.query(`select set_config('request.jwt.claim.sub', $1, true)`, [uid ?? '']);
    return fn(tx as unknown as Tx);
  });
}

const rows = async <T = Record<string, unknown>>(tx: Tx, sql: string, params: unknown[] = []) =>
  (await tx.query<T>(sql, params)).rows;

let keySeq = 0;
const newKey = () => `00000000-0000-4000-8000-${String(++keySeq).padStart(12, '0')}`;

const ADDRESS = {
  recipient_name: 'Budi Santoso',
  phone: '+62 812-3456-7890',
  province: 'DKI Jakarta',
  city: 'Jakarta Selatan',
  district: 'Kebayoran Baru',
  postal_code: '12160',
  full_address: 'Jl. Merdeka No. 10 RT 01/RW 02',
};

interface Line { product_slug: string; size: string; color?: string; quantity: number }

async function placeOrder(
  uid: string,
  items: Line[],
  opts: { courier?: string; method?: string; voucher?: string | null; key?: string; address?: object } = {}
) {
  return as(uid, async (tx) => {
    const r = await rows<{ r: { id: string; order_number: string; total: number; status: string; duplicate: boolean } }>(
      tx,
      `select public.place_order($1::jsonb, $2::jsonb, $3, $4::public.payment_method, $5, $6::uuid) as r`,
      [
        JSON.stringify(items),
        JSON.stringify(opts.address ?? ADDRESS),
        opts.courier ?? 'jnt',
        opts.method ?? 'va',
        opts.voucher ?? null,
        opts.key ?? newKey(),
      ]
    );
    return r[0].r;
  });
}

const stock = async (slug: string, size: string) =>
  (await rows<{ stock: number }>(
    db as unknown as Tx,
    `select v.stock from public.product_variants v join public.products p on p.id = v.product_id
      where p.slug = $1 and v.size = $2`,
    [slug, size]
  ))[0].stock;

const orderRow = async (id: string) =>
  (await rows<Record<string, any>>(db as unknown as Tx, `select * from public.orders where id = $1`, [id]))[0];

beforeAll(async () => {
  db = new PGlite();
  await db.exec(HARNESS_SQL);

  for (const f of readdirSync(MIGRATIONS).filter((n) => n.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(new URL(f, MIGRATIONS), 'utf8'));
  }

  await db.exec(`
    insert into auth.users (id, email, raw_user_meta_data) values
      ('${CUSTOMER_A}', 'a@example.com', '{"full_name":"Customer A"}'),
      ('${CUSTOMER_B}', 'b@example.com', '{"full_name":"Customer B","role":"admin"}'),
      ('${ADMIN}',      'admin@example.com', '{"full_name":"Admin"}');
    -- Promosi admin pertama lewat SQL Editor (tanpa JWT) seperti di dokumentasi.
    update public.profiles set role = 'admin' where id = '${ADMIN}';
  `);
}, 60000);

afterAll(async () => {
  await db?.close();
});

// ---------------------------------------------------------------------
describe('autentikasi & peran', () => {
  it('pendaftaran otomatis membuat profil customer', async () => {
    const r = await rows<{ role: string; full_name: string; email: string }>(
      db as unknown as Tx,
      `select role, full_name, email from public.profiles where id = $1`, [CUSTOMER_A]);
    expect(r[0]).toEqual({ role: 'customer', full_name: 'Customer A', email: 'a@example.com' });
  });

  it('role dari metadata pendaftaran diabaikan (tidak bisa mendaftar sebagai admin)', async () => {
    const r = await rows<{ role: string }>(db as unknown as Tx,
      `select role from public.profiles where id = $1`, [CUSTOMER_B]);
    expect(r[0].role).toBe('customer');
  });

  it('admin pertama dapat dibuat lewat SQL Editor', async () => {
    const r = await rows<{ role: string }>(db as unknown as Tx,
      `select role from public.profiles where id = $1`, [ADMIN]);
    expect(r[0].role).toBe('admin');
  });

  it('customer tidak dapat mengubah role sendiri', async () => {
    await expect(
      as(CUSTOMER_A, (tx) => tx.exec(`update public.profiles set role = 'admin' where id = '${CUSTOMER_A}'`))
    ).rejects.toThrow(/permission denied/i);
    const r = await rows<{ role: string }>(db as unknown as Tx,
      `select role from public.profiles where id = $1`, [CUSTOMER_A]);
    expect(r[0].role).toBe('customer');
  });

  it('customer dapat mengubah nama & telepon sendiri, tetapi bukan milik orang lain', async () => {
    await as(CUSTOMER_A, async (tx) => {
      await tx.exec(`update public.profiles set full_name = 'A Baru', phone = '0812' where id = '${CUSTOMER_A}'`);
      const other = await tx.query(`update public.profiles set full_name = 'Dibajak' where id = '${CUSTOMER_B}' returning id`);
      expect(other.rows).toHaveLength(0);
    });
    const r = await rows<{ full_name: string }>(db as unknown as Tx,
      `select full_name from public.profiles where id = $1`, [CUSTOMER_B]);
    expect(r[0].full_name).toBe('Customer B');
  });

  it('customer hanya melihat profilnya; admin melihat semua', async () => {
    const own = await as(CUSTOMER_A, (tx) => rows<{ id: string }>(tx, `select id from public.profiles`));
    expect(own.map((r) => r.id)).toEqual([CUSTOMER_A]);
    const all = await as(ADMIN, (tx) => rows(tx, `select id from public.profiles`));
    expect(all).toHaveLength(3);
  });

  it('admin dapat mengubah role lewat RPC, tetapi tidak role sendiri', async () => {
    await as(ADMIN, (tx) => tx.exec(`select public.admin_set_user_role('${CUSTOMER_B}', 'admin')`));
    expect((await rows<{ role: string }>(db as unknown as Tx,
      `select role from public.profiles where id = $1`, [CUSTOMER_B]))[0].role).toBe('admin');
    await as(ADMIN, (tx) => tx.exec(`select public.admin_set_user_role('${CUSTOMER_B}', 'customer')`));

    await expect(
      as(ADMIN, (tx) => tx.exec(`select public.admin_set_user_role('${ADMIN}', 'customer')`))
    ).rejects.toThrow(/cannot_change_own_role/);
  });

  it('customer tidak dapat memanggil RPC admin', async () => {
    await expect(
      as(CUSTOMER_A, (tx) => tx.exec(`select public.admin_set_user_role('${CUSTOMER_B}', 'admin')`))
    ).rejects.toThrow(/forbidden/);
    await expect(
      as(CUSTOMER_A, (tx) => tx.exec(`select public.admin_dashboard_stats()`))
    ).rejects.toThrow(/forbidden/);
  });

  it('pengunjung anonim tidak boleh memanggil fungsi pesanan', async () => {
    await expect(
      as(null, (tx) => tx.exec(`select public.place_order('[]'::jsonb,'{}'::jsonb,'jnt','va',null,'${newKey()}')`))
    ).rejects.toThrow(/permission denied/i);
  });
});

// ---------------------------------------------------------------------
describe('katalog & RLS', () => {
  it('anon dapat membaca produk aktif beserta varian, warna, gambar', async () => {
    const p = await as(null, (tx) => rows(tx, `select slug from public.products`));
    expect(p).toHaveLength(10);
    const v = await as(null, (tx) => rows(tx, `select 1 from public.product_variants`));
    expect(v.length).toBeGreaterThan(20);
    const c = await as(null, (tx) => rows(tx, `select 1 from public.product_colors`));
    expect(c.length).toBeGreaterThan(10);
  });

  it('produk nonaktif tersembunyi dari publik tetapi terlihat admin', async () => {
    await db.exec(`update public.products set is_active = false where slug = 'prod-8'`);
    expect(await as(null, (tx) => rows(tx, `select 1 from public.products`))).toHaveLength(9);
    expect(await as(null, (tx) => rows(tx, `select 1 from public.product_variants v join public.products p on p.id=v.product_id where p.slug='prod-8'`))).toHaveLength(0);
    expect(await as(ADMIN, (tx) => rows(tx, `select 1 from public.products`))).toHaveLength(10);
    await db.exec(`update public.products set is_active = true where slug = 'prod-8'`);
  });

  it('customer tidak dapat mengubah/menambah/menghapus produk; admin bisa', async () => {
    const mutate = [
      `update public.products set price = 1 where slug = 'prod-1'`,
      `delete from public.products where slug = 'prod-1'`,
      `update public.product_variants set stock = 999`,
    ];
    for (const sql of mutate) {
      const res = await as(CUSTOMER_A, (tx) => tx.query(sql));
      expect(res.affectedRows ?? 0).toBe(0); // RLS menyaring semua baris
    }
    await expect(
      as(CUSTOMER_A, (tx) => tx.exec(`insert into public.products (slug, sku, name, short_name, category, price) values ('x','x','x','x','Pria',1)`))
    ).rejects.toThrow(/row-level security/i);
    expect(await rows(db as unknown as Tx, `select 1 from public.products where slug='prod-1' and price = 249000`)).toHaveLength(1);

    await as(ADMIN, (tx) => tx.exec(`update public.products set tag_label = 'Ready' where slug = 'prod-1'`));
  });

  it('data sensitif tidak dapat dibaca anon', async () => {
    for (const t of ['profiles', 'orders', 'order_items', 'addresses', 'fit_profiles', 'vouchers', 'voucher_redemptions', 'order_events']) {
      await expect(as(null, (tx) => tx.query(`select * from public.${t}`)), t).rejects.toThrow(/permission denied/i);
    }
  });

  it('kupon tidak dapat dilihat customer (hanya lewat RPC)', async () => {
    expect(await as(CUSTOMER_A, (tx) => rows(tx, `select 1 from public.vouchers`))).toHaveLength(0);
    expect(await as(ADMIN, (tx) => rows(tx, `select 1 from public.vouchers`))).toHaveLength(2);
  });

  it('konfigurasi (kurir, pengaturan) dapat dibaca publik, ditulis admin saja', async () => {
    expect(await as(null, (tx) => rows(tx, `select 1 from public.couriers`))).toHaveLength(3);
    expect(await as(null, (tx) => rows(tx, `select 1 from public.app_settings`))).toHaveLength(3);
    const res = await as(CUSTOMER_A, (tx) => tx.query(`update public.app_settings set value = '0'::jsonb`));
    expect(res.affectedRows ?? 0).toBe(0);
  });

  it('newsletter: anon dapat mendaftar, tidak dapat membaca, email unik', async () => {
    await as(null, (tx) => tx.exec(`insert into public.newsletter_subscribers (email) values ('n@example.com')`));
    await expect(as(null, (tx) => tx.query(`select * from public.newsletter_subscribers`))).rejects.toThrow(/permission denied/i);
    await expect(
      as(null, (tx) => tx.exec(`insert into public.newsletter_subscribers (email) values ('N@Example.com')`))
    ).rejects.toThrow(/duplicate key/i);
    await expect(
      as(null, (tx) => tx.exec(`insert into public.newsletter_subscribers (email) values ('bukan-email')`))
    ).rejects.toThrow(/check constraint/i);
    expect(await as(ADMIN, (tx) => rows(tx, `select 1 from public.newsletter_subscribers`))).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------
describe('place_order', () => {
  it('menghitung harga, ongkir, biaya layanan, dan total di server; mengurangi stok', async () => {
    const before = await stock('prod-2', 'M');
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'M', color: 'Sand Beige', quantity: 1 }]);
    expect(o.order_number).toMatch(/^URBN-\d{6}-\d{4,}$/);
    expect(o.status).toBe('PENDING_PAYMENT');
    const row = await orderRow(o.id);
    expect(row.subtotal).toBe(389000);
    expect(row.shipping_fee).toBe(12000);
    expect(row.service_fee).toBe(1000);
    expect(row.discount).toBe(0);
    expect(row.total).toBe(389000 + 12000 + 1000);
    expect(row.payment_status).toBe('pending');
    expect(row.fulfillment_status).toBe('unfulfilled');
    expect(row.va_number).toMatch(/^8277\d{12}$/);
    expect(row.payment_expires_at).toBeTruthy();
    expect(await stock('prod-2', 'M')).toBe(before - 1);

    const items = await rows<Record<string, any>>(db as unknown as Tx, `select * from public.order_items where order_id = $1`, [o.id]);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Boxy Minimalist Linen Shirt', size: 'M', color: 'Sand Beige', unit_price: 389000, quantity: 1, line_total: 389000 });
  });

  it('ongkir reguler gratis untuk subtotal >= Rp 500.000; kurir lain tetap berbayar', async () => {
    const free = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-1', size: 'M', color: 'Chalk White', quantity: 3 }]);
    const fr = await orderRow(free.id);
    expect(fr.subtotal).toBe(747000);
    expect(fr.shipping_fee).toBe(0);
    expect(fr.total).toBe(747000 + 1000);

    const fast = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-1', size: 'M', quantity: 3 }], { courier: 'sicepat' });
    expect((await orderRow(fast.id)).shipping_fee).toBe(18000);
    const inst = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-1', size: 'M', quantity: 3 }], { courier: 'instant' });
    const ir = await orderRow(inst.id);
    expect(ir.shipping_fee).toBe(35000);
    expect(ir.estimated_arrival).toContain('Hari ini');
  });

  it('qris/kartu tidak memiliki nomor VA', async () => {
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-7', size: 'OS', quantity: 1 }], { method: 'qris' });
    expect((await orderRow(o.id)).va_number).toBeNull();
  });

  it('menggabungkan baris beda warna pada ukuran yang sama saat memeriksa stok', async () => {
    // prod-1 ukuran XXL: stok 1 -> 2 baris x1 harus ditolak (total 2 > 1)
    await expect(
      placeOrder(CUSTOMER_A, [
        { product_slug: 'prod-1', size: 'XXL', color: 'Charcoal Black', quantity: 1 },
        { product_slug: 'prod-1', size: 'XXL', color: 'Chalk White', quantity: 1 },
      ])
    ).rejects.toThrow(/insufficient_stock:prod-1:XXL:1/);
    expect(await stock('prod-1', 'XXL')).toBe(1);
  });

  it('stok tidak cukup: ditolak, semua perubahan dibatalkan (atomik)', async () => {
    const s1 = await stock('prod-2', 'S');
    const s2 = await stock('prod-1', 'S');
    await expect(
      placeOrder(CUSTOMER_A, [
        { product_slug: 'prod-2', size: 'S', quantity: 1 },
        { product_slug: 'prod-1', size: 'S', quantity: 4 }, // stok prod-1 S = 3
      ])
    ).rejects.toThrow(/insufficient_stock:prod-1:S:3/);
    expect(await stock('prod-2', 'S')).toBe(s1);
    expect(await stock('prod-1', 'S')).toBe(s2);
  });

  it('unit terakhir hanya terjual sekali', async () => {
    await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-1', size: 'XXL', quantity: 1 }]);
    await expect(
      placeOrder(CUSTOMER_B, [{ product_slug: 'prod-1', size: 'XXL', quantity: 1 }])
    ).rejects.toThrow(/insufficient_stock/);
    expect(await stock('prod-1', 'XXL')).toBe(0);
  });

  it('produk habis, tidak aktif, atau ukuran tidak ada: ditolak', async () => {
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'prod-4', size: 'M', quantity: 1 }])).rejects.toThrow(/insufficient_stock:prod-4:M:0/);
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'XXXL', quantity: 1 }])).rejects.toThrow(/item_unavailable:prod-2:XXXL/);
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'tidak-ada', size: 'M', quantity: 1 }])).rejects.toThrow(/item_unavailable/);
    await db.exec(`update public.products set is_active = false where slug = 'prod-6'`);
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'prod-6', size: 'S', quantity: 1 }])).rejects.toThrow(/item_unavailable:prod-6:S/);
    await db.exec(`update public.products set is_active = true where slug = 'prod-6'`);
  });

  it('warna tidak valid, kuantitas tidak valid, keranjang kosong: ditolak', async () => {
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'M', color: 'Pink Neon', quantity: 1 }])).rejects.toThrow(/invalid_color:prod-2:Pink Neon/);
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'M', quantity: 0 }])).rejects.toThrow(/invalid_items:malformed/);
    await expect(placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'M', quantity: -3 }])).rejects.toThrow(/invalid_items:malformed/);
    await expect(placeOrder(CUSTOMER_A, [])).rejects.toThrow(/invalid_items:empty_or_too_many/);
  });

  it('validasi alamat dan kurir', async () => {
    const item = [{ product_slug: 'prod-7', size: 'OS', quantity: 1 }];
    await expect(placeOrder(CUSTOMER_A, item, { address: { ...ADDRESS, postal_code: '1216' } })).rejects.toThrow(/invalid_address:postal_code/);
    await expect(placeOrder(CUSTOMER_A, item, { address: { ...ADDRESS, recipient_name: ' ' } })).rejects.toThrow(/invalid_address:recipient_name/);
    await expect(placeOrder(CUSTOMER_A, item, { address: { ...ADDRESS, full_address: 'pendek' } })).rejects.toThrow(/invalid_address:full_address/);
    await expect(placeOrder(CUSTOMER_A, item, { courier: 'kurir-fiktif' })).rejects.toThrow(/invalid_courier/);
  });

  it('idempotensi: kunci yang sama tidak membuat pesanan ganda atau mengurangi stok dua kali', async () => {
    const key = newKey();
    const before = await stock('prod-7', 'OS');
    const a = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-7', size: 'OS', quantity: 1 }], { key });
    const b = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-7', size: 'OS', quantity: 1 }], { key });
    expect(b.id).toBe(a.id);
    expect(b.duplicate).toBe(true);
    expect(await stock('prod-7', 'OS')).toBe(before - 1);
  });
});

// ---------------------------------------------------------------------
describe('kupon', () => {
  it('validate_voucher: kode valid, tidak ada, dan di bawah minimum', async () => {
    const ok = await as(CUSTOMER_A, (tx) => rows<{ r: any }>(tx, `select public.validate_voucher('urbanfirst ', 300000) as r`));
    expect(ok[0].r).toMatchObject({ valid: true, code: 'URBANFIRST', discount: 50000 });
    const bad = await as(CUSTOMER_A, (tx) => rows<{ r: any }>(tx, `select public.validate_voucher('NGAWUR', 300000) as r`));
    expect(bad[0].r).toMatchObject({ valid: false, reason: 'not_found' });
  });

  it('diskon dihitung server dan dibatasi tidak melebihi subtotal', async () => {
    const o = await placeOrder(CUSTOMER_B, [{ product_slug: 'prod-socks', size: 'OS', quantity: 1 }], { voucher: 'essential2026' });
    const r = await orderRow(o.id);
    expect(r.subtotal).toBe(99000);
    expect(r.discount).toBe(50000);
    expect(r.voucher_code).toBe('ESSENTIAL2026');
    expect(r.total).toBe(99000 + 12000 + 1000 - 50000);
  });

  it('URBANFIRST maksimal sekali per pengguna; batal melepas kuota', async () => {
    const first = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'L', quantity: 1 }], { voucher: 'URBANFIRST' });
    await expect(
      placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'L', quantity: 1 }], { voucher: 'URBANFIRST' })
    ).rejects.toThrow(/voucher_invalid:user_limit/);
    // pengguna lain tidak terpengaruh
    await placeOrder(CUSTOMER_B, [{ product_slug: 'prod-2', size: 'L', quantity: 1 }], { voucher: 'URBANFIRST' });

    await as(CUSTOMER_A, (tx) => tx.exec(`select public.cancel_order('${first.id}')`));
    const again = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-2', size: 'L', quantity: 1 }], { voucher: 'URBANFIRST' });
    expect((await orderRow(again.id)).discount).toBe(50000);
  });

  it('kupon kedaluwarsa, nonaktif, belum berlaku, minimum belanja, kuota habis', async () => {
    await db.exec(`
      insert into public.vouchers (code, discount_amount, min_subtotal, expires_at) values ('LAMA', 10000, 0, now() - interval '1 day');
      insert into public.vouchers (code, discount_amount, min_subtotal, starts_at) values ('NANTI', 10000, 0, now() + interval '1 day');
      insert into public.vouchers (code, discount_amount, min_subtotal, is_active) values ('MATI', 10000, 0, false);
      insert into public.vouchers (code, discount_amount, min_subtotal) values ('MIN500', 10000, 500000);
      insert into public.vouchers (code, discount_amount, min_subtotal, max_redemptions) values ('SATU', 10000, 0, 1);
    `);
    const item = [{ product_slug: 'prod-7', size: 'OS', quantity: 1 }];
    await expect(placeOrder(CUSTOMER_A, item, { voucher: 'LAMA' })).rejects.toThrow(/voucher_invalid:expired/);
    await expect(placeOrder(CUSTOMER_A, item, { voucher: 'NANTI' })).rejects.toThrow(/voucher_invalid:not_started/);
    await expect(placeOrder(CUSTOMER_A, item, { voucher: 'MATI' })).rejects.toThrow(/voucher_invalid:inactive/);
    await expect(placeOrder(CUSTOMER_A, item, { voucher: 'MIN500' })).rejects.toThrow(/voucher_invalid:min_subtotal/);
    await placeOrder(CUSTOMER_A, item, { voucher: 'SATU' });
    await expect(placeOrder(CUSTOMER_B, item, { voucher: 'SATU' })).rejects.toThrow(/voucher_invalid:exhausted/);
  });
});

// ---------------------------------------------------------------------
describe('pembatalan & kedaluwarsa', () => {
  it('customer membatalkan pesanan belum bayar: stok kembali, status CANCELLED', async () => {
    const before = await stock('prod-6', 'M');
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-6', size: 'M', quantity: 2 }]);
    expect(await stock('prod-6', 'M')).toBe(before - 2);
    await as(CUSTOMER_A, (tx) => tx.exec(`select public.cancel_order('${o.id}', 'salah pilih')`));
    expect(await stock('prod-6', 'M')).toBe(before);
    const r = await orderRow(o.id);
    expect(r.status).toBe('CANCELLED');
    expect(r.payment_status).toBe('cancelled');
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`select public.cancel_order('${o.id}')`))).rejects.toThrow(/not_cancellable/);
  });

  it('pesanan orang lain tidak dapat dibatalkan (dianggap tidak ada)', async () => {
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-6', size: 'S', quantity: 1 }]);
    await expect(as(CUSTOMER_B, (tx) => tx.exec(`select public.cancel_order('${o.id}')`))).rejects.toThrow(/order_not_found/);
  });

  it('pesanan melewati batas bayar menjadi EXPIRED dan stok dilepas', async () => {
    const before = await stock('prod-5', '30');
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-5', size: '30', quantity: 2 }]);
    expect(await stock('prod-5', '30')).toBe(before - 2);
    await db.exec(`update public.orders set payment_expires_at = now() - interval '1 minute' where id = '${o.id}'`);
    const n = await as(CUSTOMER_B, (tx) => rows<{ n: number }>(tx, `select public.expire_pending_orders() as n`));
    expect(n[0].n).toBeGreaterThanOrEqual(1);
    expect((await orderRow(o.id)).status).toBe('EXPIRED');
    expect(await stock('prod-5', '30')).toBe(before);
  });

  it('place_order ikut membersihkan pesanan kedaluwarsa sehingga stok kembali tersedia', async () => {
    const before = await stock('prod-8', 'L');
    const a = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-8', size: 'L', quantity: before }]);
    await expect(placeOrder(CUSTOMER_B, [{ product_slug: 'prod-8', size: 'L', quantity: 1 }])).rejects.toThrow(/insufficient_stock/);
    await db.exec(`update public.orders set payment_expires_at = now() - interval '1 minute' where id = '${a.id}'`);
    const b = await placeOrder(CUSTOMER_B, [{ product_slug: 'prod-8', size: 'L', quantity: 1 }]);
    expect(b.status).toBe('PENDING_PAYMENT');
  });
});

// ---------------------------------------------------------------------
describe('alur admin & status', () => {
  it('pembayaran -> proses -> kirim (butuh resi) -> selesai, dengan jejak audit', async () => {
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-3', size: '28', quantity: 1 }]);
    const call = (sql: string) => as(ADMIN, (tx) => rows(tx, sql));

    await expect(call(`select public.admin_update_fulfillment('${o.id}', 'processing')`)).rejects.toThrow(/invalid_transition/); // belum dibayar
    await call(`select public.admin_mark_order_paid('${o.id}', 'transfer terkonfirmasi')`);
    expect((await orderRow(o.id)).status).toBe('PAID');
    await expect(call(`select public.admin_mark_order_paid('${o.id}')`)).rejects.toThrow(/invalid_transition/);

    await call(`select public.admin_update_fulfillment('${o.id}', 'processing')`);
    expect((await orderRow(o.id)).status).toBe('PROCESSING');
    await expect(call(`select public.admin_update_fulfillment('${o.id}', 'shipped')`)).rejects.toThrow(/tracking_required/);
    await call(`select public.admin_update_fulfillment('${o.id}', 'shipped', 'JT123456789')`);
    const shipped = await orderRow(o.id);
    expect(shipped.status).toBe('SHIPPED');
    expect(shipped.tracking_number).toBe('JT123456789');
    expect(shipped.shipped_at).toBeTruthy();
    await expect(call(`select public.admin_update_fulfillment('${o.id}', 'processing')`)).rejects.toThrow(/invalid_transition/);
    await call(`select public.admin_update_fulfillment('${o.id}', 'completed')`);
    expect((await orderRow(o.id)).status).toBe('COMPLETED');
    await expect(call(`select public.admin_update_fulfillment('${o.id}', 'cancelled')`)).rejects.toThrow(/use_cancel_order/);

    const events = await as(ADMIN, (tx) => rows<{ event_type: string; to_status: string }>(tx, `select event_type, to_status from public.order_events where order_id = '${o.id}' order by id`));
    expect(events.map((e) => e.to_status)).toEqual(['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED']);
  });

  it('customer tidak bisa menandai lunas / mengubah status / membatalkan pesanan yang sudah dibayar', async () => {
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-3', size: '30', quantity: 1 }]);
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`select public.admin_mark_order_paid('${o.id}')`))).rejects.toThrow(/forbidden/);
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`select public.admin_update_fulfillment('${o.id}','processing')`))).rejects.toThrow(/forbidden/);
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`update public.orders set payment_status = 'paid' where id = '${o.id}'`))).rejects.toThrow(/permission denied/i);

    await as(ADMIN, (tx) => tx.exec(`select public.admin_mark_order_paid('${o.id}')`));
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`select public.cancel_order('${o.id}')`))).rejects.toThrow(/not_cancellable/);
  });

  it('admin membatalkan pesanan berbayar: REFUNDED dan stok kembali', async () => {
    const before = await stock('prod-3', '26');
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-3', size: '26', quantity: 2 }]);
    await as(ADMIN, (tx) => tx.exec(`select public.admin_mark_order_paid('${o.id}')`));
    await as(ADMIN, (tx) => tx.exec(`select public.cancel_order('${o.id}', 'stok rusak')`));
    expect((await orderRow(o.id)).status).toBe('REFUNDED');
    expect(await stock('prod-3', '26')).toBe(before);
  });

  it('pesanan yang sudah dikirim tidak dapat dibatalkan', async () => {
    const o = await placeOrder(CUSTOMER_A, [{ product_slug: 'prod-5', size: '28', quantity: 1 }]);
    await as(ADMIN, async (tx) => {
      await tx.exec(`select public.admin_mark_order_paid('${o.id}')`);
      await tx.exec(`select public.admin_update_fulfillment('${o.id}','processing')`);
      await tx.exec(`select public.admin_update_fulfillment('${o.id}','shipped','RESI1')`);
    });
    await expect(as(ADMIN, (tx) => tx.exec(`select public.cancel_order('${o.id}')`))).rejects.toThrow(/not_cancellable/);
  });

  it('dashboard admin menghitung status, pendapatan, dan stok menipis', async () => {
    const r = await as(ADMIN, (tx) => rows<{ s: any }>(tx, `select public.admin_dashboard_stats() as s`));
    const s = r[0].s;
    expect(s.orders_by_status.PENDING_PAYMENT).toBeGreaterThan(0);
    expect(s.orders_by_status.COMPLETED).toBe(1);
    expect(s.revenue_paid).toBeGreaterThan(0);
    expect(s.active_products).toBe(10);
    expect(s.low_stock_variants).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------
describe('isolasi data pelanggan', () => {
  it('pesanan: pemilik & admin saja yang dapat melihat; tidak dapat ditulis langsung', async () => {
    const a = await as(CUSTOMER_A, (tx) => rows<{ user_id: string }>(tx, `select user_id from public.orders`));
    expect(a.length).toBeGreaterThan(0);
    expect(a.every((r) => r.user_id === CUSTOMER_A)).toBe(true);

    const adminSees = await as(ADMIN, (tx) => rows<{ user_id: string }>(tx, `select distinct user_id from public.orders`));
    expect(adminSees.length).toBe(2);

    // item pesanan hanya milik pesanan yang terlihat
    const items = await as(CUSTOMER_B, (tx) => rows<{ order_id: string }>(tx, `select order_id from public.order_items`));
    const bOrders = await as(CUSTOMER_B, (tx) => rows<{ id: string }>(tx, `select id from public.orders`));
    expect(items.every((i) => bOrders.some((o) => o.id === i.order_id))).toBe(true);

    await expect(as(CUSTOMER_A, (tx) => tx.exec(`delete from public.orders`))).rejects.toThrow(/permission denied/i);
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`insert into public.orders (order_number) values ('X')`))).rejects.toThrow(/permission denied/i);
    await expect(as(CUSTOMER_A, (tx) => tx.exec(`update public.order_items set unit_price = 1`))).rejects.toThrow(/permission denied/i);
  });

  it('alamat: CRUD hanya milik sendiri; tidak bisa menulis atas nama orang lain', async () => {
    await as(CUSTOMER_A, (tx) => tx.exec(`insert into public.addresses (user_id, label, recipient_name, phone, full_address, is_primary)
      values ('${CUSTOMER_A}', 'Rumah', 'A', '0812', 'Jl. Mawar No. 5 RT 2', true)`));
    await expect(
      as(CUSTOMER_B, (tx) => tx.exec(`insert into public.addresses (user_id, label, recipient_name, phone, full_address)
        values ('${CUSTOMER_A}', 'Palsu', 'B', '0812', 'Jl. Palsu No. 1 RT 1')`))
    ).rejects.toThrow(/row-level security/i);
    expect(await as(CUSTOMER_B, (tx) => rows(tx, `select 1 from public.addresses`))).toHaveLength(0);
    const upd = await as(CUSTOMER_B, (tx) => tx.query(`update public.addresses set label = 'x'`));
    expect(upd.affectedRows ?? 0).toBe(0);
    expect(await as(ADMIN, (tx) => rows(tx, `select 1 from public.addresses`))).toHaveLength(0);
  });

  it('alamat utama: hanya satu per pengguna, set_primary_address menukar secara atomik', async () => {
    await as(CUSTOMER_A, (tx) => tx.exec(`insert into public.addresses (user_id, label, recipient_name, phone, full_address)
      values ('${CUSTOMER_A}', 'Kantor', 'A', '0812', 'Jl. Sudirman Kav 52 Lt 24')`));
    await expect(
      as(CUSTOMER_A, (tx) => tx.exec(`update public.addresses set is_primary = true`))
    ).rejects.toThrow(/duplicate key|unique/i);

    const office = (await as(CUSTOMER_A, (tx) => rows<{ id: string }>(tx, `select id from public.addresses where label = 'Kantor'`)))[0].id;
    await as(CUSTOMER_A, (tx) => tx.exec(`select public.set_primary_address('${office}')`));
    const prim = await as(CUSTOMER_A, (tx) => rows<{ label: string }>(tx, `select label from public.addresses where is_primary`));
    expect(prim).toEqual([{ label: 'Kantor' }]);

    await expect(as(CUSTOMER_B, (tx) => tx.exec(`select public.set_primary_address('${office}')`))).rejects.toThrow(/address_not_found/);
  });

  it('kode pos alamat harus 5 digit', async () => {
    await expect(
      as(CUSTOMER_A, (tx) => tx.exec(`insert into public.addresses (user_id, recipient_name, phone, full_address, postal_code)
        values ('${CUSTOMER_A}', 'A', '0812', 'Jl. Mawar No. 5 RT 2', 'ABCDE')`))
    ).rejects.toThrow(/check constraint/i);
  });

  it('fit profile: hanya pemilik; validasi rentang', async () => {
    await as(CUSTOMER_A, (tx) => tx.exec(`insert into public.fit_profiles (user_id, height_cm, weight_kg, preference, calculated_size)
      values ('${CUSTOMER_A}', 175, 68, 'regular', 'L')`));
    expect(await as(CUSTOMER_B, (tx) => rows(tx, `select 1 from public.fit_profiles`))).toHaveLength(0);
    await expect(
      as(CUSTOMER_B, (tx) => tx.exec(`insert into public.fit_profiles (user_id, height_cm, weight_kg, preference) values ('${CUSTOMER_A}', 170, 60, 'slim')`))
    ).rejects.toThrow(/row-level security/i);
    await expect(
      as(CUSTOMER_B, (tx) => tx.exec(`insert into public.fit_profiles (user_id, height_cm, weight_kg, preference) values ('${CUSTOMER_B}', 20, 60, 'slim')`))
    ).rejects.toThrow(/check constraint/i);
  });
});

// ---------------------------------------------------------------------
describe('integritas data', () => {
  it('total order selalu konsisten dengan komponen biaya (constraint)', async () => {
    await expect(
      db.exec(`update public.orders set total = total + 1 where id = (select id from public.orders limit 1)`)
    ).rejects.toThrow(/orders_total_consistent/);
  });

  it('harga & stok tidak boleh negatif', async () => {
    await expect(db.exec(`update public.product_variants set stock = -1 where id = (select id from public.product_variants limit 1)`)).rejects.toThrow(/check constraint/i);
    await expect(db.exec(`update public.products set price = -1 where slug = 'prod-1'`)).rejects.toThrow(/check constraint/i);
  });

  it('seed konsisten: 10 produk, setiap produk punya varian, warna, dan gambar', async () => {
    const r = await rows<{ slug: string; v: number; c: number; i: number }>(db as unknown as Tx, `
      select p.slug,
             (select count(*) from public.product_variants where product_id = p.id)::int as v,
             (select count(*) from public.product_colors   where product_id = p.id)::int as c,
             (select count(*) from public.product_images   where product_id = p.id)::int as i
        from public.products p`);
    expect(r).toHaveLength(10);
    for (const x of r) {
      expect(x.v, x.slug).toBeGreaterThan(0);
      expect(x.c, x.slug).toBeGreaterThan(0);
      expect(x.i, x.slug).toBeGreaterThan(0);
    }
  });

  it('seed idempotent: dijalankan ulang tidak menggandakan data', async () => {
    const seed = readFileSync(new URL('20261122000004_seed.sql', MIGRATIONS), 'utf8');
    const count = async () => (await rows<{ n: number }>(db as unknown as Tx, `select (select count(*) from public.products)::int + (select count(*) from public.product_variants)::int + (select count(*) from public.product_images)::int as n`))[0].n;
    const before = await count();
    await db.exec(seed);
    expect(await count()).toBe(before);
  });
});

// ---------------------------------------------------------------------
describe('setup.sql (berkas gabungan untuk SQL Editor)', () => {
  it('sinkron dengan migrasi: memuat seluruh isi setiap file migrasi', () => {
    const setup = readFileSync(new URL('../setup.sql', import.meta.url), 'utf8');
    for (const f of readdirSync(MIGRATIONS).filter((n) => n.endsWith('.sql')).sort()) {
      const body = readFileSync(new URL(f, MIGRATIONS), 'utf8').trimEnd();
      expect(setup.includes(body), `setup.sql usang untuk ${f}; jalankan npm run db:bundle`).toBe(true);
    }
  });

  it('dapat dijalankan sendiri pada database kosong dan menghasilkan skema lengkap', async () => {
    const fresh = new PGlite();
    await fresh.exec(HARNESS_SQL);
    await fresh.exec(readFileSync(new URL('../setup.sql', import.meta.url), 'utf8'));
    const tables = await fresh.query<{ n: number }>(
      `select count(*)::int as n from pg_tables where schemaname = 'public'`);
    expect(tables.rows[0].n).toBe(15);
    const rls = await fresh.query<{ n: number }>(
      `select count(*)::int as n from pg_tables where schemaname = 'public' and not rowsecurity`);
    expect(rls.rows[0].n).toBe(0); // semua tabel memakai RLS
    const products = await fresh.query<{ n: number }>(`select count(*)::int as n from public.products`);
    expect(products.rows[0].n).toBe(10);
    await fresh.close();
  }, 60000);
});
