import React, { useEffect, useRef, useState } from 'react';
import { CheckoutHeader } from './checkout/CheckoutHeader';
import { ContactStep } from './checkout/ContactStep';
import { CourierStep } from './checkout/CourierStep';
import { PaymentStep } from './checkout/PaymentStep';
import { CartSummary } from './checkout/CartSummary';
import { HelpCard } from './checkout/HelpCard';
import { SERVICE_FEE, calculateShippingFee, qualifiesForFreeShipping } from '../lib/pricing';
import type { Courier, PaymentMethod, Voucher } from './checkout/types';
import { CartItem, SavedAddress, formatEtaRange } from '../data/storeData';
import { describeError, describeVoucherReason } from '../services/errors';
import type { AddressInput, PlaceOrderInput, Profile, VoucherResult } from '../services/types';

const PROVINCES = ['DKI Jakarta', 'Jawa Barat', 'Banten', 'DI Yogyakarta'];
const CITIES = ['Jakarta Selatan', 'Jakarta Pusat', 'Jakarta Barat', 'Tangerang Selatan'];
const DISTRICTS = ['Kebayoran Baru', 'Cilandak', 'Setiabudi', 'Mampang Prapatan'];

const stripCountryCode = (phone: string) => phone.replace(/[\s]/g, '').replace(/^(\+62|62|0)/, '');

const newIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

export interface PlaceOrderOptions {
  /** Alamat yang akan disimpan ke buku alamat setelah pesanan berhasil (null = tidak disimpan). */
  saveAddress: AddressInput | null;
}

