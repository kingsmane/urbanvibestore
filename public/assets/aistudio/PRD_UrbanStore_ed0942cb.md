# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## UrbanStore --- Curated Fashion E-Commerce Web App

  Informasi            Detail
  -------------------- ---------------------------------------
  Produk               UrbanStore
  Dokumen              Product Requirements Document
  Versi                1.0
  Status               Draft untuk validasi dan pengembangan
  Tanggal              16 November 2026
  Platform             Responsive Web App
  Target pengguna      Pria dan wanita usia 18--30 tahun
  Bahasa & mata uang   Bahasa Indonesia; IDR (Rp)

------------------------------------------------------------------------

## 1. Ringkasan Produk

UrbanStore adalah online store fashion pria dan wanita yang menyajikan
katalog terkurasi, informasi ukuran yang jelas, serta proses belanja
mobile yang ringkas. Produk ditampilkan dengan visual yang kuat,
informasi harga dan stok yang transparan, dan navigasi yang membantu
pengguna menemukan outfit tanpa harus menelusuri katalog yang terlalu
luas.

Pengalaman visual menggabungkan **Swiss minimalism** dan **Japanese
design**: tata letak terstruktur, ruang kosong yang lega, tipografi
tegas, fotografi editorial, palet monokrom, serta aksen lemon-lime yang
digunakan secara selektif.

### 1.1 Pernyataan masalah

-   Pengguna sulit menemukan produk yang sesuai gaya, kategori, dan
    anggaran ketika katalog terlalu padat.
-   Informasi ukuran sering tidak cukup jelas sehingga meningkatkan
    keraguan dan risiko salah ukuran.
-   Checkout yang panjang atau membingungkan menyebabkan pengguna
    meninggalkan keranjang.
-   Informasi stok, biaya, dan ringkasan pesanan yang tidak transparan
    menurunkan kepercayaan.

### 1.2 Visi

Menjadi destinasi fashion online terkurasi yang membuat pengguna lebih
cepat menemukan gaya yang tepat, memahami ukuran, dan menyelesaikan
pembelian dengan percaya diri.

### 1.3 Tujuan produk

1.  Memudahkan pengguna menemukan outfit stylish tanpa tersesat di
    katalog.
2.  Menyediakan panduan ukuran visual yang jelas, konsisten, dan dapat
    dipercaya.
3.  Memungkinkan checkout mobile yang cepat, transparan, dan minim
    hambatan.

### 1.4 Indikator keberhasilan

Target berikut merupakan **target awal untuk diuji**, bukan baseline
yang sudah terbukti.

  ------------------------------------------------------------------------
  Metrik                                 Target awal Cara ukur
  --------------------- ---------------------------- ---------------------
  Waktu muat katalog         \< 2 detik pada kondisi Performance
                          jaringan dan perangkat uji monitoring / Web
                                     yang disepakati Vitals

  Product detail to                             ≥ 8% Event analytics
  add-to-cart rate                                   

  Cart to                                      ≥ 50% Funnel analytics
  checkout-start rate                                

  Checkout completion       ≥ 60% dari checkout yang Funnel analytics
  rate                                       dimulai 

  Error validasi                 \< 5% sesi checkout Form/error analytics
  checkout                                           

  Penggunaan size guide    Dipantau dan ditingkatkan Event analytics
                                  melalui eksperimen 

  Mobile usability          Tidak ada blocker kritis QA dan usability
                            pada perangkat uji utama testing
  ------------------------------------------------------------------------

Metrik harus ditinjau setelah tersedia data trafik dan transaksi yang
memadai. Jangan menganggap target sebagai jaminan hasil.

------------------------------------------------------------------------

## 2. Target Pengguna dan Kebutuhan

### 2.1 Segmen utama

-   Usia 18--30 tahun.
-   Belanja fashion terutama melalui smartphone.
-   Mengutamakan tampilan produk, harga yang masuk akal, kemudahan
    menemukan gaya, dan informasi ukuran.
-   Mengharapkan pengalaman cepat, visual, transparan, dan familiar.

### 2.2 Persona ringkas

**Naya --- mobile-first shopper** - Ingin menemukan outfit yang cocok
untuk aktivitas harian. - Tidak ingin menghabiskan waktu membuka terlalu
banyak produk. - Membutuhkan foto yang representatif dan panduan ukuran
yang mudah dipahami.

**Raka --- value-conscious shopper** - Membandingkan harga dan tampilan
sebelum membeli. - Ingin tahu apakah ukuran dan produk tersedia. - Tidak
ingin terkejut oleh biaya tambahan saat checkout.

### 2.3 Jobs to be Done

