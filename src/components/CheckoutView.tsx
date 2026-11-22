import React, { useState } from 'react';
import { CheckoutHeader } from './checkout/CheckoutHeader';
import { AccessModePanel } from './checkout/AccessModePanel';
import { ContactStep } from './checkout/ContactStep';
import { CourierStep } from './checkout/CourierStep';
import { PaymentStep } from './checkout/PaymentStep';
import { CartSummary } from './checkout/CartSummary';
import { HelpCard } from './checkout/HelpCard';
import { calculateShippingFee, qualifiesForFreeShipping } from '../lib/pricing';
import type { AccessMode, Courier, PaymentMethod, Voucher } from './checkout/types';
import {
  CartItem,
  Order,
  formatRupiah,
  formatDateTimeId,
  formatEtaRange,
  generateOrderNumber,
  generateVaNumber,
} from '../data/storeData';

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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [provinsi, setProvinsi] = useState('DKI Jakarta');
  const [kota, setKota] = useState('Jakarta Selatan');
  const [kecamatan, setKecamatan] = useState('Kebayoran Baru');
  const [kodePos, setKodePos] = useState('');
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
    eta: formatEtaRange(new Date(), 2, 4),
  });
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'va' | 'cc'>('qris');

  // Voucher state
  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; amount: number } | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  // Validation & Submit
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSwitchMode = (mode: 'guest' | 'member') => {
    setAccessMode(mode);
  };

  const handleApplyVoucher = () => {
    const clean = voucherInput.trim().toUpperCase();
    setVoucherError(null);
    if (clean === 'URBANFIRST' || clean === 'ESSENTIAL2026') {
      setAppliedVoucher({ code: clean, amount: 50000 });
    } else if (!clean) {
      setVoucherError('Masukkan kode kupon terlebih dahulu.');
    } else {
      setVoucherError('Kode kupon tidak valid atau sudah tidak berlaku.');
    }
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = cart.length > 0 ? calculateShippingFee(subtotal, selectedCourier) : 0;
  const discount = cart.length > 0 && appliedVoucher ? appliedVoucher.amount : 0;
  const serviceFee = cart.length > 0 ? 1000 : 0;
  const grandTotal = Math.max(0, subtotal + shippingFee - discount + serviceFee);

  const validateAndSubmit = () => {
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

    setIsSubmitting(true);
    setTimeout(() => {
      const now = new Date();
      const newOrder: Order = {
        id: 'ord-' + now.getTime(),
        orderNumber: generateOrderNumber(now),
        dateStr: formatDateTimeId(now),
        status: 'PENDING_PAYMENT',
        paymentMethod:
          paymentMethod === 'va'
            ? 'BCA Virtual Account (Otomatis)'
            : paymentMethod === 'qris'
            ? 'BCA Virtual Account / QRIS'
            : 'Kartu Kredit / Debit 3DS',
        vaNumber: generateVaNumber(),
        subtotal,
        shippingFee,
        discount,
        voucherCode: appliedVoucher?.code,
        serviceFee,
        total: grandTotal,
        courierName: selectedCourier.name,
        estimatedArrival: selectedCourier.eta,
        recipientName: fullName,
        recipientPhone: `+62 ${phone.replace(/^(\+62|62|0)/, '').trim()}`,
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
        <CheckoutHeader activeStep={activeStep} setActiveStep={setActiveStep} />

        {/* Main Content 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">
          {/* LEFT COLUMN: Forms, Delivery, Payment Tiers */}
          <div className="lg:col-span-7 flex flex-col gap-space-xl">
            {/* Guest Toggle / Member Switch Panel */}
            <AccessModePanel accessMode={accessMode} handleSwitchMode={handleSwitchMode} />

            {/* FORM STEP 1: Kontak & Alamat Pengiriman */}
            <ContactStep setActiveStep={setActiveStep} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} fullName={fullName} setFullName={setFullName} address={address} setAddress={setAddress} provinsi={provinsi} setProvinsi={setProvinsi} kota={kota} setKota={setKota} kecamatan={kecamatan} setKecamatan={setKecamatan} kodePos={kodePos} setKodePos={setKodePos} saveAddress={saveAddress} setSaveAddress={setSaveAddress} formErrors={formErrors} />

            {/* FORM STEP 2: Opsi Ekspedisi / Pilihan Kurir */}
            <CourierStep subtotal={subtotal} setActiveStep={setActiveStep} selectedCourier={selectedCourier} setSelectedCourier={setSelectedCourier} />

            {/* FORM STEP 3: Opsi Metode Pembayaran Lokal Terpercaya */}
            <PaymentStep setActiveStep={setActiveStep} paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          </div>

          {/* RIGHT COLUMN: Shopping Cart Summary & Sticky Cost Breakdown */}
          <aside className="lg:col-span-5 sticky top-28 space-y-space-md">
            <CartSummary freeShippingApplied={cart.length > 0 && qualifiesForFreeShipping(subtotal, selectedCourier)} kecamatan={kecamatan} selectedCourier={selectedCourier} voucherInput={voucherInput} setVoucherInput={setVoucherInput} appliedVoucher={appliedVoucher} setAppliedVoucher={setAppliedVoucher} voucherError={voucherError} handleApplyVoucher={handleApplyVoucher} isSubmitting={isSubmitting} subtotal={subtotal} totalItems={totalItems} shippingFee={shippingFee} discount={discount} serviceFee={serviceFee} grandTotal={grandTotal} validateAndSubmit={validateAndSubmit} cart={cart} onUpdateQty={onUpdateQty} onRemoveItem={onRemoveItem} onOpenProduct={onOpenProduct} onNavigateCatalog={onNavigateCatalog} />

            {/* Help & Customer Care Card */}
            <HelpCard />
          </aside>
        </div>
      </div>
    </div>
  );
};