interface CheckoutViewProps {
  cart: CartItem[];
  profile: Profile | null;
  /** Alamat utama pengguna untuk mengisi form otomatis. */
  defaultAddress?: SavedAddress;
  onUpdateQty: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onOpenProduct: (productId: string) => void;
  onNavigateCatalog: () => void;
  /** Membuat pesanan di server; melempar error bila ditolak (stok, kupon, dll). */
  onPlaceOrder: (input: PlaceOrderInput, options: PlaceOrderOptions) => Promise<void>;
  onValidateVoucher: (code: string, subtotal: number) => Promise<VoucherResult>;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  cart,
  profile,
  defaultAddress,
  onUpdateQty,
  onRemoveItem,
  onOpenProduct,
  onNavigateCatalog,
  onPlaceOrder,
  onValidateVoucher,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Form fields (diisi dari profil + alamat utama pengguna)
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ? stripCountryCode(profile.phone) : '');
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [address, setAddress] = useState('');
  const [provinsi, setProvinsi] = useState(PROVINCES[0]);
  const [kota, setKota] = useState(CITIES[0]);
  const [kecamatan, setKecamatan] = useState(DISTRICTS[0]);
  const [kodePos, setKodePos] = useState('');
  const [saveAddress, setSaveAddress] = useState(true);

  // Alamat utama dimuat asinkron; isi form sekali saja dan jangan menimpa ketikan pengguna.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !defaultAddress) return;
    prefilled.current = true;
    setFullName(defaultAddress.recipientName ?? profile?.fullName ?? '');
    setPhone(stripCountryCode(defaultAddress.phone));
    setAddress(defaultAddress.streetAddress ?? '');
    setKodePos(defaultAddress.postalCode ?? '');
    if (defaultAddress.province && PROVINCES.includes(defaultAddress.province)) setProvinsi(defaultAddress.province);
    if (defaultAddress.city && CITIES.includes(defaultAddress.city)) setKota(defaultAddress.city);
    if (defaultAddress.district && DISTRICTS.includes(defaultAddress.district)) setKecamatan(defaultAddress.district);
  }, [defaultAddress, profile?.fullName]);

  // Courier & Payment
  const [selectedCourier, setSelectedCourier] = useState<Courier>({
    id: 'jnt',
    name: 'J&T Express Regular',
    cost: 12000,
    eta: formatEtaRange(new Date(), 2, 4),
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('qris');

  // Voucher state
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Validation & Submit
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Satu kunci per sesi checkout: klik/retry berulang tidak membuat pesanan ganda.
  const idempotencyKey = useRef(newIdempotencyKey());

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = cart.length > 0 ? calculateShippingFee(subtotal, selectedCourier) : 0;
  const discount = cart.length > 0 && appliedVoucher ? Math.min(appliedVoucher.amount, subtotal) : 0;
  const serviceFee = cart.length > 0 ? SERVICE_FEE : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount + serviceFee);

  const handleApplyVoucher = async () => {
    const clean = voucherInput.trim().toUpperCase();
    setVoucherError(null);
    if (!clean) {
      setVoucherError('Masukkan kode kupon terlebih dahulu.');
      return;
    }
    try {
      const result = await onValidateVoucher(clean, subtotal);
      if (result.valid) setAppliedVoucher({ code: result.code, amount: result.discount });
      else setVoucherError(describeVoucherReason(result.reason));
    } catch (e) {
      setVoucherError(describeError(e));
    }
  };

  const validateAndSubmit = async () => {
    if (cart.length === 0 || isSubmitting) return;
    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Masukkan alamat surel aktif yang valid (contoh: nama@email.com).';
    }
    const phoneDigits = phone.replace(/[\s-]/g, '').replace(/^(\+62|62|0)/, '');
    if (!/^8\d{8,12}$/.test(phoneDigits)) {
      errors.phone = 'Masukkan nomor WhatsApp/telepon Indonesia yang valid (contoh: 812-3456-7890).';
    }
    if (!fullName.trim()) {
      errors.fullName = 'Nama lengkap penerima wajib diisi.';
    }
    if (!address.trim() || address.trim().length < 10) {
      errors.address = 'Mohon lengkapi alamat pengiriman beserta nomor rumah atau RT/RW.';
    }
    if (!/^\d{5}$/.test(kodePos.trim())) {
      errors.kodePos = 'Kode pos harus 5 digit angka.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setActiveStep(1);
      return;
    }

    const phoneFull = `+62 ${phone.replace(/^(\+62|62|0)/, '').trim()}`;
    const checkoutAddress = {
      recipientName: fullName.trim(),
      phone: phoneFull,
      email: email.trim(),
      province: provinsi,
      city: kota,
      district: kecamatan,
      postalCode: kodePos.trim(),
      fullAddress: address.trim(),
    };
    const input: PlaceOrderInput = {
      // Hanya identitas varian + jumlah yang dikirim; harga dihitung ulang server.
      items: cart.map((c) => ({
        productId: c.productId,
        size: c.size,
        color: c.color,
        quantity: c.quantity,
      })),
      address: checkoutAddress,
      courierId: selectedCourier.id,
      paymentMethod,
      voucherCode: appliedVoucher?.code ?? null,
      idempotencyKey: idempotencyKey.current,
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onPlaceOrder(input, {
        saveAddress: saveAddress
          ? { label: 'Rumah', ...checkoutAddress, courierNote: undefined }
          : null,
      });
    } catch (e) {
      setSubmitError(describeError(e));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1440px] w-full mx-auto px-margin md:px-margin-desktop py-space-md md:py-space-xl">
        {/* Top Flow Stepper Header */}
        <CheckoutHeader activeStep={activeStep} setActiveStep={setActiveStep} />

        {/* Main Content 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* LEFT COLUMN: Forms, Delivery, Payment Tiers */}
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* FORM STEP 1: Kontak & Alamat Pengiriman */}
            <ContactStep
              setActiveStep={setActiveStep}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
              fullName={fullName}
              setFullName={setFullName}
              address={address}
              setAddress={setAddress}
              provinsi={provinsi}
              setProvinsi={setProvinsi}
              kota={kota}
              setKota={setKota}
              kecamatan={kecamatan}
              setKecamatan={setKecamatan}
              kodePos={kodePos}
              setKodePos={setKodePos}
              saveAddress={saveAddress}
              setSaveAddress={setSaveAddress}
              formErrors={formErrors}
            />

            {/* FORM STEP 2: Opsi Ekspedisi / Pilihan Kurir */}
            <CourierStep
              subtotal={subtotal}
              setActiveStep={setActiveStep}
              selectedCourier={selectedCourier}
              setSelectedCourier={setSelectedCourier}
            />

            {/* FORM STEP 3: Opsi Metode Pembayaran Lokal Terpercaya */}
            <PaymentStep
              setActiveStep={setActiveStep}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </div>

          {/* RIGHT COLUMN: Shopping Cart Summary & Sticky Cost Breakdown */}
          <aside className="lg:col-span-5 sticky top-28 space-y-space-md">
            <CartSummary
              freeShippingApplied={cart.length > 0 && qualifiesForFreeShipping(subtotal, selectedCourier)}
              kecamatan={kecamatan}
              selectedCourier={selectedCourier}
              voucherInput={voucherInput}
              setVoucherInput={setVoucherInput}
              appliedVoucher={appliedVoucher}
              setAppliedVoucher={setAppliedVoucher}
              voucherError={voucherError}
              handleApplyVoucher={handleApplyVoucher}
              isSubmitting={isSubmitting}
              submitError={submitError}
              subtotal={subtotal}
              totalItems={totalItems}
              shippingFee={shippingFee}
              discount={discount}
              serviceFee={serviceFee}
              grandTotal={grandTotal}
              validateAndSubmit={validateAndSubmit}
              cart={cart}
              onUpdateQty={onUpdateQty}
              onRemoveItem={onRemoveItem}
              onOpenProduct={onOpenProduct}
              onNavigateCatalog={onNavigateCatalog}
            />

            {/* Help & Customer Care Card */}
            <HelpCard />
          </aside>
        </div>
      </div>
    </div>
  );
};