-   Ketika mencari pakaian, pengguna ingin memfilter katalog agar
    pilihan relevan lebih cepat ditemukan.
-   Ketika mempertimbangkan produk, pengguna ingin memahami ukuran dan
    detail produk sebelum memasukkannya ke keranjang.
-   Ketika siap membeli, pengguna ingin menyelesaikan checkout tanpa
    membuat akun atau mengisi informasi berulang, jika kebijakan bisnis
    memungkinkan.

------------------------------------------------------------------------

## 3. Ruang Lingkup Produk

### 3.1 In Scope --- MVP

1.  Homepage dan promotional banner.
2.  Katalog kurasi dan grid responsif.
3.  Pencarian produk dasar.
4.  Filter kategori Pria dan Wanita.
5.  Product detail dan visual size guide.
6.  Shopping cart: tambah, ubah qty, hapus, subtotal.
7.  Checkout 3 langkah.
8.  Validasi formulir dan ringkasan biaya.
9.  Order confirmation.
10. Status stok dan penanganan produk habis.
11. Layout responsif dan aksesibilitas dasar.
12. Analytics event dasar untuk funnel belanja.

### 3.2 Out of Scope --- MVP

-   Aplikasi native iOS/Android.
-   Program loyalty, poin, referral, dan membership.
-   Ulasan produk dan rating pengguna.
-   Wishlist lintas perangkat.
-   Live chat dan chatbot.
-   Personalisasi berbasis machine learning.
-   Multi-vendor marketplace.
-   Langganan produk.
-   Pengelolaan gudang multi-lokasi yang kompleks.
-   Dashboard ERP/akuntansi penuh.

Fitur di luar scope dapat dipertimbangkan setelah validasi MVP dan tidak
boleh menghambat alur pembelian inti.

------------------------------------------------------------------------

## 4. Prinsip Pengalaman dan Desain

### 4.1 Arah visual

-   **Warna utama:** hitam, putih, dan abu-abu netral.
-   **Aksen:** lemon-lime untuk CTA, highlight, atau status penting;
    jangan digunakan untuk seluruh elemen.
-   **Tipografi:** sans-serif modern dengan hierarki tegas dan ukuran
    yang mudah dibaca.
-   **Layout:** grid rapi, whitespace luas, garis pemisah tipis,
    komposisi editorial.
-   **Fotografi:** foto produk konsisten, detail bahan, tampak
    depan/belakang, dan foto pemakaian jika tersedia.
-   **Copywriting:** singkat, percaya diri, conversational, dan Gen
    Z-friendly tanpa berlebihan.

Contoh microcopy: - Hero: "Find your everyday fit." - CTA: "Shop the
drop" - Empty cart: "Keranjang masih kosong. Saatnya cari fit baru." -
Stock status: "Habis" - Size guide: "Cek ukuran dulu. Biar fit-nya
pas." - Checkout CTA: "Lanjut checkout"

### 4.2 Prinsip UX

1.  Mobile-first, bukan sekadar desktop yang diperkecil.
2.  Harga, varian, ukuran, dan status stok harus terlihat sebelum
    pengguna mengambil keputusan.
3.  Jangan menyembunyikan biaya yang sudah diketahui sampai langkah
    terakhir.
4.  Pertahankan isi keranjang saat pengguna berpindah halaman atau
    memuat ulang halaman.
5.  Berikan feedback langsung setelah aksi tambah ke keranjang atau
    perubahan qty.
6.  Jangan mengandalkan warna saja untuk menyampaikan status.
7.  Hindari pop-up promosi yang menghalangi aktivitas belanja.

------------------------------------------------------------------------

## 5. Struktur Informasi dan Navigasi

### 5.1 Sitemap

``` text
UrbanStore
├── Home
├── Shop / Catalog
│   ├── All Products
│   ├── Men
│   └── Women
├── Product Detail
│   └── Size Guide
├── Shopping Cart
├── Checkout
│   ├── Step 1: Contact & Delivery
│   ├── Step 2: Shipping
│   └── Step 3: Payment & Review
├── Order Confirmation
└── Utility
    ├── Search
    └── Empty / Error States
```

### 5.2 Navigasi utama

-   Logo UrbanStore menuju homepage.
-   Shop / kategori.
-   Search.
-   Cart dengan jumlah item.
-   Navigasi mobile dapat menggunakan header ringkas dan bottom
    navigation bila hasil usability test menunjukkan manfaat.

------------------------------------------------------------------------

## 6. Persyaratan Fungsional

Prioritas menggunakan MoSCoW: **Must** wajib untuk MVP, **Should**
penting tetapi dapat menyusul, **Could** opsional.

