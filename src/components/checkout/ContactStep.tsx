import React from 'react';

interface ContactStepProps {
  setActiveStep: (step: 1 | 2 | 3) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  fullName: string;
  setFullName: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  provinsi: string;
  setProvinsi: (v: string) => void;
  kota: string;
  setKota: (v: string) => void;
  kecamatan: string;
  setKecamatan: (v: string) => void;
  kodePos: string;
  setKodePos: (v: string) => void;
  saveAddress: boolean;
  setSaveAddress: (v: boolean) => void;
  formErrors: Record<string, string>;
}

export const ContactStep: React.FC<ContactStepProps> = ({
  setActiveStep,
  email,
  setEmail,
  phone,
  setPhone,
  fullName,
  setFullName,
  address,
  setAddress,
  provinsi,
  setProvinsi,
  kota,
  setKota,
  kecamatan,
  setKecamatan,
  kodePos,
  setKodePos,
  saveAddress,
  setSaveAddress,
  formErrors,
}) => {
  return (
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
                placeholder="nama@email.com"
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
                placeholder="812-3456-7890"
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
            placeholder="Nama sesuai identitas penerima"
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
            placeholder="Nama jalan, nomor rumah, RT/RW, patokan"
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
              inputMode="numeric"
              maxLength={5}
              placeholder="12160"
              value={kodePos}
              onChange={(e) => setKodePos(e.target.value)}
              className="w-full bg-surface-subtle p-space-sm font-body-md text-body-md text-on-surface outline-none focus:bg-canvas-base"
            />
            {formErrors.kodePos && (
              <p className="font-body-sm text-body-sm text-error font-medium">
                {formErrors.kodePos}
              </p>
            )}
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
  );
};
