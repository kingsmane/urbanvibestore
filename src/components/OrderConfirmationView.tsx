import React, { useState, useEffect } from 'react';
import { Order } from '../data/storeData';
import { ORDER_STATUS_LABEL, isAwaitingPayment } from '../lib/orderStatus';
import { StatusRibbon } from './confirmation/StatusRibbon';
import { ConfirmationHero } from './confirmation/ConfirmationHero';
import { PaymentCard } from './confirmation/PaymentCard';
import { TransferGuides } from './confirmation/TransferGuides';
import { NextStepsCard } from './confirmation/NextStepsCard';
import { ReceiptCard } from './confirmation/ReceiptCard';
import { SecurityStamp } from './confirmation/SecurityStamp';

interface OrderConfirmationViewProps {
  order: Order;
  onNavigateCatalog: () => void;
  onNavigateAccount: () => void;
  /** Muat ulang status pesanan dari server. */
  onRefresh: () => Promise<void>;
  onCancelOrder: (orderId: string) => Promise<void>;
}

const secondsUntil = (iso: string | undefined, now: number): number =>
  iso ? Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000)) : 0;

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({
  order,
  onNavigateCatalog,
  onNavigateAccount,
  onRefresh,
  onCancelOrder,
}) => {
  const [now, setNow] = useState(() => Date.now());
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedVa, setCopiedVa] = useState(false);
  const [activeGuide, setActiveGuide] = useState<'mobile' | 'klikbca' | 'atm'>('mobile');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Hitung mundur dari batas waktu bayar yang ditetapkan server.
  const awaiting = isAwaitingPayment(order.status);
  useEffect(() => {
    if (!awaiting) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [awaiting]);
  const secondsLeft = awaiting ? secondsUntil(order.paymentExpiresAt, now) : 0;

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
    navigator.clipboard?.writeText((order.vaNumber || '').replace(/\s/g, '')).catch(() => {});
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2200);
  };

  // Status pembayaran hanya berasal dari server (PRD 6.6): tombol ini memuat ulang,
  // tidak pernah menandai lunas dari sisi browser.
  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await onRefresh();
      setStatusNotice('Status diperbarui dari server. Pembayaran diverifikasi otomatis setelah kami menerimanya.');
    } catch {
      setStatusNotice('Tidak dapat memeriksa status saat ini. Coba lagi sebentar lagi.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCancel = async () => {
    if (isCancelling) return;
    setIsCancelling(true);
    try {
      await onCancelOrder(order.id);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Top Progress & Status Ribbon */}
      <StatusRibbon />

      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg md:py-space-xl w-full">
        {/* Hero Header / Celebration Section */}
        <ConfirmationHero
          order={order}
          secondsLeft={secondsLeft}
          copiedRef={copiedRef}
          formatTimer={formatTimer}
          handleCopyRef={handleCopyRef}
        />

        {/* Main Editorial 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
          {/* LEFT COLUMN: Payment Action & Instructions (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Payment Callout Card */}
            <PaymentCard
              order={order}
              copiedVa={copiedVa}
              statusNotice={statusNotice}
              isChecking={isChecking}
              isCancelling={isCancelling}
              handleCopyVa={handleCopyVa}
              handleCheckStatus={handleCheckStatus}
              handleCancel={handleCancel}
            />

            {/* Tabbed Transfer Guides */}
            {awaiting && order.vaNumber && (
              <TransferGuides order={order} activeGuide={activeGuide} setActiveGuide={setActiveGuide} />
            )}

            {/* Next Steps & Assistance Card */}
            <NextStepsCard order={order} onNavigateCatalog={onNavigateCatalog} onNavigateAccount={onNavigateAccount} />
          </section>

          {/* RIGHT COLUMN: Structured Receipt & Breakdown (5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-space-lg">
            {/* Editorial Receipt Card */}
            <ReceiptCard order={order} />

            {/* Security & Authenticity Stamp */}
            <SecurityStamp />
          </section>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">
        {ORDER_STATUS_LABEL[order.status]}
      </span>
    </div>
  );
};