### 6.1 Homepage & Banner

  -----------------------------------------------------------------------
  ID                Persyaratan       Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  HOME-01           Menampilkan       Must              Banner memiliki
                    hero/banner utama                   gambar, headline,
                                                        dan CTA yang
                                                        dapat diarahkan
                                                        ke katalog atau
                                                        koleksi

  HOME-02           Menampilkan       Must              Kedua kategori
                    kategori Pria dan                   dapat dibuka
                    Wanita                              melalui navigasi
                                                        yang jelas

  HOME-03           Menampilkan       Must              Produk berasal
                    produk                              dari data katalog
                    pilihan/terbaru                     aktif

  HOME-04           Menampilkan CTA   Must              CTA mengarahkan
                    menuju katalog                      pengguna ke
                                                        halaman yang
                                                        relevan

  HOME-05           Menampilkan       Must              Jumlah item cart
                    header dan cart                     diperbarui
                    indicator                           setelah perubahan
                                                        keranjang
  -----------------------------------------------------------------------

### 6.2 Katalog Kurasi

  -----------------------------------------------------------------------
  ID                Persyaratan       Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  CAT-01            Menampilkan       Must              Grid menyesuaikan
                    produk dalam                        lebar layar tanpa
                    responsive grid                     horizontal
                                                        overflow

  CAT-02            Kartu produk      Must              Informasi inti
                    menampilkan foto,                   tampil konsisten
                    nama, harga, dan                    
                    kategori                            

  CAT-03            Filter kategori   Must              Hasil hanya
                    Pria/Wanita                         menampilkan
                                                        kategori yang
                                                        dipilih

  CAT-04            Pencarian         Should            Hasil relevan
                    berdasarkan nama                    atau empty state
                    produk                              ditampilkan

  CAT-05            Produk tanpa stok Must              Status terlihat
                    menampilkan badge                   pada kartu dan
                    "Habis"                             detail produk

  CAT-06            Produk habis      Must              Tombol
                    tidak dapat                         add-to-cart
                    ditambahkan ke                      nonaktif dan
                    cart                                alasan dijelaskan

  CAT-07            Sorting           Should            Urutan hasil
                    harga/terbaru                       berubah sesuai
                                                        pilihan

  CAT-08            Loading, empty,   Must              Pengguna mendapat
                    dan error state                     feedback dan
                                                        tindakan lanjutan
  -----------------------------------------------------------------------

**Aturan katalog:** - Produk yang tidak aktif tidak ditampilkan ke
publik. - Harga ditampilkan dalam Rupiah dengan format konsisten. - Jika
ada harga diskon, harga awal dan harga jual dibedakan dengan jelas. -
Filter kategori tidak boleh menghapus kata pencarian yang sedang
digunakan. - Untuk katalog besar, gunakan pagination atau infinite
loading dengan aksesibilitas yang memadai.

### 6.3 Product Detail & Size Guide

  -----------------------------------------------------------------------
  ID                Persyaratan       Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  PDP-01            Menampilkan       Must              Pengguna dapat
                    galeri foto                         melihat foto
                    produk                              utama dan foto
                                                        tambahan

  PDP-02            Menampilkan nama, Must              Informasi produk
                    harga, kategori,                    terbaca jelas
                    deskripsi                           

  PDP-03            Menampilkan       Must              Ukuran tersedia
                    pilihan                             dapat dipilih
                    ukuran/varian                       

  PDP-04            Menampilkan size  Must              Tabel/diagram
                    guide visual                        memuat satuan dan
                                                        cara mengukur

  PDP-05            Menampilkan stok  Must              Ukuran yang habis
                    per varian ukuran                   tidak dapat
                                                        dipilih

  PDP-06            Add to cart dari  Must              Sistem
                    halaman detail                      memvalidasi
                                                        ukuran dan stok
                                                        sebelum menambah

  PDP-07            Feedback setelah  Must              Ada konfirmasi
                    add to cart                         dan akses ke cart

  PDP-08            Rekomendasi       Could             Ditampilkan jika
                    perawatan/bahan                     data tersedia
  -----------------------------------------------------------------------

**Standar size guide:** - Gunakan satuan cm secara default. - Jelaskan
apakah ukuran merupakan ukuran tubuh atau ukuran pakaian. - Tampilkan
ilustrasi titik ukur (misalnya chest, shoulder, length, waist, hip,
inseam sesuai jenis produk). - Berikan instruksi cara mengukur. -
Tampilkan toleransi ukuran jika ada, misalnya ±1--2 cm, hanya jika benar
berdasarkan proses produksi. - Sediakan catatan fit seperti slim,
regular, atau oversized. - Jangan mengarang rekomendasi ukuran tubuh
jika data produk tidak mendukungnya.

