import React, { useState, useEffect } from 'react';
import { Order, formatRupiah } from '../data/storeData';
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
    navigator.clipboard?.writeText((order.vaNumber || '').replace(/\s/g, '')).catch(() => {});
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
      <StatusRibbon />

      <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-lg md:py-space-xl w-full">
        {/* Hero Header / Celebration Section */}
        <ConfirmationHero order={order} secondsLeft={secondsLeft} copiedRef={copiedRef} formatTimer={formatTimer} handleCopyRef={handleCopyRef} />

        {/* Main Editorial 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop">
          {/* LEFT COLUMN: Payment Action & Instructions (7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-space-lg">
            {/* Payment Callout Card */}
            <PaymentCard order={order} copiedVa={copiedVa} statusNotice={statusNotice} uploadedFileName={uploadedFileName} handleCopyVa={handleCopyVa} handleCheckStatus={handleCheckStatus} handleUploadProof={handleUploadProof} />

            {/* Tabbed Transfer Guides */}
            <TransferGuides order={order} activeGuide={activeGuide} setActiveGuide={setActiveGuide} />

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
    </div>
  );
};
