import React, { useState, useEffect } from 'react';
import { Order, formatRupiah } from '../data/storeData';

interface OrderConfirmationViewProps {
  order: Order;
  onNavigateCatalog: () => void;
  onNavigateAccount: () => void;
  onMarkOrderPaid?: (orderId: string) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onNavigateCatalog,
  onNavigateAccount,
  onMarkOrderPaid,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(14 * 60 + 48);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const [activeGuide, setActiveGuide] = useState<'mobile' | 'klikbca' | 'atm'>('mobile');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleCopyRef = () => {
    navigator.clipboard?.writeText(order.orderNumber).catch(() => {});
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyVa = () => {
    navigator.clipboard?.writeText('8277081234567890').catch(() => {});
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2200);
  };

  const handleCheckStatus = () => {
    setStatusNotice('• Menghubungkan ke gateway BCA... Memeriksa mutasi otomatis.');
    setTimeout(() => {
      if (uploadedFileName && onMarkOrderPaid) {
        onMarkOrderPaid(order.id);
        setStatusNotice(
          '• Pembayaran Rp ' +
            order.total.toLocaleString('id-ID') +
            ' TERVERIFIKASI! Pesanan diteruskan ke Gudang Cikarang.'
        );
      } else {
        setStatusNotice(
          '• Menunggu input transfer Anda pada rekening VA di atas (atau unggah bukti transfer untuk simulasi verifikasi instan).'
        );
      }
    }, 1500);
  };

