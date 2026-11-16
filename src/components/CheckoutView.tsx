import React, { useState } from 'react';
import { CartItem, Order, formatRupiah } from '../data/storeData';

interface CheckoutViewProps {
  cart: CartItem[];
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenProduct: (productId: string) => void;
  onNavigateCatalog: () => void;
  onCompleteOrder: (newOrder: Order) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  onUpdateQty,
  onRemoveItem,
  onOpenProduct,
  onNavigateCatalog,
  onCompleteOrder,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [accessMode, setAccessMode] = useState<'guest' | 'member'>('guest');

  // Form fields
  const [email, setEmail] = useState('aditya.pratama@outlook.com');
  const [phone, setPhone] = useState('812-8879-4321');
  const [fullName, setFullName] = useState('Aditya Pratama Putra');
  const [address, setAddress] = useState(
    'Jl. Senopati Dalam II No. 18B, RT 004 / RW 002 (Pagar Hitam, Depan Kopi Nako), Kebayoran Baru'
  );
  const [provinsi, setProvinsi] = useState('DKI Jakarta');
  const [kota, setKota] = useState('Jakarta Selatan');
  const [kecamatan, setKecamatan] = useState('Kebayoran Baru');
  const [kodePos, setKodePos] = useState('12160');
  const [saveAddress, setSaveAddress] = useState(true);

  // Courier & Payment
  const [selectedCourier, setSelectedCourier] = useState<{
    id: string;
    name: string;
    cost: number;
    eta: string;
  }>({
    id: 'jnt',
    name: 'J&T Express Regular',
    cost: 12000,
    eta: '18 – 20 Nov 2026',
  });
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'cc'>('qris');

