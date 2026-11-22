# Database UrbanStore (Supabase)

Skema PostgreSQL, kebijakan keamanan (RLS), fungsi bisnis, dan data awal untuk
UrbanStore. Semua perubahan ada di `migrations/` dan diuji otomatis terhadap
Postgres sungguhan (`tests/db.test.ts`, dijalankan lewat `npm test`).

## Memasang ke project Supabase

Publishable key **tidak** dapat menjalankan DDL, jadi skema dipasang sekali lewat
dashboard:

1. Buka **Supabase Dashboard -> SQL Editor -> New query**.
2. Tempel seluruh isi [`setup.sql`](./setup.sql), lalu **Run**.
   (Atau jalankan keempat file di `migrations/` berurutan.)
3. Cek di **Table Editor**: ada 15 tabel (`products`, `orders`, `profiles`, ...).

Project harus masih kosong; skrip membuat tipe dan tabel tanpa `IF NOT EXISTS`
agar kesalahan konfigurasi terlihat. Bagian seed aman dijalankan ulang.

## Membuat admin pertama

Pendaftaran selalu menghasilkan peran **customer** (role dari klien diabaikan).
Admin pertama dibuat sekali lewat SQL Editor, setelah akunnya mendaftar:

1. Buka aplikasi -> **Daftar** dengan email admin.
2. (Jika konfirmasi email aktif) klik tautan konfirmasi di email.
3. Di SQL Editor jalankan:

```sql
update public.profiles set role = 'admin' where email = 'admin@tokoanda.com';
```

Sesudahnya, admin dapat mengangkat/menurunkan pengguna lain dari panel
**Admin -> Pengguna** (tidak dapat mengubah peran dirinya sendiri).

## Pengaturan Auth yang disarankan

Di **Authentication**:

- **Providers -> Email**: aktif (default).
- **URL Configuration**: isi *Site URL* (mis. `http://localhost:5173` untuk
  pengembangan, domain produksi nanti) dan tambahkan ke *Redirect URLs*.
- **Confirm email**: aplikasi mendukung keduanya. Aktif (default) berarti
  pendaftar harus mengklik tautan email dulu; nonaktifkan hanya untuk
  pengembangan lokal.
- Kebijakan kata sandi: aplikasi mewajibkan minimal 8 karakter; samakan atau
  perketat di **Authentication -> Policies**.

## Model data

| Tabel | Isi |
|---|---|
| `profiles` | 1:1 dengan `auth.users`; kolom `role` (`admin`/`customer`) |
| `products`, `product_variants`, `product_colors`, `product_images` | Katalog; stok per ukuran |
| `couriers`, `app_settings` | Layanan kurir, ambang gratis ongkir, biaya layanan, batas bayar |
| `vouchers`, `voucher_redemptions` | Kupon dan pemakaiannya |
| `addresses`, `fit_profiles` | Buku alamat dan profil ukuran pelanggan |
| `orders`, `order_items`, `order_events` | Pesanan (snapshot), item, dan jejak audit |
| `newsletter_subscribers` | Pendaftar newsletter |

Prinsip (mengacu PRD §6.4, §6.5, §8):

- **Uang = integer Rupiah**; `orders` punya constraint `total = subtotal + ongkir + biaya layanan - diskon`.
- **Harga, stok, kupon, dan ongkir dihitung di server** oleh `place_order()`;
  browser hanya mengirim produk, ukuran, warna, dan jumlah.
- **Stok dikurangi atomik** (baris dikunci per ukuran) dan dikembalikan saat
  pesanan dibatalkan atau kedaluwarsa. Order dengan kunci idempotensi yang sama
  tidak dibuat dua kali (klik ganda).
- **Status pembayaran dipisah dari pemenuhan**: `payment_status` +
  `fulfillment_status`; kolom `status` (generated) menggabungkannya untuk
  tampilan (`PENDING_PAYMENT`, `PAID`, `PROCESSING`, `SHIPPED`, `COMPLETED`,
  `CANCELLED`, `EXPIRED`, `REFUNDED`).

## Keamanan (RLS)

RLS aktif di semua tabel. Ringkasnya:

| Aktor | Boleh |
|---|---|
| Pengunjung (anon) | Membaca produk aktif, kurir, pengaturan; mendaftar newsletter |
| Customer | Membaca/menulis alamat & fit profile **miliknya**; membaca pesanannya; membuat/membatalkan pesanan lewat RPC |
| Admin | Membaca semua pesanan/pengguna; mengelola produk, stok, kupon; mengubah status lewat RPC |

Tabel pesanan tidak dapat ditulis langsung oleh klien: tidak ada hak
`INSERT/UPDATE/DELETE`, hanya fungsi `SECURITY DEFINER`. Kolom `profiles.role`
tidak dapat diubah klien (hak kolom + trigger anti-eskalasi).

## Yang belum ada (perlu keputusan/integrasi)

- **Payment gateway**: belum ada. Pembayaran ditandai lunas manual oleh admin
  (`Admin -> Pesanan -> Tandai Lunas`). Untuk PRD CHK-07, tambahkan webhook
  (Edge Function) yang memanggil logika yang sama dengan `admin_mark_order_paid`.
- **Kedaluwarsa pesanan**: pesanan yang lewat batas bayar dibersihkan otomatis
  setiap ada `place_order`. Agar tepat waktu, jadwalkan juga lewat `pg_cron`
  (Database -> Extensions -> `pg_cron`):

  ```sql
  select cron.schedule('expire-orders', '* * * * *', $$ select public.expire_pending_orders(); $$);
  ```
- **Email/WhatsApp transaksional** dan **gambar produk**: gambar masih URL
  eksternal bawaan; pindahkan ke Supabase Storage sebelum produksi.
- **Pembuatan produk baru** dari UI belum ada (edit harga/stok/aktif sudah).
  Produk baru dapat ditambah lewat Table Editor.

## Perintah

```bash
npm run db:seed     # buat ulang migrasi seed dari src/data/storeData.ts
npm run db:bundle   # gabungkan migrasi menjadi supabase/setup.sql
npm test            # termasuk uji skema & RLS terhadap Postgres (PGlite)
```