### 6.4 Shopping Cart

  -----------------------------------------------------------------------
  ID                Persyaratan       Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  CART-01           Menambahkan       Must              Item tersimpan
                    produk dan varian                   dengan product,
                    ke cart                             variant/size,
                                                        qty, dan harga
                                                        saat ditambahkan

  CART-02           Mengubah qty      Must              Subtotal dihitung
                                                        ulang setelah
                                                        perubahan

  CART-03           Menghapus item    Must              Item hilang dan
                                                        ringkasan biaya
                                                        diperbarui

  CART-04           Menampilkan       Must              Subtotal = jumlah
                    subtotal                            harga item × qty

  CART-05           Menampilkan       Must              Nama, foto,
                    ringkasan item                      ukuran/varian,
                                                        qty, dan harga
                                                        terlihat

  CART-06           Mempertahankan    Must              Cart tetap
                    cart                                tersedia setelah
                                                        refresh sesuai
                                                        strategi
                                                        penyimpanan

  CART-07           Validasi stok     Must              Qty tidak boleh
                    ulang                               melebihi stok
                                                        terkini

  CART-08           Empty cart state  Must              Ada pesan dan CTA
                                                        kembali belanja
  -----------------------------------------------------------------------

**Aturan bisnis cart:** - Item yang sama dengan varian/ukuran yang sama
dapat digabung dalam satu baris. - Varian berbeda harus menjadi baris
terpisah. - Qty minimum adalah 1. - Qty maksimum tidak boleh melebihi
stok yang tersedia dan batas pembelian jika ada. - Harga di client hanya
untuk tampilan; server menghitung ulang harga saat checkout. - Perubahan
stok atau harga harus diinformasikan sebelum order dibuat.

### 6.5 Checkout 3 Langkah

**Step 1 --- Kontak & alamat pengiriman** - Nama penerima. - Email. -
Nomor telepon. - Alamat lengkap. - Provinsi, kota/kabupaten, kecamatan,
kode pos (opsi pemilihan wilayah mengikuti layanan logistik yang
dipakai).

**Step 2 --- Pengiriman** - Pilihan layanan pengiriman yang tersedia. -
Estimasi biaya dan estimasi waktu jika disediakan provider. - Validasi
area layanan. - Ringkasan alamat dan item.

**Step 3 --- Pembayaran & review** - Pilihan metode pembayaran yang
benar-benar terintegrasi. - Ringkasan item, subtotal, ongkir, diskon
(jika ada), dan total. - Persetujuan syarat pembelian/kebijakan yang
relevan. - Tombol buat pesanan/bayar.

  ------------------------------------------------------------------------
  ID                Persyaratan       Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- ------------------
  CHK-01            Checkout terdiri  Must              Progress indicator
                    dari tiga langkah                   menunjukkan
                                                        langkah aktif

  CHK-02            Validasi input    Must              Error ditampilkan
                    per langkah                         dekat field
                                                        terkait

  CHK-03            Data langkah      Must              Kembali ke langkah
                    sebelumnya tetap                    sebelumnya tidak
                    tersimpan                           menghapus input

  CHK-04            Ringkasan biaya   Must              Semua komponen
                    transparan                          biaya ditampilkan
                                                        sebelum konfirmasi

  CHK-05            Validasi stok dan Must              Order tidak dibuat
                    harga di server                     dengan harga/stok
                                                        usang

  CHK-06            Mencegah double   Must              Klik berulang
                    submission                          tidak membuat
                                                        pesanan ganda

  CHK-07            Pembayaran        Must untuk        Status pembayaran
                    melalui provider  transaksi online  diverifikasi
                                                        melalui
                                                        callback/webhook
                                                        provider

  CHK-08            Guest checkout    Should            Pengguna dapat
                                                        membeli tanpa
                                                        membuat akun jika
                                                        kebijakan bisnis
                                                        mengizinkan
  ------------------------------------------------------------------------

**Catatan penting:** "1-click cart" dapat berarti satu aksi untuk
menambahkan item ke keranjang. Itu berbeda dari pembayaran satu klik.
Pembayaran tetap membutuhkan konfirmasi, validasi stok, alamat, biaya,
dan otorisasi payment provider.

