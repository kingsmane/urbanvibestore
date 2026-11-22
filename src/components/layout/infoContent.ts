import type { InfoContent } from './types';

export const INFO_CONTENT: Record<string, InfoContent> = {
  'layanan-pelanggan': {
    title: 'Layanan Concierge 24/7',
    subtitle: 'Bantuan Pelanggan UrbanStore Studio',
    content: [
      'Tim kurator dan layanan pelanggan kami siap membantu Anda terkait konsultasi ukuran, perubahan alamat pengiriman sebelum resi terbit, maupun verifikasi pembayaran Virtual Account.',
      '• WhatsApp Resmi: +62 812-3456-7890 (Respon cepat < 5 menit)',
      '• Surel Concierge: concierge@urbanstore.id',
      '• Jam Operasional Gudang Cikarang & Hub Jakarta: Senin – Sabtu, 08.00 – 18.00 WIB.',
    ],
  },
  'pertanyaan-umum': {
    title: 'Pertanyaan Umum (FAQ)',
    subtitle: 'Informasi Belanja, Ukuran & Pembayaran',
    content: [
      '1. Bagaimana cara memastikan ukuran pakaian pas? Gunakan fitur Smart Fit Finder di halaman Panduan Ukuran Visual atau periksa tabel matriks dalam satuan CM.',
      '2. Berapa lama batas waktu pembayaran? Stok direservasi secara atomik selama 15 menit untuk metode QRIS dan Virtual Account.',
      '3. Kapan pesanan dikirim? Pesanan terverifikasi sebelum pukul 15.00 WIB dikirim di hari kerja yang sama.',
    ],
  },
  'kebijakan-privasi': {
    title: 'Kebijakan Privasi',
    subtitle: 'Perlindungan Data Pribadi Pelanggan',
    content: [
      'UrbanStore menerapkan prinsip minimasi data sesuai standar keamanan informasi modern. Situs diakses melalui koneksi HTTPS.',
      '• Data nama, alamat, dan nomor telepon hanya digunakan untuk pemrosesan pengiriman logistik dan notifikasi status pesanan.',
      '• Kami tidak menyimpan kredensial kartu kredit/debit; seluruh otorisasi diproses langsung melalui gerbang pembayaran terverifikasi.',
    ],
  },
  'syarat-ketentuan': {
    title: 'Syarat & Ketentuan',
    subtitle: 'Ketentuan Transaksi Resmi UrbanStore',
    content: [
      '• Seluruh harga yang tertera pada katalog dalam mata uang Rupiah (IDR) telah termasuk PPN 11%.',
      '• Produk berstatus Habis (Sold Out) tidak dapat dipesan hingga jadwal restock koleksi berikutnya.',
      '• Nomor pesanan unik diterbitkan setelah konfirmasi checkout dan divalidasi terhadap ketersediaan stok terkini.',
    ],
  },
  pengembalian: {
    title: 'Kebijakan Retur & Tukar Ukuran',
    subtitle: 'Garansi 7 Hari Bebas Biaya Ongkir Retur',
    content: [
      '• Anda berhak mengajukan penukaran ukuran (Size Guarantee) dalam 7 hari kerja sejak status paket diterima.',
      '• Syarat kondisi: Hangtag masih terpasang utuh, pakaian belum dicuci, dan bebas dari aroma parfum atau noda.',
      '• Kurir rekanan kami akan menjemput paket retur langsung ke alamat Anda tanpa biaya tambahan.',
    ],
  },
};