  const handleUploadProof = () => {
    setUploadedFileName('struk_bca_mtransfer_8492.jpg');
    setStatusNotice(
      '• Bukti transfer "struk_bca_mtransfer_8492.jpg" berhasil diunggah. Klik "Cek Status Pembayaran" untuk verifikasi instan.'
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Progress & Status Ribbon */}
      <div className="w-full bg-surface-muted py-space-sm">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop flex flex-wrap items-center justify-between gap-y-2 text-on-surface-variant font-label-caps text-label-caps tracking-widest uppercase">
          <div className="flex items-center gap-space-sm">
            <span className="inline-block w-2 h-2 bg-badge-promo"></span>
            <span>Pesanan Resmi UrbanStore Studio • ID/JKT-2026</span>
          </div>
          <div className="flex items-center gap-space-md text-on-surface">
            <span>1. Troli [Lengkap]</span>
            <span>—</span>
            <span>2. Pengiriman [Selesai]</span>
            <span>—</span>
            <span className="text-primary font-bold bg-badge-promo text-text-on-accent px-2 py-0.5">
              3. Verifikasi Pembayaran
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg md:py-space-xl w-full">
        {/* Hero Header / Celebration Section */}
        <section className="mb-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-end">
            <div className="lg:col-span-8">
              <div className="flex items-center gap-space-sm mb-space-sm">
                <div className="w-10 h-10 bg-badge-promo flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-[24px] text-text-on-accent"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                </div>
                <span className="bg-primary text-on-primary px-space-sm py-1 font-label-caps text-label-caps uppercase tracking-wider">
                  {order.status === 'PENDING_PAYMENT'
                    ? 'Pesanan Diterima • Menunggu Pelunasan'
                    : 'Pembayaran Terverifikasi • Diproses Gudang'}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg md:font-display md:text-display uppercase tracking-tight text-primary leading-none">
                Terima Kasih, Pesanan Anda Telah Diterima.
              </h1>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-end items-start lg:items-end gap-space-sm">
              {/* Order ID Badge with Copy Interaction */}
              <div className="bg-surface-container p-space-sm flex items-center gap-space-md w-full sm:w-auto">
                <div className="text-left">
                  <span className="font-label-sm text-label-sm uppercase text-outline block">
                    Nomor Referensi
                  </span>
                  <span className="font-headline-sm text-headline-sm tracking-tight text-primary font-bold">
                    {order.orderNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent p-2 transition-colors cursor-pointer"
                  title="Salin Nomor Referensi"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {copiedRef ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>

              {/* Countdown Pill */}
              <div className="bg-badge-soldout text-on-primary px-space-md py-2 flex items-center gap-space-sm w-full sm:w-auto justify-between sm:justify-start">
                <span className="material-symbols-outlined text-[18px] text-badge-promo animate-pulse">
                  timer
                </span>
                <span className="font-label-caps text-label-caps uppercase text-surface-variant">
                  Selesaikan dalam:
                </span>
                <span className="font-price-display text-price-display text-badge-promo font-mono">
                  {formatTimer(secondsLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Architectural Divider Accent */}
          <div className="w-full h-1 bg-primary mt-space-lg flex">
            <div className="w-32 bg-badge-promo h-full"></div>
          </div>
        </section>

        {/* Main Editorial 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
          {/* LEFT COLUMN: Payment Action & Instructions (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Payment Callout Card */}
            <div className="bg-canvas-base shadow-sm p-space-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-surface-muted px-3 py-1 font-label-caps text-label-caps uppercase text-outline">
                Metode: BCA Virtual Account
              </div>
              <div className="mb-space-md">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-1">
                  Total Kewajiban Pembayaran
                </span>
                <div className="flex items-baseline gap-space-xs flex-wrap">
                  <span className="font-display text-display text-primary tracking-tight font-bold">
                    {formatRupiah(order.total)}
                  </span>
                  <span className="bg-badge-promo text-text-on-accent px-1.5 py-0.5 font-label-caps text-[10px] font-bold uppercase tracking-wider">
                    Tepat Hingga 3 Digit Terakhir
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Mohon pastikan transfer sejumlah nominal persis di atas agar verifikasi otomatis
                  UrbanEngine berjalan tanpa kendala manual.
                </p>
              </div>

              {/* VA Number Display Box */}
              <div className="bg-surface-subtle p-space-md my-space-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-outline block">
                      Nomor Virtual Account BCA
                    </span>
                    <span className="font-headline-lg text-headline-lg tracking-wider font-mono text-primary font-bold">
                      {order.vaNumber || '8277 0812 3456 7890'}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">
                      Atas Nama:{' '}
                      <strong className="text-on-surface font-semibold">
                        URBANSTORE / NAYA R
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyVa}
                    className="bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary px-space-md py-3 font-label-caps text-label-caps uppercase tracking-wider font-bold transition-colors flex items-center justify-center gap-space-xs shadow-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    <span>{copiedVa ? 'Tersalin!' : 'Salin Nomor VA'}</span>
                  </button>
                </div>
              </div>

              {/* Dual Action CTA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={handleCheckStatus}
                  className="w-full bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent py-3 px-space-md font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">sync</span>
                  <span>Cek Status Pembayaran</span>
                </button>
                <button
                  type="button"
                  onClick={handleUploadProof}
                  className="w-full bg-surface-muted hover:bg-surface-variant text-on-surface py-3 px-space-md font-label-caps text-label-caps uppercase tracking-wider transition-colors flex items-center justify-center gap-space-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>
                    {uploadedFileName
                      ? 'Bukti Terunggah ✓'
                      : 'Unggah Bukti Transfer (Opsional)'}
                  </span>
                </button>
              </div>
              {statusNotice && (
                <p className="font-body-sm text-body-sm text-secondary font-medium mt-space-sm">
                  {statusNotice}
                </p>
              )}
            </div>

            {/* Tabbed Transfer Guides */}
            <div className="bg-canvas-base shadow-sm p-space-lg">
              <div className="flex items-center justify-between mb-space-md pb-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    account_balance
                  </span>
                  <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
                    Panduan Tata Cara Pembayaran
                  </h2>
                </div>
                <span className="font-label-sm text-label-sm text-outline uppercase">
                  BCA Virtual Account
                </span>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-space-xs bg-surface-muted p-1 mb-space-md font-label-caps text-label-caps uppercase">
                {[
                  { id: 'mobile' as const, label: 'BCA Mobile (m-BCA)' },
                  { id: 'klikbca' as const, label: 'KlikBCA' },
                  { id: 'atm' as const, label: 'ATM BCA' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveGuide(t.id)}
                    className={`flex-1 py-2 px-space-sm text-center transition-all cursor-pointer ${
                      activeGuide === t.id
                        ? 'bg-canvas-base text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Guide Contents */}
              {activeGuide === 'mobile' && (
                <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      1
                    </span>
                    <p>
                      Buka aplikasi <strong>BCA Mobile</strong> lalu pilih menu{' '}
                      <span className="text-on-surface font-medium">
                        m-Transfer &gt; BCA Virtual Account
                      </span>
                      .
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      2
                    </span>
                    <p>
                      Masukkan kode Virtual Account{' '}
                      <span className="font-mono font-bold text-primary">
                        8277 0812 3456 7890
                      </span>{' '}
                      lalu tekan <strong>Send</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      3
                    </span>
                    <p>
                      Periksa detail transaksi: Pastikan nama tertera{' '}
                      <span className="text-primary font-semibold">URBANSTORE / NAYA R</span> dan
                      jumlah transfer sesuai (
                      <span className="font-semibold text-primary">
                        {formatRupiah(order.total)}
                      </span>
                      ).
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      4
                    </span>
                    <p>
                      Masukkan <strong>PIN m-BCA</strong> Anda. Transaksi otomatis diverifikasi
                      dalam 1-2 menit tanpa kirim slip manual.
                    </p>
                  </div>
                </div>
              )}

              {activeGuide === 'klikbca' && (
                <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      1
                    </span>
                    <p>
                      Login ke situs <strong>KlikBCA Individu</strong> (https://ibank.klikbca.com)
                      dengan User ID &amp; PIN.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      2
                    </span>
                    <p>
                      Pilih menu{' '}
                      <span className="text-on-surface font-medium">
                        Transfer Dana &gt; Transfer ke BCA Virtual Account
                      </span>
                      .
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      3
                    </span>
                    <p>
                      Input nomor{' '}
                      <span className="font-mono font-bold text-primary">
                        8277 0812 3456 7890
                      </span>{' '}
                      dan klik <strong>Lanjutkan</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      4
                    </span>
                    <p>
                      Verifikasi angka tagihan <strong>{formatRupiah(order.total)}</strong> dan
                      sahkan menggunakan respon KeyBCA Token APPLI 1.
                    </p>
                  </div>
                </div>
              )}

              {activeGuide === 'atm' && (
                <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      1
                    </span>
                    <p>Masukkan kartu ATM BCA dan 6 Digit PIN Anda.</p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      2
                    </span>
                    <p>
                      Pilih menu{' '}
                      <span className="text-on-surface font-medium">
                        Transaksi Lainnya &gt; Transfer &gt; Ke Rek BCA Virtual Account
                      </span>
                      .
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      3
                    </span>
                    <p>
                      Ketikkan kode VA{' '}
                      <span className="font-mono font-bold text-primary">
                        8277 0812 3456 7890
                      </span>{' '}
                      lalu tekan <strong>Benar</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-space-sm p-space-sm bg-surface-subtle">
                    <span className="w-5 h-5 bg-primary text-on-primary flex items-center justify-center font-label-caps text-xs shrink-0">
                      4
                    </span>
                    <p>
                      Cocokkan data konfirmasi layar (UrbanStore - {formatRupiah(order.total)})
                      lalu tekan <strong>Ya</strong> dan simpan struk fisik.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps & Assistance Card */}
            <div className="bg-surface-subtle p-space-lg flex flex-col gap-space-md">
              <div className="flex items-start gap-space-sm">
                <span className="material-symbols-outlined text-[24px] text-badge-promo bg-primary p-1">
                  notifications_active
                </span>
                <div>
                  <p className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
                    Notifikasi &amp; Konfirmasi Pengiriman
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Salinan invoice dan nota kurasi telah dikirimkan ke{' '}
                    <strong className="text-on-surface">{order.recipientEmail}</strong> serta
                    notifikasi status pesanan via WhatsApp ke{' '}
                    <strong className="text-on-surface">{order.recipientPhone}</strong>.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm pt-space-xs text-center">
                <a
                  className="bg-canvas-base hover:bg-surface-muted p-space-sm flex flex-col items-center justify-center gap-1 transition-colors"
                  href="https://wa.me/6281234567890"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">chat</span>
                  <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                    WhatsApp CS
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    Balasan Cepat 24/7
                  </span>
                </a>
                <button
                  type="button"
                  onClick={onNavigateAccount}
                  className="bg-canvas-base hover:bg-surface-muted p-space-sm flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    receipt_long
                  </span>
                  <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                    Riwayat Pesanan
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    Pantau Status
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onNavigateAccount}
                  className="bg-canvas-base hover:bg-surface-muted p-space-sm flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px] text-primary">
                    swap_horiz
                  </span>
                  <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                    Tukar Ukuran
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    Garansi 7 Hari
                  </span>
                </button>
              </div>

              <div className="pt-space-xs flex justify-start">
                <button
                  type="button"
                  onClick={onNavigateCatalog}
                  className="inline-flex items-center gap-space-xs text-primary font-label-caps text-label-caps uppercase tracking-wider hover:text-secondary transition-colors font-bold group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>Kembali Berbelanja (Katalog Drop)</span>
                </button>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Structured Receipt & Breakdown (5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Editorial Receipt Card */}
            <div className="bg-canvas-base shadow-sm p-space-lg relative">
              <div className="flex items-center justify-between pb-space-sm">
                <div>
                  <span className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary font-bold">
                    URBANSTORE / REC-8492
                  </span>
                  <span className="font-label-sm text-label-sm uppercase text-outline block">
                    Zurich • Tokyo • Jakarta Edition
                  </span>
                </div>
                <div className="text-right">
                  <span className="bg-surface-muted text-on-surface px-2 py-1 font-label-caps text-[11px] uppercase tracking-wider font-semibold">
                    Status: {order.status === 'PENDING_PAYMENT' ? 'Pending' : 'Paid'}
                  </span>
                </div>
              </div>

              {/* Items Ordered Section */}
              <div className="pt-space-md">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-space-sm">
                  Kurasi Item Terpilih ({order.items.length})
                </span>
                <div className="space-y-space-md">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex gap-space-sm items-start pb-space-md bg-surface-subtle p-space-sm"
                    >
                      <div className="w-16 h-20 bg-surface-muted overflow-hidden shrink-0 relative">
                        <img
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                          src={item.image}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body-md text-body-md text-on-surface font-semibold truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5 text-on-surface-variant font-label-sm text-label-sm uppercase">
                          <span>Warna: {item.color}</span>
                          <span>•</span>
                          <span>Ukuran: {item.size}</span>
                          <span>•</span>
                          <span>Jml: {item.quantity}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-label-caps text-label-caps text-outline uppercase font-mono">
                            SKU: {item.sku}
                          </span>
                          <span className="font-price-display text-price-display text-primary font-bold">
                            {formatRupiah(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping and Consignee Details */}
              <div className="pt-space-md space-y-space-sm">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block">
                  Data Pengiriman &amp; Kurir
                </span>
                <div className="bg-surface-subtle p-space-sm space-y-space-xs font-body-sm text-body-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-outline uppercase font-label-sm text-label-sm">
                      Penerima
                    </span>
                    <span className="text-on-surface font-medium text-right">
                      {order.recipientName} (
                      <span className="font-mono">{order.recipientPhone}</span>)
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-outline uppercase font-label-sm text-label-sm shrink-0 mr-4">
                      Alamat
                    </span>
                    <span className="text-on-surface-variant text-right">
                      {order.shippingAddress}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-outline uppercase font-label-sm text-label-sm">
                      Layanan
                    </span>
                    <span className="text-primary font-medium text-right flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-badge-promo bg-primary px-0.5">
                        local_shipping
                      </span>
                      {order.courierName}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-outline uppercase font-label-sm text-label-sm">
                      Estimasi Tiba
                    </span>
                    <span className="text-on-surface font-medium text-right">
                      {order.estimatedArrival || '18 – 20 Nov 2026'}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pt-1">
                    <span className="text-outline uppercase font-label-sm text-label-sm">
                      No. Resi Pelacakan
                    </span>
                    <span className="font-mono text-outline italic text-right">
                      Terbit setelah verifikasi dana
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Summary Breakdown */}
              <div className="pt-space-md space-y-space-xs font-body-sm text-body-sm">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block mb-1">
                  Rincian Finansial
                </span>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Subtotal Item ({order.items.length} produk)</span>
                  <span className="font-mono font-medium text-on-surface">
                    {formatRupiah(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Biaya Pengiriman ({order.courierName})</span>
                  <span className="font-mono font-medium text-on-surface">
                    {formatRupiah(order.shippingFee)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-secondary font-medium">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">sell</span>
                      Kupon: {order.voucherCode || 'ESSENTIAL2026'}
                    </span>
                    <span className="font-mono font-bold">-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface-variant">
                  <span>Biaya Layanan Gerbang Pembayaran</span>
                  <span className="font-mono text-on-surface">
                    {formatRupiah(order.serviceFee)}
                  </span>
                </div>

                {/* Grand Total Highlight Bar */}
                <div className="bg-primary text-on-primary p-space-sm mt-space-md flex items-center justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-surface-variant tracking-wider block">
                      Total yang Harus Dibayar
                    </span>
                    <span className="font-label-sm text-label-sm text-badge-promo uppercase">
                      Termasuk Pajak Pertambahan Nilai (PPN 11%)
                    </span>
                  </div>
                  <span className="font-price-display text-price-display font-display text-badge-promo font-bold tracking-tight">
                    {formatRupiah(order.total)}
                  </span>
                </div>
              </div>

              {/* Decorative Tear Edge Receipt Effect */}
              <div className="w-full flex justify-between items-center mt-space-md pt-space-xs text-outline opacity-40 font-mono text-xs overflow-hidden select-none">
                <span>
                  ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                </span>
              </div>
              <div className="mt-space-sm flex items-center justify-between text-outline font-label-caps text-label-caps uppercase">
                <span>Waktu Cetak: {order.dateStr}</span>
                <span>Auth: SIGNED-SEC-SHA256</span>
              </div>
            </div>

            {/* Security & Authenticity Stamp */}
            <div className="bg-surface-muted p-space-md flex items-center gap-space-md">
              <div className="w-12 h-12 bg-canvas-base flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[26px] text-primary">
                  verified_user
                </span>
              </div>
              <div>
                <h4 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
                  Jaminan Keaslian &amp; Transaksi Aman
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Seluruh produk dikirim dari gudang terpusat UrbanStore Cikarang. Dilindungi
                  garansi pengembalian 100% jika kemasan rusak saat diterima.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