### 6.6 Order Confirmation

  -----------------------------------------------------------------------
  ID                Persyaratan       Prioritas         Kriteria
                                                        penerimaan
  ----------------- ----------------- ----------------- -----------------
  ORD-01            Menampilkan nomor Must              Nomor unik dibuat
                    pesanan                             oleh server

  ORD-02            Menampilkan       Must              Item, qty, harga,
                    ringkasan pesanan                   alamat,
                                                        pengiriman, dan
                                                        total sesuai
                                                        order

  ORD-03            Menampilkan       Must              Status berasal
                    status pembayaran                   dari hasil
                                                        verifikasi
                                                        server/provider

  ORD-04            Menampilkan       Must              Pengguna tahu
                    instruksi                           apakah perlu
                    berikutnya                          membayar atau
                                                        menunggu proses

  ORD-05            Mengirim          Should            Hanya jika kanal
                    konfirmasi                          dan provider
                    email/WhatsApp                      telah
                                                        dikonfigurasi
  -----------------------------------------------------------------------

Order confirmation tidak boleh menyatakan pembayaran berhasil hanya
karena pengguna kembali ke halaman sukses. Status harus berasal dari
verifikasi backend.

------------------------------------------------------------------------

## 7. Alur Pengguna Utama

### 7.1 Discovery sampai pembelian

``` text
Homepage
  → Pilih kategori / Search
  → Katalog
  → Product Detail
  → Pilih ukuran
  → Buka Size Guide (jika diperlukan)
  → Add to Cart
  → Shopping Cart
  → Checkout Step 1: Kontak & alamat
  → Checkout Step 2: Pengiriman
  → Checkout Step 3: Pembayaran & review
  → Verifikasi pembayaran
  → Order Confirmation
```

### 7.2 Skenario stok habis

``` text
Pengguna membuka produk
  → Sistem memuat stok varian terkini
  → Varian habis ditandai dan tidak dapat dipilih
  → Add to Cart dinonaktifkan jika tidak ada varian tersedia
  → Pengguna mendapat informasi dan dapat kembali ke katalog
```

### 7.3 Skenario stok berubah saat checkout

``` text
Pengguna melanjutkan checkout
  → Backend memvalidasi ulang stok dan harga
  → Jika tersedia: lanjut membuat order
  → Jika tidak tersedia/berubah: hentikan proses
  → Tampilkan item yang bermasalah dan opsi memperbarui cart
```

------------------------------------------------------------------------

## 8. Aturan Bisnis dan Perhitungan

### 8.1 Perhitungan cart

-   `line_subtotal = unit_price × quantity`
-   `cart_subtotal = Σ line_subtotal`
-   `order_total = cart_subtotal + shipping_fee - discount`

Pajak atau biaya lain hanya ditambahkan jika memang berlaku dan harus
ditampilkan sebagai komponen terpisah. Semua perhitungan final dilakukan
di backend menggunakan tipe numerik uang yang aman (misalnya integer
dalam satuan Rupiah), bukan floating point.

### 8.2 Harga dan stok

-   Harga produk dan stok memiliki sumber kebenaran di backend.
-   Harga yang dikirim browser tidak boleh dipercaya.
-   Stok diperiksa kembali ketika order dibuat.
-   Untuk mencegah overselling, gunakan transaksi database dan mekanisme
    reservasi/pengurangan stok yang atomik.
-   Tentukan masa berlaku reservasi stok sesuai kebijakan bisnis dan
    payment provider.
-   Order berstatus pending yang melewati batas waktu pembayaran harus
    mengikuti proses expiry dan pelepasan reservasi.

### 8.3 Status pesanan minimum

-   `PENDING_PAYMENT`
-   `PAID`
-   `PROCESSING`
-   `SHIPPED`
-   `COMPLETED`
-   `CANCELLED`
-   `EXPIRED`
-   `REFUNDED` (jika refund didukung)

Status pembayaran dan status pemenuhan pesanan sebaiknya dipisahkan agar
tidak mencampur proses finansial dengan proses pengiriman.

------------------------------------------------------------------------

## 9. Kebutuhan Non-Fungsional

  -----------------------------------------------------------------------
  Area                                Persyaratan
  ----------------------------------- -----------------------------------
  Responsive                          Mendukung mobile, tablet, dan
                                      desktop; tidak ada horizontal
                                      overflow pada viewport yang
                                      didukung

  Performance                         Target katalog \< 2 detik pada
                                      profil pengujian yang
                                      didefinisikan; optimasi gambar,
                                      caching, code splitting, dan CDN

  Accessibility                       Target WCAG 2.2 AA sejauh relevan;
                                      kontras memadai, keyboard
                                      navigation, label form, focus
                                      state, alt text

  Validation                          Pesan error spesifik, dekat field,
                                      menjelaskan cara memperbaiki

  Security                            HTTPS, validasi server-side,
                                      proteksi CSRF sesuai arsitektur,
                                      rate limiting, output encoding,
                                      secret management

  Privacy                             Minimasi data pribadi, kebijakan
                                      privasi, retensi dan penghapusan
                                      data sesuai kewajiban hukum

  Reliability                         Penanganan kegagalan
                                      jaringan/provider, retry yang aman,
                                      idempotency untuk pembuatan order

  SEO                                 Metadata produk, URL yang
                                      konsisten, sitemap, canonical URL,
                                      structured data jika sesuai

  Browser support                     Versi terbaru browser utama dan
                                      satu versi sebelumnya sebagai
                                      target awal

  Observability                       Logging terstruktur, error
                                      monitoring, dan pemantauan performa
                                      tanpa mengekspos data sensitif
  -----------------------------------------------------------------------

