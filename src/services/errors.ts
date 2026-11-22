/**
 * Error dari database berformat  kode:detail1:detail2  (lihat fungsi SQL).
 * Modul ini memetakannya ke pesan Bahasa Indonesia yang aman ditampilkan.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly details: string[] = [],
    message?: string
  ) {
    super(message ?? [code, ...details].join(':'));
    this.name = 'AppError';
  }
}

const KNOWN_CODES = new Set([
  'not_authenticated',
  'forbidden',
  'invalid_request',
  'invalid_items',
  'invalid_address',
  'invalid_courier',
  'invalid_color',
  'item_unavailable',
  'insufficient_stock',
  'voucher_invalid',
  'order_not_found',
  'not_cancellable',
  'invalid_transition',
  'tracking_required',
  'use_cancel_order',
  'cannot_change_own_role',
  'user_not_found',
  'address_not_found',
]);

/** Ubah pesan error mentah (Postgres/PostgREST/Auth) menjadi AppError. */
export function toAppError(raw: unknown): AppError {
  if (raw instanceof AppError) return raw;
  const message =
    typeof raw === 'string'
      ? raw
      : raw && typeof raw === 'object' && 'message' in raw
        ? String((raw as { message: unknown }).message)
        : 'unknown';
  const [code, ...details] = message.split(':').map((s) => s.trim());
  if (KNOWN_CODES.has(code)) return new AppError(code, details);
  return new AppError('unknown', [], message);
}

const VOUCHER_REASONS: Record<string, string> = {
  not_found: 'Kode kupon tidak valid.',
  inactive: 'Kupon sudah tidak aktif.',
  not_started: 'Kupon belum dapat digunakan.',
  expired: 'Kupon sudah kedaluwarsa.',
  min_subtotal: 'Belanja Anda belum memenuhi minimum untuk kupon ini.',
  exhausted: 'Kuota kupon sudah habis.',
  user_limit: 'Kupon ini sudah Anda gunakan.',
};

export function describeVoucherReason(reason: string | null | undefined): string {
  return (reason && VOUCHER_REASONS[reason]) || 'Kode kupon tidak valid.';
}

const ADDRESS_FIELDS: Record<string, string> = {
  recipient_name: 'Nama penerima wajib diisi.',
  phone: 'Nomor telepon wajib diisi.',
  full_address: 'Alamat terlalu singkat; lengkapi dengan nomor rumah dan RT/RW.',
  postal_code: 'Kode pos harus 5 digit angka.',
};

/** Pesan untuk pengguna akhir. */
export function describeError(raw: unknown): string {
  const e = toAppError(raw);
  const [a, b, c] = e.details;
  switch (e.code) {
    case 'not_authenticated':
      return 'Sesi Anda berakhir. Silakan masuk kembali.';
    case 'forbidden':
      return 'Anda tidak memiliki izin untuk tindakan ini.';
    case 'insufficient_stock':
      return Number(c) > 0
        ? `Stok ${a} ukuran ${b} tersisa ${c}. Perbarui jumlah di keranjang.`
        : `Stok ${a} ukuran ${b} sudah habis. Hapus dari keranjang untuk melanjutkan.`;
    case 'item_unavailable':
      return `Produk ${a} ukuran ${b} sudah tidak tersedia. Hapus dari keranjang untuk melanjutkan.`;
    case 'invalid_color':
      return `Warna ${b} tidak tersedia untuk produk ${a}.`;
    case 'invalid_items':
      return 'Keranjang tidak valid atau kosong.';
    case 'invalid_address':
      return ADDRESS_FIELDS[a] ?? 'Alamat pengiriman belum lengkap.';
    case 'invalid_courier':
      return 'Layanan pengiriman tidak tersedia. Pilih layanan lain.';
    case 'voucher_invalid':
      return describeVoucherReason(a);
    case 'order_not_found':
      return 'Pesanan tidak ditemukan.';
    case 'not_cancellable':
      return 'Pesanan ini tidak dapat dibatalkan lagi.';
    case 'invalid_transition':
      return 'Perubahan status tidak diizinkan dari status pesanan saat ini.';
    case 'tracking_required':
      return 'Nomor resi wajib diisi sebelum menandai pesanan dikirim.';
    case 'use_cancel_order':
      return 'Gunakan tombol Batalkan Pesanan.';
    case 'cannot_change_own_role':
      return 'Anda tidak dapat mengubah peran akun Anda sendiri.';
    case 'user_not_found':
      return 'Pengguna tidak ditemukan.';
    default:
      return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

/** Pesan khusus form masuk/daftar (pesan asli Supabase Auth dalam bahasa Inggris). */
export function describeAuthError(raw: unknown): string {
  const msg = (typeof raw === 'string' ? raw : (raw as { message?: string } | null)?.message ?? '').toLowerCase();
  if (msg.includes('invalid login credentials')) return 'Email atau kata sandi salah.';
  if (msg.includes('email not confirmed')) return 'Email belum dikonfirmasi. Periksa kotak masuk Anda.';
  if (msg.includes('already registered') || msg.includes('already been registered') || msg === 'email_taken')
    return 'Email ini sudah terdaftar. Silakan masuk.';
  if (msg.includes('password') && (msg.includes('least') || msg.includes('weak') || msg.includes('short')))
    return 'Kata sandi terlalu lemah. Gunakan minimal 8 karakter.';
  if (msg.includes('rate limit') || msg.includes('too many'))
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
  if (msg.includes('invalid') && msg.includes('email')) return 'Format email tidak valid.';
  if (msg.includes('fetch') || msg.includes('network')) return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
  return 'Terjadi kesalahan. Silakan coba lagi.';
}