  // Voucher state
  const [voucherInput, setVoucherInput] = useState('URBANFIRST');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; amount: number } | null>({
    code: 'URBANFIRST',
    amount: 50000,
  });
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Validation & Submit
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSwitchMode = (mode: 'guest' | 'member') => {
    setAccessMode(mode);
    if (mode === 'member') {
      setEmail('naya.rahmadani@email.com');
      setPhone('812-3456-7890');
      setFullName('Naya Rahmadani');
      setAddress('Jl. Senopati No. 42, Kebayoran Baru');
      setProvinsi('DKI Jakarta');
      setKota('Jakarta Selatan');
      setKecamatan('Kebayoran Baru');
      setKodePos('12160');
    } else {
      setEmail('aditya.pratama@outlook.com');
      setPhone('812-8879-4321');
      setFullName('Aditya Pratama Putra');
      setAddress(
        'Jl. Senopati Dalam II No. 18B, RT 004 / RW 002 (Pagar Hitam, Depan Kopi Nako), Kebayoran Baru'
      );
    }
  };

  const handleApplyVoucher = () => {
    const clean = voucherInput.trim().toUpperCase();
    setVoucherError(null);
    if (clean === 'URBANFIRST' || clean === 'ESSENTIAL2026') {
      setAppliedVoucher({ code: clean, amount: 50000 });
    } else if (!clean) {
      setVoucherError('Masukkan kode kupon terlebih dahulu.');
    } else {
      setVoucherError('Kode kupon tidak valid. Gunakan URBANFIRST atau ESSENTIAL2026.');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = cart.length > 0 ? selectedCourier.cost : 0;
  const discount = cart.length > 0 && appliedVoucher ? appliedVoucher.amount : 0;
  const serviceFee = cart.length > 0 ? 1000 : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount + serviceFee);

  const validateAndSubmit = () => {
    if (cart.length === 0 || isSubmitting) return;
    const errors: Record<string, string> = {};
    if (!email.trim() || !email.includes('@')) {
      errors.email = 'Masukkan alamat surel aktif yang valid (contoh: nama@email.com).';
    }
    if (!phone.trim() || phone.trim().length < 8) {
      errors.phone = 'Masukkan nomor WhatsApp/telepon yang valid minimal 8 digit.';
    }
    if (!fullName.trim()) {
      errors.fullName = 'Nama lengkap penerima wajib diisi.';
    }
    if (!address.trim() || address.trim().length < 10) {
      errors.address = 'Mohon lengkapi alamat pengiriman beserta nomor rumah atau RT/RW.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newOrder: Order = {
        id: 'ord-' + Date.now(),
        orderNumber: '#URBN-202611-8492',
        dateStr: '17 Nov 2026, 14:12 WIB',
        status: 'PENDING_PAYMENT',
        paymentMethod:
          paymentMethod === 'va'
            ? 'BCA Virtual Account (Otomatis)'
            : paymentMethod === 'qris'
            ? 'BCA Virtual Account / QRIS'
            : 'Kartu Kredit / Debit 3DS',
        vaNumber: '8277 0812 3456 7890',
        subtotal,
        shippingFee,
        discount,
        voucherCode: appliedVoucher?.code || 'ESSENTIAL2026',
        serviceFee,
        total: grandTotal,
        courierName: selectedCourier.name,
        estimatedArrival: selectedCourier.eta,
        recipientName: fullName,
        recipientPhone: `+62 ${phone}`,
        recipientEmail: email,
        shippingAddress: `${address}, ${kecamatan}, ${kota}, ${kodePos}`,
        items: cart.map((c) => ({
          name: c.name,
          color: c.color.replace(' Black', '').replace(' Beige', ''),
          size: c.size,
          sku: c.sku,
          quantity: c.quantity,
          price: c.price,
          image: c.image,
        })),
      };
      setIsSubmitting(false);
      onCompleteOrder(newOrder);
    }, 300);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1440px] w-full mx-auto px-margin md:px-margin-desktop py-space-md md:py-space-xl">
        {/* Top Flow Stepper Header */}
        <section className="mb-space-xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm mb-space-md">
            <div>
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block mb-space-xs">
                Checkout Transparan • Sesi #UB-9482
              </span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface uppercase tracking-tight">
                Penyelesaian Pesanan
              </h1>
            </div>
            <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm bg-surface-muted px-space-sm py-1">
              <span className="material-symbols-outlined text-[18px] text-on-surface">lock</span>
              <span>Proses Terenkripsi 256-Bit SSL</span>
            </div>
          </div>

          {/* Swiss Grid Stepper Progress Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-xs">
            {[
              {
                step: 1 as const,
                tag: activeStep === 1 ? 'Langkah 01 — Aktif' : 'Langkah 01 — Selesai',
                title: 'Kontak & Pengiriman',
                icon: activeStep === 1 ? 'radio_button_checked' : 'check_circle',
              },
              {
                step: 2 as const,
                tag: activeStep === 2 ? 'Langkah 02 — Aktif' : 'Langkah 02 — Lanjutan',
                title: 'Opsi Ekspedisi',
                icon: activeStep === 2 ? 'radio_button_checked' : 'schedule',
              },
              {
                step: 3 as const,
                tag: activeStep === 3 ? 'Langkah 03 — Aktif' : 'Langkah 03 — Final',
                title: 'Pembayaran & Review',
                icon: activeStep === 3 ? 'radio_button_checked' : 'credit_card',
              },
            ].map((st) => {
              const isCurrent = activeStep === st.step;
              return (
                <button
                  key={st.step}
                  type="button"
                  onClick={() => setActiveStep(st.step)}
                  className={`p-space-md flex items-center justify-between transition-all text-left cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-muted text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <div className="flex items-center gap-space-sm">
                    <span
                      className={`w-6 h-6 font-headline-sm text-headline-sm flex items-center justify-center font-bold ${
                        isCurrent
                          ? 'bg-badge-promo text-text-on-accent'
                          : 'bg-surface-variant text-on-surface-variant'
                      }`}
                    >
                      {st.step}
                    </span>
                    <div className="flex flex-col">
                      <span
                        className={`font-label-caps text-label-caps uppercase tracking-wider ${
                          isCurrent ? 'text-badge-promo' : 'text-on-surface-variant'
                        }`}
                      >
                        {st.tag}
                      </span>
                      <span
                        className={`font-headline-sm text-headline-sm uppercase tracking-tight ${
                          isCurrent ? 'text-on-primary' : 'text-on-surface-variant'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      isCurrent ? 'text-badge-promo' : 'text-outline'
                    }`}
                  >
                    {st.icon}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main Content 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* LEFT COLUMN: Forms, Delivery, Payment Tiers */}
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* Guest Toggle / Member Switch Panel */}
            <div className="bg-canvas-base p-space-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
                <div>
                  <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline block">
                    Metode Masuk
                  </span>
                  <p className="font-headline-sm text-headline-sm uppercase text-on-surface">
                    Pilihan Akses Pesanan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSwitchMode(accessMode === 'guest' ? 'member' : 'guest')}
                  className="inline-flex items-center gap-space-xs text-on-surface hover:text-secondary font-label-caps text-label-caps uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>
                    {accessMode === 'guest'
                      ? 'Sudah punya akun? Masuk (Naya)'
                      : 'Aktif sebagai: Naya Rahmadani'}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs mt-space-sm">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('guest')}
                  className={`p-space-sm flex items-center justify-between text-left transition-colors cursor-pointer ${
                    accessMode === 'guest'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-muted text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <div>
                    <span
                      className={`font-label-caps text-label-caps uppercase block ${
                        accessMode === 'guest' ? 'text-badge-promo' : 'text-outline'
                      }`}
                    >
                      Rekomendasi Cepat
                    </span>
                    <span className="font-headline-sm text-headline-sm uppercase">
                      Checkout Tamu
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      accessMode === 'guest' ? 'text-badge-promo' : 'text-outline'
                    }`}
                  >
                    bolt
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('member')}
                  className={`p-space-sm flex items-center justify-between text-left transition-colors cursor-pointer ${
                    accessMode === 'member'
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-muted text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  <div>
                    <span
                      className={`font-label-caps text-label-caps uppercase block ${
                        accessMode === 'member' ? 'text-badge-promo' : 'text-outline'
                      }`}
                    >
                      Anggota UrbanStore
                    </span>
                    <span
                      className={`font-headline-sm text-headline-sm uppercase ${
                        accessMode === 'member' ? 'text-on-primary' : 'text-on-surface-variant'
                      }`}
                    >
                      Sinkronisasi Poin
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      accessMode === 'member' ? 'text-badge-promo' : 'text-outline'
                    }`}
                  >
                    person
                  </span>
                </button>
              </div>
            </div>

            {/* FORM STEP 1: Kontak & Alamat Pengiriman */}
            <section
              onClick={() => setActiveStep(1)}
              className="bg-canvas-base p-space-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 bg-badge-promo inline-block"></span>
                  <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
                    01. Kontak &amp; Alamat Pengiriman
                  </h2>
                </div>
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  *Wajib diisi
                </span>
              </div>

              <form className="space-y-space-md" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="checkout-email"
                    >
                      Surel Aktif (E-Mail) <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="checkout-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-subtle p-space-sm font-body-md text-body-md text-on-surface outline-none focus:bg-canvas-base focus:shadow-sm transition-all"
                      />
                      <span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                        verified
                      </span>
                    </div>
                    {formErrors.email ? (
                      <p className="font-body-sm text-body-sm text-error font-medium">
                        {formErrors.email}
                      </p>
                    ) : (
                      <p className="font-body-sm text-body-sm text-outline">
                        Nomor resi dan faktur digital akan dikirimkan ke surel ini.
                      </p>
                    )}
                  </div>

                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="checkout-phone"
                    >
                      Nomor WhatsApp / Telepon <span className="text-error">*</span>
                    </label>
                    <div className="flex">
                      <span className="bg-surface-muted px-space-sm py-space-sm font-headline-sm text-headline-sm text-on-surface flex items-center select-none font-bold">
                        +62
                      </span>
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-surface-subtle p-space-sm font-body-md text-body-md text-on-surface outline-none focus:bg-canvas-base focus:shadow-sm transition-all"
                      />
                    </div>
                    {formErrors.phone ? (
                      <p className="font-body-sm text-body-sm text-error font-medium">
                        {formErrors.phone}
                      </p>
                    ) : (
                      <p className="font-body-sm text-body-sm text-outline">
                        Untuk koordinasi kurir saat pengantaran paket.
                      </p>
                    )}
                  </div>
                </div>

                {/* Full Name */}
                <div className="space-y-space-xs">
                  <label
                    className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                    htmlFor="checkout-fullname"
                  >
                    Nama Lengkap Penerima <span className="text-error">*</span>
                  </label>
                  <input
                    id="checkout-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-subtle p-space-sm font-body-md text-body-md text-on-surface outline-none focus:bg-canvas-base focus:shadow-sm transition-all"
                  />
                  {formErrors.fullName && (
                    <p className="font-body-sm text-body-sm text-error font-medium">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Complete Street Address */}
                <div className="space-y-space-xs">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="checkout-address"
                    >
                      Alamat Lengkap <span className="text-error">*</span>
                    </label>
                    <span className="font-body-sm text-body-sm text-outline">
                      Sertakan RT/RW &amp; No. Rumah
                    </span>
                  </div>
                  <textarea
                    id="checkout-address"
                    rows={3}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-surface-subtle p-space-sm font-body-md text-body-md text-on-surface outline-none focus:bg-canvas-base focus:shadow-sm transition-all resize-none"
                  />
                  {formErrors.address && (
                    <p className="font-body-sm text-body-sm text-error font-medium">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* Hierarchical Location Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-sm">
                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="select-provinsi"
                    >
                      Provinsi
                    </label>
                    <div className="relative bg-surface-subtle">
                      <select
                        id="select-provinsi"
                        value={provinsi}
                        onChange={(e) => setProvinsi(e.target.value)}
                        className="w-full bg-transparent p-space-sm font-body-md text-body-md text-on-surface outline-none appearance-none pr-8"
                      >
                        <option>DKI Jakarta</option>
                        <option>Jawa Barat</option>
                        <option>Banten</option>
                        <option>DI Yogyakarta</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="select-kota"
                    >
                      Kota / Kab.
                    </label>
                    <div className="relative bg-surface-subtle">
                      <select
                        id="select-kota"
                        value={kota}
                        onChange={(e) => setKota(e.target.value)}
                        className="w-full bg-transparent p-space-sm font-body-md text-body-md text-on-surface outline-none appearance-none pr-8"
                      >
                        <option>Jakarta Selatan</option>
                        <option>Jakarta Pusat</option>
                        <option>Jakarta Barat</option>
                        <option>Tangerang Selatan</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="select-kecamatan"
                    >
                      Kecamatan
                    </label>
                    <div className="relative bg-surface-subtle">
                      <select
                        id="select-kecamatan"
                        value={kecamatan}
                        onChange={(e) => setKecamatan(e.target.value)}
                        className="w-full bg-transparent p-space-sm font-body-md text-body-md text-on-surface outline-none appearance-none pr-8"
                      >
                        <option>Kebayoran Baru</option>
                        <option>Cilandak</option>
                        <option>Setiabudi</option>
                        <option>Mampang Prapatan</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-outline text-[18px]">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div className="space-y-space-xs">
                    <label
                      className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block"
                      htmlFor="input-kodepos"
                    >
                      Kode Pos
                    </label>
                    <input
                      id="input-kodepos"
                      type="text"
                      value={kodePos}
                      onChange={(e) => setKodePos(e.target.value)}
                      className="w-full bg-surface-subtle p-space-sm font-body-md text-body-md text-on-surface outline-none focus:bg-canvas-base"
                    />
                  </div>
                </div>

                {/* Save Address Toggle */}
                <label className="flex items-center gap-space-sm pt-space-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="w-4 h-4 rounded-none accent-primary cursor-pointer"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Simpan alamat ini ke buku alamat tersimpan untuk pesanan berikutnya
                  </span>
                </label>
              </form>
            </section>

            {/* FORM STEP 2: Opsi Ekspedisi / Pilihan Kurir */}
            <section
              onClick={() => setActiveStep(2)}
              className="bg-canvas-base p-space-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 bg-secondary inline-block"></span>
                  <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
                    02. Opsi Ekspedisi
                  </h2>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-secondary bg-surface-container px-2 py-0.5">
                  Asuransi Paket Aktif
                </span>
              </div>

              <div className="space-y-space-xs">
                {[
                  {
                    id: 'jnt',
                    name: 'J&T Express Regular',
                    badge: 'Termurah',
                    badgeClass: 'bg-badge-promo text-text-on-accent',
                    desc: 'Estimasi tiba: 2 – 3 Hari Kerja • Pelacakan Real-time',
                    eta: '18 – 20 Nov 2026',
                    cost: 12000,
                    tier: 'Standard',
                  },
                  {
                    id: 'sicepat',
                    name: 'SiCepat BEST',
                    badge: 'Besok Tiba',
                    badgeClass: 'bg-surface-variant text-on-surface-variant',
                    desc: 'Estimasi tiba: 1 Hari Kerja (Pukul 09.00 - 18.00 WIB)',
                    eta: '18 Nov 2026',
                    cost: 18000,
                    tier: 'Next Day',
                  },
                  {
                    id: 'instant',
                    name: 'Instant GoSend / Grab',
                    badge: 'Prioritas',
                    badgeClass: 'bg-badge-soldout text-on-primary',
                    desc: 'Estimasi tiba: Maksimal 3 Jam sejak dipickup dari Warehouse',
                    eta: 'Hari ini (Maks 3 Jam)',
                    cost: 35000,
                    tier: 'Kilat',
                  },
                ].map((cOption) => {
                  const isSelected = selectedCourier.id === cOption.id;
                  return (
                    <label
                      key={cOption.id}
                      onClick={() =>
                        setSelectedCourier({
                          id: cOption.id,
                          name: cOption.name,
                          cost: cOption.cost,
                          eta: cOption.eta,
                        })
                      }
                      className={`block p-space-md text-on-surface cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-surface-container'
                          : 'bg-surface-subtle hover:bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-space-sm">
                        <div className="flex items-start gap-space-sm">
                          <input
                            type="radio"
                            name="courier_choice"
                            checked={isSelected}
                            onChange={() => {}}
                            className="mt-1 w-4 h-4 accent-primary"
                          />
                          <div>
                            <div className="flex items-center gap-space-xs">
                              <span className="font-headline-sm text-headline-sm uppercase text-on-surface font-bold">
                                {cOption.name}
                              </span>
                              <span
                                className={`font-label-caps text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider ${cOption.badgeClass}`}
                              >
                                {cOption.badge}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                              {cOption.desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-price-display text-price-display text-on-surface block font-bold">
                            {formatRupiah(cOption.cost)}
                          </span>
                          <span className="font-label-caps text-label-caps text-outline uppercase">
                            {cOption.tier}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* FORM STEP 3: Opsi Metode Pembayaran Lokal Terpercaya */}
            <section
              onClick={() => setActiveStep(3)}
              className="bg-canvas-base p-space-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-space-md">
                <div className="flex items-center gap-space-xs">
                  <span className="w-2.5 h-2.5 bg-primary inline-block"></span>
                  <h2 className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
                    03. Metode Pembayaran
                  </h2>
                </div>
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Otomatis Terverifikasi
                </span>
              </div>

              <div className="space-y-space-sm">
                {/* Payment Channel 1: QRIS */}
                <div
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-space-md transition-colors cursor-pointer ${
                    paymentMethod === 'qris'
                      ? 'bg-surface-container'
                      : 'bg-surface-subtle hover:bg-surface-muted'
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-space-sm">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'qris'}
                        onChange={() => setPaymentMethod('qris')}
                        className="w-4 h-4 accent-primary"
                      />
                      <div>
                        <span className="font-headline-sm text-headline-sm uppercase text-on-surface block font-bold">
                          QRIS Instant Payment
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          GoPay, OVO, ShopeePay, DANA, BCA Mobile &amp; Seluruh Bank
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-caps text-label-caps uppercase bg-badge-promo text-text-on-accent px-1.5 py-0.5 font-bold">
                        Bebas Biaya Admin
                      </span>
                    </div>
                  </label>
                  {paymentMethod === 'qris' && (
                    <div className="mt-space-sm pt-space-sm bg-canvas-base p-space-sm flex flex-col sm:flex-row items-center gap-space-md">
                      <div className="w-24 h-24 bg-primary p-2 flex items-center justify-center shrink-0">
                        <svg
                          aria-label="Simulasi Kode QRIS"
                          className="w-full h-full text-canvas-base fill-current"
                          viewBox="0 0 100 100"
                        >
                          <rect fill="currentColor" height="30" width="30" x="0" y="0"></rect>
                          <rect fill="#000000" height="20" width="20" x="5" y="5"></rect>
                          <rect fill="currentColor" height="10" width="10" x="10" y="10"></rect>
                          <rect fill="currentColor" height="30" width="30" x="70" y="0"></rect>
                          <rect fill="#000000" height="20" width="20" x="75" y="5"></rect>
                          <rect fill="currentColor" height="10" width="10" x="80" y="10"></rect>
                          <rect fill="currentColor" height="30" width="30" x="0" y="70"></rect>
                          <rect fill="#000000" height="20" width="20" x="5" y="75"></rect>
                          <rect fill="currentColor" height="10" width="10" x="10" y="80"></rect>
                          <rect fill="currentColor" height="20" width="10" x="40" y="10"></rect>
                          <rect fill="currentColor" height="10" width="10" x="55" y="5"></rect>
                          <rect fill="currentColor" height="20" width="20" x="40" y="40"></rect>
                          <rect fill="currentColor" height="10" width="15" x="65" y="45"></rect>
                          <rect fill="currentColor" height="25" width="10" x="45" y="70"></rect>
                          <rect fill="currentColor" height="15" width="25" x="65" y="75"></rect>
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <span className="font-label-caps text-label-caps uppercase text-primary font-bold block">
                          Pindai kode QR dinamis
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Kode QR instan akan di-generate otomatis setelah Anda menekan tombol
                          &ldquo;Lanjut ke Pembayaran&rdquo;. Validitas transaksi 15 menit.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Channel 2: Virtual Account */}
                <div
                  onClick={() => setPaymentMethod('va')}
                  className={`p-space-md transition-colors cursor-pointer ${
                    paymentMethod === 'va'
                      ? 'bg-surface-container'
                      : 'bg-surface-subtle hover:bg-surface-muted'
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-space-sm">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'va'}
                        onChange={() => setPaymentMethod('va')}
                        className="w-4 h-4 accent-primary"
                      />
                      <div>
                        <span className="font-headline-sm text-headline-sm uppercase text-on-surface block font-bold">
                          Virtual Account Otomatis
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          BCA, Mandiri, BNI, BRI, Permata Bank
                        </span>
                      </div>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-outline">
                      Verifikasi Cepat
                    </span>
                  </label>
                </div>

                {/* Payment Channel 3: Kartu Kredit / Debit Online */}
                <div
                  onClick={() => setPaymentMethod('cc')}
                  className={`p-space-md transition-colors cursor-pointer ${
                    paymentMethod === 'cc'
                      ? 'bg-surface-container'
                      : 'bg-surface-subtle hover:bg-surface-muted'
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-space-sm">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'cc'}
                        onChange={() => setPaymentMethod('cc')}
                        className="w-4 h-4 accent-primary"
                      />
                      <div>
                        <span className="font-headline-sm text-headline-sm uppercase text-on-surface block font-bold">
                          Kartu Kredit / Debit
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Visa, Mastercard, JCB • 3D Secure Verification
                        </span>
                      </div>
                    </div>
                    <span className="font-label-caps text-label-caps uppercase text-outline">
                      Cicilan 0%
                    </span>
                  </label>
                </div>
              </div>

              {/* Trust Badges & Guarantee Micro-Bar */}
              <div className="mt-space-lg pt-space-md bg-surface-muted p-space-sm flex flex-wrap items-center justify-around gap-space-sm">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span className="font-label-caps text-[11px] uppercase tracking-wider">
                    Midtrans Verified Gateway
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">encrypted</span>
                  <span className="font-label-caps text-[11px] uppercase tracking-wider">
                    256-Bit SSL Enkripsi Bank
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">assignment_return</span>
                  <span className="font-label-caps text-[11px] uppercase tracking-wider">
                    Jaminan Retur 7 Hari
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Shopping Cart Summary & Sticky Cost Breakdown */}
          <aside className="lg:col-span-5 sticky top-28 space-y-space-md">
            <div className="bg-canvas-base p-space-lg shadow-sm">
              <div className="flex items-center justify-between pb-space-sm mb-space-sm">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-headline-md uppercase text-on-surface tracking-tight">
                    Ringkasan Tas
                  </span>
                  <span className="w-5 h-5 bg-badge-promo text-text-on-accent font-label-caps text-[11px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onNavigateCatalog}
                  className="font-label-caps text-label-caps uppercase text-outline hover:text-primary transition-colors cursor-pointer"
                >
                  + Tambah Produk
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-space-xl text-center bg-surface-subtle p-space-md space-y-space-sm">
                  <span className="material-symbols-outlined text-[32px] text-outline">
                    shopping_bag
                  </span>
                  <p className="font-headline-sm text-headline-sm text-primary uppercase">
                    Keranjang masih kosong. Saatnya cari fit baru.
                  </p>
                  <button
                    type="button"
                    onClick={onNavigateCatalog}
                    className="px-space-md py-2 bg-badge-promo text-text-on-accent hover:bg-primary hover:text-on-primary font-label-caps text-label-caps uppercase font-bold transition-colors cursor-pointer"
                  >
                    Shop the Drop
                  </button>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-border-hairline">
                    {cart.map((item) => (
                      <article
                        key={item.id}
                        className="py-space-md flex gap-space-sm items-start"
                      >
                        <div
                          onClick={() => onOpenProduct(item.productId)}
                          className="w-20 h-28 bg-surface-muted shrink-0 overflow-hidden relative cursor-pointer"
                        >
                          <img
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            src={item.image}
                          />
                          {item.badgeText && (
                            <span
                              className={`absolute top-1 left-1 font-label-caps text-[9px] px-1 py-0.2 font-bold uppercase tracking-wider ${
                                item.badgeVariant === 'promo'
                                  ? 'bg-badge-promo text-text-on-accent'
                                  : 'bg-badge-soldout text-on-primary'
                              }`}
                            >
                              {item.badgeText}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-28">
                          <div>
                            <div className="flex items-start justify-between gap-space-xs">
                              <h3
                                onClick={() => onOpenProduct(item.productId)}
                                className="font-headline-sm text-headline-sm uppercase text-on-surface truncate hover:underline cursor-pointer"
                              >
                                {item.name}
                              </h3>
                              <button
                                type="button"
                                aria-label="Hapus Item"
                                onClick={() => onRemoveItem(item.id)}
                                className="text-outline hover:text-error transition-colors p-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              </button>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Warna: {item.color} • Ukuran:{' '}
                              <strong className="text-on-surface">{item.size}</strong>
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            {/* Stepper Qty Counter */}
                            <div className="inline-flex items-center bg-surface-muted">
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center font-headline-sm text-headline-sm text-on-surface hover:bg-surface-variant cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-7 text-center font-headline-sm text-headline-sm text-on-surface font-bold">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center font-headline-sm text-headline-sm text-on-surface hover:bg-surface-variant cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-price-display text-price-display text-on-surface font-bold">
                              {formatRupiah(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* Promo Voucher Module */}
                  <div className="mt-space-md pt-space-md bg-surface-subtle p-space-sm">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface block mb-1 tracking-wider">
                      Kupon &amp; Voucher Promo
                    </span>
                    <div className="flex gap-space-xs">
                      <input
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        className="flex-1 bg-canvas-base p-space-xs px-space-sm font-headline-sm text-headline-sm uppercase tracking-wider text-on-surface outline-none"
                        placeholder="Masukkan kode promo"
                        type="text"
                      />
                      <button
                        type="button"
                        onClick={handleApplyVoucher}
                        className="bg-primary hover:bg-badge-promo text-on-primary hover:text-text-on-accent px-space-md py-space-xs font-label-caps text-label-caps uppercase tracking-wider transition-colors shrink-0 font-bold cursor-pointer"
                      >
                        Terapkan
                      </button>
                    </div>
                    {voucherError && (
                      <p className="mt-1 font-body-sm text-body-sm text-error">{voucherError}</p>
                    )}
                    {appliedVoucher && (
                      <div className="mt-space-xs flex items-center justify-between bg-badge-promo/20 p-1.5 text-on-surface">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-secondary text-[16px]">
                            check_circle
                          </span>
                          <span className="font-label-caps text-[11px] font-bold uppercase text-secondary">
                            {appliedVoucher.code} — Hemat {formatRupiah(appliedVoucher.amount)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAppliedVoucher(null)}
                          className="text-on-surface-variant hover:text-error text-[11px] font-label-caps uppercase underline cursor-pointer"
                        >
                          Batal
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Transparent Cost Calculation Breakdown */}
                  <div className="mt-space-lg pt-space-md space-y-space-xs">
                    <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                      <span>Subtotal Produk ({totalItems} Item)</span>
                      <span className="text-on-surface font-medium">{formatRupiah(subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <span>Ongkos Kirim ({selectedCourier.name})</span>
                        <span
                          className="material-symbols-outlined text-[14px] text-outline cursor-help"
                          title="Dihitung berdasarkan berat total ke kecamatan tujuan"
                        >
                          info
                        </span>
                      </div>
                      <span className="text-on-surface font-medium">
                        {formatRupiah(shippingFee)}
                      </span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between font-body-md text-body-md text-secondary">
                        <span>Diskon Voucher ({appliedVoucher?.code})</span>
                        <span className="font-bold">- {formatRupiah(discount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-body-md text-body-md text-on-surface-variant">
                      <span>Biaya Layanan Sistem</span>
                      <span className="text-on-surface font-medium">
                        {formatRupiah(serviceFee)}
                      </span>
                    </div>

                    {/* Grand Total Highlight Box */}
                    <div className="mt-space-md pt-space-sm bg-primary text-on-primary p-space-md flex items-end justify-between">
                      <div>
                        <span className="font-label-caps text-label-caps uppercase text-badge-promo tracking-widest block">
                          Total Tagihan Final
                        </span>
                        <span className="font-body-sm text-body-sm text-on-primary/70">
                          Sudah termasuk PPN 11%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-[2rem] leading-none text-badge-promo block font-bold">
                          {formatRupiah(grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Primary Checkout CTA Button */}
                  <div className="mt-space-md space-y-space-xs">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={validateAndSubmit}
                      className="w-full bg-badge-promo hover:bg-primary text-text-on-accent hover:text-on-primary p-space-md flex items-center justify-center gap-space-sm font-label-caps text-label-caps uppercase font-bold tracking-wider transition-all shadow-md group cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[20px] transition-transform group-hover:scale-110">
                        lock
                      </span>
                      <span>
                        {isSubmitting
                          ? 'Memproses Pesanan...'
                          : `Lanjut ke Pembayaran (${formatRupiah(grandTotal)})`}
                      </span>
                    </button>
                    <div className="flex items-center justify-center gap-space-xs text-outline py-space-xs font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-[16px] text-secondary">
                        timer
                      </span>
                      <span>
                        Stok barang Anda direservasi eksklusif selama{' '}
                        <strong className="text-on-surface">15 menit</strong>
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Help & Customer Care Card */}
            <div className="bg-canvas-base p-space-md flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-on-surface text-[24px]">
                  support_agent
                </span>
                <div>
                  <p className="font-headline-sm text-headline-sm uppercase text-on-surface">
                    Butuh Panduan Pesanan?
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    WhatsApp Concierge 24/7 kami siap melayani
                  </p>
                </div>
              </div>
              <a
                className="bg-surface-muted hover:bg-surface-variant text-on-surface px-space-sm py-1.5 font-label-caps text-label-caps uppercase tracking-wider"
                href="https://wa.me/62812000000"
                rel="noopener noreferrer"
                target="_blank"
              >
                Hubungi
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