### 9.1 Performance budget awal

-   Gambar katalog menggunakan ukuran responsif dan format modern
    seperti WebP/AVIF jika didukung.
-   Lazy-load gambar di luar viewport.
-   Hindari mengunduh gambar resolusi penuh untuk thumbnail.
-   Kurangi JavaScript yang tidak diperlukan pada halaman katalog.
-   Ukur Core Web Vitals pada perangkat dan jaringan nyata.
-   Target \<2 detik harus menyebut metrik, lokasi, perangkat, jaringan,
    dan persentil (misalnya p75); "load time" tanpa definisi bukan
    kriteria QA yang cukup.

### 9.2 Accessibility

-   Kontras teks normal minimal 4.5:1 dan teks besar minimal 3:1.
-   Semua kontrol dapat dioperasikan dengan keyboard.
-   Focus indicator terlihat.
-   Form memiliki label yang dapat dibaca screen reader.
-   Status "Habis" tidak hanya dibedakan dengan warna.
-   Ukuran tombol sentuh nyaman pada mobile.
-   Gambar produk memiliki alt text yang menjelaskan produk, bukan kata
    kunci berulang.

------------------------------------------------------------------------

## 10. Model Data Konseptual

Skema berikut adalah model konseptual MVP, bukan migrasi database final.

### 10.1 Entitas

  -----------------------------------------------------------------------
  Entitas                 Atribut penting         Keterangan
  ----------------------- ----------------------- -----------------------
  Product                 id, slug, name,         Data produk
                          description,            
                          category_id, status     

  Category                id, name, slug          Men/ Women atau
                                                  kategori bisnis yang
                                                  ditetapkan

  ProductImage            id, product_id,         Galeri produk
                          image_url, alt_text,    
                          sort_order              

  ProductVariant          id, product_id, sku,    Varian dan stok
                          size, color, price,     
                          stock_qty, status       

  SizeGuide               id, product_id atau     Panduan ukuran
                          size_group_id,          
                          measurement_unit,       
                          fit_note                

  SizeMeasurement         id, size_guide_id,      Nilai ukuran
                          size_label,             
                          measurement_key, value  

  Cart                    id, session/user        Keranjang
                          reference, status,      
                          updated_at              

  CartItem                id, cart_id,            Item cart
                          variant_id, quantity,   
                          unit_price_snapshot     

  Customer                id, name, email, phone  Data pelanggan

  Address                 id, customer_id,        Alamat
                          recipient, address      
                          fields                  

  Order                   id, order_number,       Pesanan
                          customer_id, status,    
                          subtotal, shipping_fee, 
                          discount, total         

  OrderItem               id, order_id,           Snapshot item
                          product/variant         
                          reference, product      
                          snapshot, qty,          
                          unit_price              

  Payment                 id, order_id, provider, Pembayaran
                          provider_reference,     
                          status, amount          

  Shipment                id, order_id, courier,  Pengiriman
                          service,                
                          tracking_number, status 
  -----------------------------------------------------------------------

### 10.2 Prinsip data

-   Gunakan ID internal yang stabil dan SKU unik untuk varian.
-   Simpan snapshot nama produk, SKU, ukuran, dan harga pada `OrderItem`
    agar riwayat pesanan tidak berubah ketika katalog diperbarui.
-   Simpan harga uang sebagai integer Rupiah atau tipe decimal dengan
    presisi yang ditentukan; jangan gunakan floating point.
-   Terapkan unique constraint untuk `slug`, `sku`, dan `order_number`
    sesuai kebutuhan.
-   Catat waktu pembuatan/perubahan data.
-   Jangan menyimpan data kartu pembayaran sensitif; gunakan hosted
    checkout/tokenisasi provider pembayaran.

------------------------------------------------------------------------

## 11. Integrasi Eksternal

Integrasi yang diperlukan untuk operasional transaksi:

1.  **Payment gateway:** membuat transaksi, menerima webhook,
    memverifikasi signature, menangani status
    pending/paid/failed/expired/refund.
2.  **Shipping/logistics API:** menghitung ongkir, validasi area, dan
    tracking jika tersedia.
3.  **Email/notification provider:** konfirmasi pesanan dan notifikasi
    status.
4.  **Analytics:** mengukur view item, search, filter, add-to-cart,
    checkout start, payment result.

Provider belum ditentukan. Pemilihan harus mempertimbangkan biaya,
metode pembayaran lokal, dokumentasi, sandbox, webhook, SLA, dan
dukungan operasional.

------------------------------------------------------------------------

## 12. Keamanan dan Privasi

-   Seluruh komunikasi menggunakan HTTPS.
-   Validasi semua input di backend; validasi frontend hanya membantu
    UX.
-   Terapkan rate limiting pada login (jika ada), pencarian, pembuatan
    order, dan endpoint sensitif.
-   Gunakan CSRF protection untuk autentikasi berbasis cookie.
-   Lindungi endpoint dari IDOR dengan pemeriksaan kepemilikan resource.
-   Sanitasi/encode output untuk mencegah XSS; gunakan query
    parameterized/ORM untuk mencegah SQL injection.
-   Verifikasi signature webhook payment provider dan gunakan
    idempotency key.
-   Jangan mencatat password, token, data pembayaran sensitif, atau data
    pribadi berlebihan ke log.
-   Batasi akses admin berdasarkan role jika dashboard admin dibuat.
-   Tentukan kebijakan privasi, retensi, backup, dan prosedur insiden.

------------------------------------------------------------------------

## 13. Analytics dan Event Tracking

Event minimum:

  ---------------------------------------------------------------------------
  Event                       Trigger                 Properti penting
  --------------------------- ----------------------- -----------------------
  `view_home`                 Homepage dibuka         source, device

  `view_item_list`            Katalog dibuka          category, page

  `search`                    Pencarian dilakukan     query (hindari data
                                                      pribadi)

  `filter_category`           Filter kategori dipilih category

  `view_item`                 Detail produk dibuka    product_id, category

  `view_size_guide`           Size guide dibuka       product_id

  `select_variant`            Ukuran/varian dipilih   product_id, variant_id

  `add_to_cart`               Item berhasil           product_id, variant_id,
                              ditambahkan             quantity

  `remove_from_cart`          Item dihapus            product_id, variant_id

  `begin_checkout`            Checkout dimulai        cart_value, item_count

  `checkout_step_completed`   Langkah selesai         step

  `purchase`                  Pembayaran              order_id, total,
                              terverifikasi           currency

  `payment_failed`            Pembayaran gagal        provider,
                                                      error_category
  ---------------------------------------------------------------------------

Hindari memasukkan nama, email, nomor telepon, alamat, atau data pribadi
lain ke analytics event.

------------------------------------------------------------------------

## 14. Acceptance Criteria End-to-End

MVP dapat dipertimbangkan siap rilis jika seluruh skenario kritis
berikut lulus:

1.  Pengunjung membuka homepage di mobile dan desktop tanpa layout
    rusak.
2.  Pengunjung dapat membuka katalog Pria dan Wanita.
3.  Filter menampilkan hasil yang sesuai kategori.
4.  Kartu produk menampilkan foto, nama, harga, kategori, dan badge
    "Habis" bila relevan.
5.  Produk habis tidak dapat ditambahkan ke keranjang.
6.  Pengguna dapat memilih varian/ukuran yang tersedia dan membaca size
    guide.
7.  Add-to-cart menambahkan varian dan qty yang benar.
8.  Pengguna dapat mengubah qty dan menghapus item; subtotal selalu
    konsisten.
9.  Cart tetap ada setelah refresh sesuai kebijakan sesi.
10. Checkout memiliki tiga langkah dan mempertahankan input saat
    berpindah langkah.
11. Error validasi menyebutkan field dan cara memperbaikinya.
12. Backend menghitung ulang harga, ongkir, diskon, dan total.
13. Stok divalidasi ulang sebelum order dikonfirmasi.
14. Klik submit berulang tidak membuat order ganda.
15. Pembayaran hanya ditandai berhasil setelah webhook/provider
    diverifikasi.
16. Halaman konfirmasi menampilkan nomor dan ringkasan order yang benar.
17. Keyboard navigation, focus, label, dan kontras diuji.
18. Tidak ada defect severity blocker/critical yang terbuka.

------------------------------------------------------------------------

## 15. Risiko dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                  Dampak                  Mitigasi
  ----------------------- ----------------------- -----------------------
  Informasi ukuran tidak  Salah ukuran dan retur  Template pengukuran
  konsisten antar produk                          baku, QA data,
                                                  foto/diagram ukuran

  Foto produk berat       Katalog lambat          Image CDN, responsive
                                                  image, kompresi, lazy
                                                  loading

  Stok berubah saat       Overselling atau order  Validasi atomik,
  checkout                gagal                   reservasi stok, expiry

  Webhook pembayaran      Status order tidak      Signature verification,
  terlambat/ganda         konsisten               idempotency,
                                                  reconciliation

  Biaya pengiriman tidak  Pengguna kehilangan     Integrasi provider dan
  akurat                  kepercayaan             tampilkan biaya sebelum
                                                  pembayaran

  Katalog terlalu luas    Discovery buruk         Kurasi koleksi, filter
                                                  sederhana, pencarian

  Checkout terlalu        Cart abandonment        Guest checkout,
  panjang                                         autofill, minimalkan
                                                  field
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 16. Rencana Rilis

### Phase 0 --- Discovery & Definition

-   Validasi target pengguna dan kebutuhan ukuran.
-   Tentukan kategori, varian, kebijakan stok, retur, pengiriman, dan
    pembayaran.
-   Pilih payment gateway dan provider logistik.
-   Buat wireframe dan prototype untuk diuji.

### Phase 1 --- MVP Commerce

-   Homepage, katalog, filter, search dasar.
-   Product detail dan size guide.
-   Cart dan checkout tiga langkah.
-   Integrasi pembayaran dan konfirmasi order.
-   Responsive, accessibility, analytics, dan security baseline.

### Phase 2 --- Optimization

-   Eksperimen UX dan funnel.
-   Sorting/filter tambahan.
-   Wishlist, review, rekomendasi, dan notifikasi bila didukung data.
-   Optimasi performa berdasarkan telemetry nyata.

### Release gates

-   Seluruh acceptance criteria Must lulus.
-   Uji pembayaran sandbox dan skenario webhook.
-   Uji stok bersamaan dan double submission.
-   Uji mobile pada perangkat nyata.
-   Kebijakan privasi, pengiriman, pembayaran, dan retur tersedia.
-   Backup, monitoring, dan prosedur support siap.

------------------------------------------------------------------------

## 17. Pertanyaan yang Harus Diputuskan Sebelum Development

PRD ini menetapkan pengalaman dan kebutuhan produk, tetapi keputusan
berikut masih perlu dikonfirmasi agar estimasi dan desain teknis tidak
dibangun berdasarkan asumsi:

1.  Apakah pembelian mendukung guest checkout atau wajib membuat akun?
2.  Payment gateway apa yang akan digunakan (misalnya Midtrans, Xendit,
    atau provider lain)?
3.  Kurir dan sumber perhitungan ongkir apa yang digunakan?
4.  Apakah harga sudah termasuk pajak dan apakah ada biaya tambahan?
5.  Bagaimana kebijakan retur, penukaran ukuran, pembatalan, dan refund?
6.  Apakah stok dikelola manual oleh admin atau tersinkron dengan sistem
    inventori?
7.  Apakah MVP membutuhkan dashboard admin untuk produk, foto, ukuran,
    stok, banner, dan pesanan?
8.  Apakah produk memiliki warna dan ukuran sebagai kombinasi varian?
9.  Apakah ada promo/voucher pada MVP?
10. Apakah target "\<2 detik" mengacu pada LCP p75, waktu respons API,
    atau metrik lain?

**Rekomendasi Product Manager:** jangan mulai dari animasi atau detail
visual. Kunci lebih dulu kualitas data produk dan size guide, aturan
stok, ongkir, pembayaran, dan kebijakan retur. Empat hal itu menentukan
apakah toko benar-benar dapat dipercaya dan menyelesaikan transaksi,
bukan sekadar terlihat bagus.

------------------------------------------------------------------------

## 18. Definition of Ready & Definition of Done

### Definition of Ready

-   User story memiliki tujuan dan acceptance criteria.
-   Desain state normal, loading, empty, error, dan disabled tersedia.
-   Data produk/varian/ukuran yang dibutuhkan tersedia.
-   Ketergantungan provider dan API terdokumentasi.
-   Aturan bisnis sudah disetujui.

### Definition of Done

-   Implementasi sesuai acceptance criteria.
-   Unit/integration test untuk aturan harga, stok, cart, order, dan
    pembayaran lulus.
-   Responsive dan accessibility smoke test lulus.
-   Tidak ada secret atau data sensitif di source code/log.
-   Analytics dan error monitoring aktif.
-   Dokumentasi operasional diperbarui.
-   Product owner menyetujui hasil pada staging.

------------------------------------------------------------------------

**Akhir Dokumen --- PRD UrbanStore v1.0**
