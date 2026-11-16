import React, { useState, useEffect } from 'react';
import {
  Order,
  SavedAddress,
  FitProfile,
  formatRupiah,
} from '../data/storeData';

interface AccountViewProps {
  orders: Order[];
  addresses: SavedAddress[];
  fitProfile: FitProfile;
  initialTab?: 'orders' | 'addresses' | 'fitprofile' | 'settings';
  onUpdateAddresses: (addrs: SavedAddress[]) => void;
  onNavigateHome: () => void;
  onNavigateSizeGuide: () => void;
  onPayOrder: (order: Order) => void;
  onReorderItem: (name: string, price: number, image: string) => void;
  onOpenProduct: (productId: string) => void;
  onShowToast: (msg: string, sub?: string) => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  orders,
  addresses,
  fitProfile,
  initialTab = 'orders',
  onUpdateAddresses,
  onNavigateHome,
  onNavigateSizeGuide,
  onPayOrder,
  onReorderItem,
  onOpenProduct,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'fitprofile' | 'settings'>(
    initialTab
  );
  const [countdownSec, setCountdownSec] = useState(13 * 60 + 58);
  const [copiedVa, setCopiedVa] = useState(false);
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);
  const [checkResultText, setCheckResultText] = useState<Record<string, string>>({});
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Address Form Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addrLabel, setAddrLabel] = useState('Rumah');
  const [addrRecipient, setAddrRecipient] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrNote, setAddrNote] = useState('');

  // Notification Settings
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEarlyAccess, setNotifEarlyAccess] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdownSec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleCopyVa = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleSimulateCheck = (orderId: string) => {
    setCheckingOrderId(orderId);
    setTimeout(() => {
      setCheckingOrderId(null);
      setCheckResultText((prev) => ({
        ...prev,
        [orderId]: 'Menunggu Transfer',
      }));
      onShowToast(
        'Mutasi VA 8277 0812 3456 7890 belum terdeteksi',
        'Silakan selesaikan pembayaran via m-BCA atau ATM'
      );
    }, 1000);
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddrLabel('Apartemen');
    setAddrRecipient('Naya Rahmadani (+62 812-3456-4491)');
    setAddrAddress('');
    setAddrNote('');
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrRecipient(addr.recipient);
    setAddrAddress(addr.fullAddress);
    setAddrNote(addr.courierNote);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrAddress.trim()) return;
    if (editingAddress) {
      const updated = addresses.map((a) =>
        a.id === editingAddress.id
          ? {
              ...a,
              label: addrLabel,
              recipient: addrRecipient,
              fullAddress: addrAddress,
              courierNote: addrNote || 'Catatan kurir: Hubungi penerima saat tiba.',
            }
          : a
      );
      onUpdateAddresses(updated);
      onShowToast('Alamat pengiriman berhasil diperbarui');
    } else {
      const newAddr: SavedAddress = {
        id: 'addr-' + Date.now(),
        label: addrLabel || 'Lainnya',
        isPrimary: addresses.length === 0,
        recipient: addrRecipient,
        phone: '+62 812-3456-4491',
        fullAddress: addrAddress,
        courierNote: addrNote || 'Catatan kurir: Titipkan di resepsionis/pos.',
      };
      onUpdateAddresses([...addresses, newAddr]);
      onShowToast('Alamat baru berhasil ditambahkan');
    }
    setAddressModalOpen(false);
  };

  const handleSetPrimaryAddress = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isPrimary: a.id === id,
    }));
    onUpdateAddresses(updated);
    onShowToast('Alamat utama berhasil diubah');
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING_PAYMENT').length;

  return (
    <div className="flex flex-col w-full">
      {/* Top Profile Dossier & Quick Metrics (Swiss Identity System) */}
      <section className="w-full bg-canvas-base border-b border-border-hairline">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-xl">
          {/* Breadcrumb Bar */}
          <div className="flex items-center gap-space-xs text-outline mb-space-md">
            <button
              type="button"
              onClick={onNavigateHome}
              className="font-label-caps text-label-caps uppercase hover:text-primary transition-colors cursor-pointer"
            >
              UrbanStore
            </button>
            <span className="text-outline">/</span>
            <span className="font-label-caps text-label-caps uppercase text-primary font-semibold">
              Akun Saya &amp; Riwayat Pesanan
            </span>
          </div>

          {/* Main Profile Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* User Bio Block */}
            <div className="lg:col-span-6 flex items-start gap-space-md">
              <div className="relative shrink-0">
                <img
                  alt="Naya Rahmadani"
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 md:w-24 md:h-24 object-cover border border-border-strong bg-surface-muted"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP9KKlBDfy2uA42LrN4kNf5TeAoNWc7oaBngNFtdLENMk1dbg-K-jNN_weY0ZldlyOjoOlNYbBS7JvTk7jP8ff0lm1zmfkPC7meFmg9Lu9fwk9Xp80RYkbZ9QBM3bP79sHdH0av5UAKQf7C-JM0VzBFRZDX_UWFl_xfNYzNsCaQbwmRM3BCFkJ0tqiyI6H3CL1a3HldY9UO7HPhhnakyar9_MFxtuYuQs4w02DEJhG"
                />
                <div
                  className="absolute -bottom-1 -right-1 bg-badge-promo text-text-on-accent p-0.5 border border-border-strong"
                  title="Akun Terverifikasi"
                >
                  <span className="material-symbols-outlined text-[14px] font-bold block">
                    verified
                  </span>
                </div>
              </div>
              <div className="space-y-space-xs">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">
                    Naya Rahmadani
                  </h1>
                  <span className="bg-surface-muted text-on-surface border border-border-hairline font-label-caps text-label-caps uppercase px-space-xs py-0.5">
                    Active Shopper
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-[16px] text-outline">mail</span>
                  naya.rahmadani@email.com
                </p>
                <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 pt-space-xs">
                  <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      chat
                    </span>
                    WhatsApp Terverifikasi (+62 812-****-4491)
                  </span>
                  <span className="text-outline font-label-caps text-label-caps uppercase">
                    Member Sejak: Okt 2024
                  </span>
                </div>
              </div>
            </div>

            {/* Metric Strips (Monochrome Architecture) */}
            <div className="lg:col-span-6 grid grid-cols-3 border border-border-hairline bg-surface-subtle">
              <div className="p-space-md border-r border-border-hairline flex flex-col justify-between">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                  Total Pesanan
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-primary">
                    0{orders.length}
                  </span>
                  <span className="font-body-sm text-body-sm text-outline">trx</span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-1">
                  2 Selesai · 1 Proses
                </span>
              </div>
              <div className="p-space-md border-r border-border-hairline bg-canvas-base flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 h-2 bg-badge-promo"></div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                  Menunggu Bayar
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-headline-lg text-headline-lg text-primary">
                    0{pendingCount}
                  </span>
                  <span className="font-body-sm text-body-sm text-error font-medium">
                    Batas 14m
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-error font-semibold mt-1">
                  Perlu Tindakan
                </span>
              </div>
              <div className="p-space-md flex flex-col justify-between">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                  Kupon Aktif
                </span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-headline-sm md:font-headline-md text-headline-sm md:text-headline-md text-primary">
                    Rp 50K
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-1">
                  Berlaku s/d 31 Des
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Rigid Swiss Rule) */}
          <div className="mt-space-xl flex items-center gap-space-lg overflow-x-auto no-scrollbar border-b border-border-hairline">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'text-primary font-bold border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              Riwayat Pesanan{' '}
              <span className="ml-1 px-1.5 py-0.5 bg-border-strong text-canvas-base text-[10px]">
                {orders.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'addresses'
                  ? 'text-primary font-bold border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              Buku Alamat <span className="ml-1 text-outline">({addresses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('fitprofile')}
              className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'fitprofile'
                  ? 'text-primary font-bold border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              My Fit Profile (Ukuran)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`relative pb-space-sm font-label-caps text-label-caps uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'text-primary font-bold border-primary'
                  : 'text-on-surface-variant hover:text-primary border-transparent'
              }`}
            >
              Pengaturan &amp; Notifikasi
            </button>
          </div>
        </div>
      </section>

      {/* Content Work Area (Main Panel + Context Sidebar) */}
      <section className="w-full">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* LEFT 8-COLUMN MAIN STREAM */}
            <div className="lg:col-span-8 space-y-space-lg">
              {/* TAB 1: RIWAYAT PESANAN */}
              {activeTab === 'orders' && (
                <div className="space-y-space-lg">
                  {orders.map((ord) => {
                    if (ord.status === 'PENDING_PAYMENT') {
                      return (
                        <div
                          key={ord.id}
                          className="bg-canvas-base border-2 border-border-strong shadow-[4px_4px_0px_0px_#111827]"
                        >
                          {/* Order Header Meta */}
                          <div className="bg-surface-subtle p-space-md border-b border-border-strong flex flex-wrap items-center justify-between gap-space-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-space-xs flex-wrap">
                                <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                                  {ord.orderNumber}
                                </span>
                                <span className="text-outline">/</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {ord.dateStr}
                                </span>
                              </div>
                              <div className="flex items-center gap-space-xs text-error font-body-sm text-body-sm">
                                <span className="material-symbols-outlined text-[16px]">
                                  schedule
                                </span>
                                <span>
                                  Batas Bayar:{' '}
                                  <strong className="font-semibold">
                                    {formatTimer(countdownSec)}
                                  </strong>{' '}
                                  tersisa
                                </span>
                              </div>
                            </div>
                            {/* Status Badge */}
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-badge-promo text-text-on-accent font-label-caps text-label-caps uppercase font-bold border border-border-strong">
                                <span className="w-2 h-2 rounded-full bg-text-on-accent animate-pulse"></span>
                                Menunggu Pembayaran
                              </span>
                            </div>
                          </div>

                          {/* Payment Notice Panel (VA Info Direct) */}
                          <div className="p-space-md bg-surface-muted border-b border-border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                            <div className="space-y-1">
                              <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                                Metode: {ord.paymentMethod}
                              </p>
                              <div className="flex items-center gap-space-sm">
                                <span className="font-headline-sm text-headline-sm font-bold tracking-widest text-primary font-mono select-all">
                                  {ord.vaNumber || '8277 0812 3456 7890'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyVa('8277081234567890')}
                                  className={`inline-flex items-center gap-1 font-label-caps text-label-caps uppercase text-primary hover:text-outline border border-border-hairline px-2 py-1 transition-colors cursor-pointer ${
                                    copiedVa ? 'bg-badge-promo' : 'bg-canvas-base'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    content_copy
                                  </span>
                                  <span>{copiedVa ? 'Tersalin!' : 'Salin'}</span>
                                </button>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                                Total Tagihan
                              </p>
                              <p className="font-price-display text-price-display text-primary">
                                {formatRupiah(ord.total)}
                              </p>
                              <p className="font-label-sm text-label-sm text-outline">
                                Termasuk kode unik verifikasi otomatis
                              </p>
                            </div>
                          </div>

                          {/* Order Item List */}
                          <div className="divide-y divide-border-hairline">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-space-md flex items-start gap-space-md"
                              >
                                <img
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
                                  src={item.image}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start gap-space-xs">
                                    <div>
                                      <h2 className="font-body-md text-body-md font-semibold text-primary">
                                        {item.name}
                                      </h2>
                                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                        Warna: {item.color} · Ukuran: {item.size}
                                        {item.fitProfileMatch ? ' (Fit My Profile)' : ''}
                                      </p>
                                      <p className="font-label-sm text-label-sm text-outline mt-1">
                                        SKU: {item.sku} · Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <span className="font-headline-sm text-headline-sm text-primary">
                                      {formatRupiah(item.price)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Actions */}
                          <div className="p-space-md bg-canvas-base border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-md">
                            <div className="flex items-center gap-space-xs text-on-surface-variant">
                              <span className="material-symbols-outlined text-[18px] text-badge-promo bg-primary p-0.5">
                                notifications_active
                              </span>
                              <span className="font-body-sm text-body-sm">
                                Instruksi &amp; panduan transfer terkirim ke WhatsApp Naya
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-space-sm w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleSimulateCheck(ord.id)}
                                className="flex-1 sm:flex-initial px-space-md py-2.5 font-label-caps text-label-caps uppercase bg-canvas-base text-primary border border-border-strong hover:bg-surface-muted transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span
                                  className={`material-symbols-outlined text-[16px] ${
                                    checkingOrderId === ord.id ? 'animate-spin' : ''
                                  }`}
                                >
                                  sync
                                </span>
                                <span>
                                  {checkingOrderId === ord.id
                                    ? 'Memverifikasi...'
                                    : checkResultText[ord.id] || 'Cek Status Otomatis'}
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onPayOrder(ord)}
                                className="flex-1 sm:flex-initial px-space-lg py-2.5 font-label-caps text-label-caps uppercase bg-badge-promo text-text-on-accent hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-1.5 font-bold cursor-pointer"
                              >
                                <span>Bayar Sekarang</span>
                                <span className="material-symbols-outlined text-[16px]">
                                  arrow_forward
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (ord.status === 'IN_TRANSIT') {
                      return (
                        <div
                          key={ord.id}
                          className="bg-canvas-base border border-border-hairline"
                        >
                          {/* Meta Header */}
                          <div className="p-space-md bg-surface-subtle border-b border-border-hairline flex flex-wrap items-center justify-between gap-space-sm">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-space-xs flex-wrap">
                                <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                                  {ord.orderNumber}
                                </span>
                                <span className="text-outline">/</span>
                                <span className="font-body-sm text-body-sm text-on-surface-variant">
                                  {ord.dateStr}
                                </span>
                              </div>
                              <p className="font-body-sm text-body-sm text-on-surface-variant">
                                Kurir: <strong>{ord.courierName}</strong> · No. Resi:{' '}
                                <span className="font-mono text-primary font-medium">
                                  {ord.trackingNumber}
                                </span>
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-primary font-label-caps text-label-caps uppercase font-semibold border border-border-hairline">
                              <span className="material-symbols-outlined text-[14px] text-primary">
                                local_shipping
                              </span>
                              Dalam Pengiriman
                            </span>
                          </div>

                          {/* Tracking Progress Flow */}
                          <div className="p-space-md bg-canvas-base border-b border-border-hairline">
                            <div className="space-y-space-sm">
                              <div className="flex items-center justify-between text-body-sm">
                                <span className="font-medium text-primary flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                                  Sedang Transit: Hub Logistik Jakarta Selatan
                                </span>
                                <span className="text-outline font-label-sm text-label-sm">
                                  Estimasi Tiba: {ord.estimatedArrival}
                                </span>
                              </div>
                              {/* Linear Segmented Tracker */}
                              <div className="w-full grid grid-cols-4 gap-1 h-1.5 bg-surface-muted">
                                <div className="bg-primary h-full"></div>
                                <div className="bg-primary h-full"></div>
                                <div className="bg-primary h-full animate-pulse"></div>
                                <div className="bg-border-hairline h-full"></div>
                              </div>
                              <div className="flex justify-between text-outline font-label-caps text-[10px] uppercase">
                                <span>Cikarang Hub</span>
                                <span>Tersortir</span>
                                <span className="text-primary font-bold">Kurir Menuju Lokasi</span>
                                <span>Diterima</span>
                              </div>
                            </div>
                          </div>

                          {/* Item */}
                          {ord.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-space-md flex items-start gap-space-md"
                            >
                              <img
                                alt={item.name}
                                referrerPolicy="no-referrer"
                                className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
                                src={item.image}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-space-xs">
                                  <div>
                                    <h2 className="font-body-md text-body-md font-semibold text-primary">
                                      {item.name}
                                    </h2>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                      Warna: {item.color} · Ukuran: {item.size}
                                    </p>
                                    <p className="font-label-sm text-label-sm text-outline mt-1">
                                      Alamat Tujuan: {ord.shippingAddress}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-headline-sm text-headline-sm text-primary">
                                      {formatRupiah(item.price)}
                                    </span>
                                    <p className="font-label-sm text-label-sm text-secondary font-medium">
                                      Bebas Ongkir
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          {/* Actions */}
                          <div className="p-space-md bg-surface-subtle border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-md">
                            <span className="font-body-sm text-body-sm text-outline">
                              Metode Pembayaran: {ord.paymentMethod}
                            </span>
                            <div className="flex items-center gap-space-sm">
                              <button
                                type="button"
                                onClick={() => setTrackingModalOpen(true)}
                                className="px-space-md py-2 font-label-caps text-label-caps uppercase bg-canvas-base border border-border-strong text-primary hover:bg-surface-muted transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  location_on
                                </span>
                                <span>Lacak Pengiriman Real-Time</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setInvoiceModalOrder(ord)}
                                className="px-space-md py-2 font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">
                                  description
                                </span>
                                <span>Rincian Faktur</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // COMPLETED ORDER
                    return (
                      <div
                        key={ord.id}
                        className="bg-canvas-base border border-border-hairline"
                      >
                        <div className="p-space-md bg-surface-subtle border-b border-border-hairline flex flex-wrap items-center justify-between gap-space-sm">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-space-xs flex-wrap">
                              <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                                {ord.orderNumber}
                              </span>
                              <span className="text-outline">/</span>
                              <span className="font-body-sm text-body-sm text-on-surface-variant">
                                {ord.dateStr}
                              </span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant">
                              Paket telah diterima oleh: <strong>{ord.receivedBy}</strong>
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-muted text-primary font-label-caps text-label-caps uppercase font-semibold border border-border-hairline">
                            <span className="material-symbols-outlined text-[14px] text-secondary">
                              check_circle
                            </span>
                            Selesai
                          </span>
                        </div>

                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-space-md flex items-start gap-space-md"
                          >
                            <img
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="w-20 h-24 object-cover bg-surface-muted border border-border-hairline shrink-0"
                              src={item.image}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-space-xs">
                                <div>
                                  <h2 className="font-body-md text-body-md font-semibold text-primary">
                                    {item.name}
                                  </h2>
                                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                    Warna: {item.color} · Edisi: {item.edition || 'Urban Essentials'}
                                  </p>
                                  <p className="font-label-sm text-label-sm text-outline mt-1">
                                    {item.reviewText || 'Ulasan: 5.0 (Sudah Dinilai)'}
                                  </p>
                                </div>
                                <span className="font-headline-sm text-headline-sm text-primary">
                                  {formatRupiah(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="p-space-md bg-canvas-base border-t border-border-hairline flex flex-wrap items-center justify-between gap-space-md">
                          <button
                            type="button"
                            onClick={() => setInvoiceModalOrder(ord)}
                            className="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">download</span>
                            <span>Download Invoice PDF</span>
                          </button>
                          <div className="flex items-center gap-space-sm">
                            <a
                              className="px-space-md py-2 font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary transition-colors"
                              href="https://wa.me/628112345678"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Bantuan CS
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                const first = ord.items[0];
                                if (first) {
                                  onReorderItem(first.name, first.price, first.image);
                                }
                              }}
                              className="px-space-md py-2 font-label-caps text-label-caps uppercase bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent transition-colors flex items-center gap-1.5 font-bold cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">replay</span>
                              <span>Beli Lagi</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: BUKU ALAMAT */}
              {activeTab === 'addresses' && (
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
                    <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
                      Alamat Pengiriman Tersimpan
                    </h2>
                    <button
                      type="button"
                      onClick={openAddAddressModal}
                      className="px-space-md py-2 font-label-caps text-label-caps uppercase bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent transition-colors flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Tambah Alamat Baru
                    </button>
                  </div>

                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-space-lg bg-canvas-base relative ${
                        addr.isPrimary
                          ? 'border-2 border-border-strong'
                          : 'border border-border-hairline'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-space-xs">
                            {addr.isPrimary ? (
                              <>
                                <span className="font-label-caps text-label-caps uppercase bg-primary text-on-primary px-2 py-0.5 font-bold">
                                  Alamat Utama
                                </span>
                                <span className="font-label-caps text-label-caps uppercase text-outline">
                                  {addr.label}
                                </span>
                              </>
                            ) : (
                              <span className="font-label-caps text-label-caps uppercase bg-surface-muted text-on-surface px-2 py-0.5 border border-border-hairline">
                                {addr.label}
                              </span>
                            )}
                          </div>
                          <h3 className="font-headline-sm text-headline-sm text-primary pt-1">
                            {addr.recipient}
                          </h3>
                          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                            {addr.fullAddress}
                          </p>
                          <p className="font-label-sm text-label-sm text-outline pt-1">
                            {addr.courierNote}
                          </p>
                        </div>
                        <div className="flex items-center gap-space-xs">
                          {!addr.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryAddress(addr.id)}
                              className="font-label-caps text-label-caps uppercase text-on-surface-variant hover:text-primary px-2 py-1 border border-border-hairline mr-2 cursor-pointer"
                            >
                              Jadikan Utama
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openEditAddressModal(addr)}
                            className="p-2 text-outline hover:text-primary transition-colors cursor-pointer"
                            title="Ubah Alamat"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: FIT PROFILE */}
              {activeTab === 'fitprofile' && (
                <div className="space-y-space-md">
                  <div className="border-b border-border-hairline pb-space-sm">
                    <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
                      My Fit Profile (Ukuran Presisi)
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Data tubuh tersimpan untuk kalkulasi otomatis ukuran ideal di setiap halaman
                      produk UrbanStore.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
                    <div className="p-space-md bg-canvas-base border border-border-hairline">
                      <span className="font-label-caps text-label-caps uppercase text-outline">
                        Tinggi &amp; Berat Badan
                      </span>
                      <p className="font-headline-md text-headline-md text-primary mt-2">
                        {fitProfile.height} cm{' '}
                        <span className="text-outline text-headline-sm font-normal">
                          / {fitProfile.weight} kg
                        </span>
                      </p>
                      <span className="font-label-sm text-label-sm text-secondary block mt-2">
                        Proporsi Standar Reguler
                      </span>
                    </div>
                    <div className="p-space-md bg-canvas-base border border-border-hairline">
                      <span className="font-label-caps text-label-caps uppercase text-outline">
                        Rekomendasi Atasan
                      </span>
                      <p className="font-headline-md text-headline-md text-primary mt-2">
                        {fitProfile.recommendedTop}
                      </p>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mt-2">
                        Boxy / Relaxed Cut Fit
                      </span>
                    </div>
                    <div className="p-space-md bg-canvas-base border border-border-hairline">
                      <span className="font-label-caps text-label-caps uppercase text-outline">
                        Rekomendasi Bawahan
                      </span>
                      <p className="font-headline-md text-headline-md text-primary mt-2">
                        {fitProfile.recommendedBottom}
                      </p>
                      <span className="font-label-sm text-label-sm text-on-surface-variant block mt-2">
                        Lingkar Pinggang: ~69-71 cm
                      </span>
                    </div>
                  </div>

                  {/* Precision Measurement Blueprint Box */}
                  <div className="p-space-lg bg-surface-subtle border border-border-hairline mt-space-md">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-space-md">
                      <div className="space-y-1">
                        <h3 className="font-headline-sm text-headline-sm text-primary uppercase">
                          Kalibrasi Ulang Ukuran Tubuh
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-lg">
                          Gunakan kalkulator interaktif visual UrbanStore untuk mengukur ulang
                          lingkar dada, bahu, dan panjang inseam celana.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onNavigateSizeGuide}
                        className="px-space-md py-2.5 font-label-caps text-label-caps uppercase bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent transition-colors font-bold whitespace-nowrap cursor-pointer"
                      >
                        Ukur Visual Sekarang
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="space-y-space-md">
                  <div className="border-b border-border-hairline pb-space-sm">
                    <h2 className="font-headline-sm text-headline-sm uppercase tracking-tight text-primary">
                      Pengaturan Akun &amp; Notifikasi
                    </h2>
                  </div>
                  <div className="p-space-lg bg-canvas-base border border-border-hairline space-y-space-md">
                    <div className="flex items-center justify-between gap-space-md">
                      <div>
                        <h3 className="font-body-md text-body-md font-semibold text-primary">
                          Notifikasi WhatsApp Status Pengiriman
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Kirim pembaruan resi dan kurir bergerak secara otomatis ke +62
                          812-****-4491.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifWhatsapp}
                        onChange={(e) => {
                          setNotifWhatsapp(e.target.checked);
                          onShowToast('Preferensi notifikasi WhatsApp disimpan');
                        }}
                        className="w-5 h-5 accent-primary cursor-pointer shrink-0"
                      />
                    </div>
                    <div className="border-t border-border-hairline pt-space-md flex items-center justify-between gap-space-md">
                      <div>
                        <h3 className="font-body-md text-body-md font-semibold text-primary">
                          Peringatan Drop Koleksi Terbatas (Early Access)
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Dapatkan tautan private catalog 30 menit sebelum peluncuran resmi.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifEarlyAccess}
                        onChange={(e) => {
                          setNotifEarlyAccess(e.target.checked);
                          onShowToast('Preferensi Early Access disimpan');
                        }}
                        className="w-5 h-5 accent-primary cursor-pointer shrink-0"
                      />
                    </div>
                    <div className="border-t border-border-hairline pt-space-md flex items-center justify-between gap-space-md">
                      <div>
                        <h3 className="font-body-md text-body-md font-semibold text-primary">
                          Warta Surel Editorial Mingguan
                        </h3>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Rangkuman artikel desain, wawancara perancang busana, dan restock alert.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifNewsletter}
                        onChange={(e) => {
                          setNotifNewsletter(e.target.checked);
                          onShowToast('Preferensi Warta Surel disimpan');
                        }}
                        className="w-5 h-5 accent-primary cursor-pointer shrink-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT 4-COLUMN CONTEXTUAL SIDEBAR */}
            <div className="lg:col-span-4 space-y-space-lg">
              {/* Card 1: Fast Support & Concierge */}
              <div className="bg-canvas-base border border-border-hairline p-space-lg relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-outline">
                      Bantuan &amp; Layanan Pelanggan
                    </span>
                    <h3 className="font-headline-sm text-headline-sm uppercase text-primary mt-1">
                      Layanan Concierge 24/7
                    </h3>
                  </div>
                  <span className="material-symbols-outlined text-[24px] text-secondary">
                    support_agent
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm leading-relaxed">
                  Membutuhkan bantuan terkait pembayaran VA atau perubahan alamat pengiriman sebelum
                  resi terbit?
                </p>
                <div className="mt-space-md pt-space-md border-t border-border-hairline space-y-space-sm">
                  <a
                    className="w-full py-2.5 px-space-md bg-canvas-base border border-border-strong text-primary hover:bg-badge-promo hover:border-badge-promo hover:text-text-on-accent font-label-caps text-label-caps uppercase font-bold flex items-center justify-center gap-2 transition-colors"
                    href="https://wa.me/628112345678"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    WhatsApp Customer Care
                  </a>
                  <button
                    type="button"
                    onClick={onNavigateSizeGuide}
                    className="w-full py-2 px-space-md text-on-surface-variant hover:text-primary font-label-caps text-label-caps uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                    Kebijakan Retur Ukuran (7 Hari Bebas Biaya)
                  </button>
                </div>
              </div>

              {/* Card 2: Fit Recommendation Engine */}
              <div className="bg-surface-subtle border border-border-hairline p-space-lg space-y-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-badge-promo border border-border-strong"></span>
                    <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                      Rekomendasi Berdasarkan Ukuran Naya
                    </span>
                  </div>
                  <span className="font-label-caps text-[10px] text-outline uppercase">
                    Size S / 27
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Koleksi drop teranyar yang cocok persis dengan proporsi tinggi{' '}
                  {fitProfile.height} cm:
                </p>

                {/* Recommendation Item 1 */}
                <div
                  onClick={() =>
                    onReorderItem(
                      'Tailored Wool Minimal Overshirt',
                      649000,
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuCPc4d14kaVfodSipoXGJd_qEcy2g7bJpFho9jtnB1ltsoGIxrZ_NtEHJ_M9qvHZf0DgS4YXcy2KxxWocJ3nJqhkEWt8LAFX-Pp11URB-rqtYaxtfSwEXibjBgWhi5AuTQXHmJaiZWnPTzrrbPCptfNQmywW437FU4NYv5Ck9LRsjhHEFV0IRgMT_SdYKgDcSQmA-HeBemDQKamnKZ0XLlTCOHT922zAYcQ2gvomUte'
                    )
                  }
                  className="flex items-center gap-space-sm bg-canvas-base p-space-sm border border-border-hairline group cursor-pointer"
                >
                  <img
                    alt="Tailored Wool Minimal Overshirt"
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover bg-surface-muted border border-border-hairline shrink-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPc4d14kaVfodSipoXGJd_qEcy2g7bJpFho9jtnB1ltsoGIxrZ_NtEHJ_M9qvHZf0DgS4YXcy2KxxWocJ3nJqhkEWt8LAFX-Pp11URB-rqtYaxtfSwEXibjBgWhi5AuTQXHmJaiZWnPTzrrbPCptfNQmywW437FU4NYv5Ck9LRsjhHEFV0IRgMT_SdYKgDcSQmA-HeBemDQKamnKZ0XLlTCOHT922zAYcQ2gvomUte"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-label-caps text-[10px] text-secondary uppercase font-semibold">
                      Tersedia Ukuran S
                    </span>
                    <h4 className="font-body-sm text-body-sm font-semibold text-primary truncate group-hover:text-outline transition-colors">
                      Tailored Wool Minimal Overshirt
                    </h4>
                    <p className="font-price-display text-[14px] text-primary mt-1">Rp 649.000</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>

                {/* Recommendation Item 2 */}
                <div
                  onClick={() => onOpenProduct('prod-3')}
                  className="flex items-center gap-space-sm bg-canvas-base p-space-sm border border-border-hairline group cursor-pointer"
                >
                  <img
                    alt="Pleated Wide-Leg Trousers"
                    referrerPolicy="no-referrer"
                    className="w-16 h-20 object-cover bg-surface-muted border border-border-hairline shrink-0"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYQiGggPIhja1aaDV4IfPVaEhoPR6Lo_lSUaoOMpS-X3GKPH2bMuv8a3Q4ni6Jh4EiP9BAQj5JHsPcpWmZp1CoIesDe13JzoA8BlnfqPciWW5H5dThMc-Qm7EXNy8EeXcGIA_9nj_DgCADO3wfESH0YY4twqLHGRSZOYfkXcm2lQBWXQVISE6tg3BfLpjNhX4m8w5VK8B2r1zkfxWH9buMWSGUFRdWzHPpXjPeJEJW"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-label-caps text-[10px] text-secondary uppercase font-semibold">
                      Tersedia Ukuran 27
                    </span>
                    <h4 className="font-body-sm text-body-sm font-semibold text-primary truncate group-hover:text-outline transition-colors">
                      Pleated Wide-Leg Trousers
                    </h4>
                    <p className="font-price-display text-[14px] text-primary mt-1">Rp 529.000</p>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="w-full text-center font-label-caps text-label-caps uppercase text-primary hover:text-outline transition-colors pt-space-xs cursor-pointer"
                >
                  Jelajahi Semua Drop Terbaru →
                </button>
              </div>

              {/* Card 3: UrbanStore Membership Status */}
              <div className="bg-primary text-on-primary p-space-lg border border-border-strong relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-label-caps text-label-caps uppercase text-badge-promo font-bold tracking-widest">
                      UrbanStore Tier 01
                    </span>
                    <h3 className="font-headline-sm text-headline-sm uppercase text-on-primary mt-1">
                      Silver Privilege
                    </h3>
                  </div>
                  <span className="font-mono text-outline font-bold text-[12px]">NAYA-8492</span>
                </div>
                <div className="mt-space-md space-y-1">
                  <div className="flex justify-between font-label-caps text-label-caps uppercase text-inverse-primary">
                    <span>Progress Belanja ke Gold</span>
                    <span>Rp 1.369K / Rp 3.000K</span>
                  </div>
                  <div className="w-full h-1 bg-border-strong">
                    <div className="h-full bg-badge-promo" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div className="mt-space-md pt-space-md border-t border-border-strong flex items-center justify-between text-body-sm">
                  <span className="text-inverse-primary">Voucher Diskon Rp 50.000 Siap Pakai</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText('URBANFIRST').catch(() => {});
                      onShowToast('Kode voucher URBANFIRST (Rp 50.000) disalin!');
                    }}
                    className="font-label-caps text-label-caps text-badge-promo uppercase font-semibold hover:underline cursor-pointer"
                  >
                    TERAPKAN
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
          <div className="bg-canvas-base border-2 border-border-strong w-full max-w-xl max-h-[90vh] overflow-y-auto p-space-lg shadow-[8px_8px_0px_0px_#111827]">
            <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  Lacak Pengiriman Real-Time
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold mt-0.5">
                  Resi #JT9842109923 (J&amp;T Express)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="py-space-md space-y-space-md">
              <div className="relative pl-6 space-y-space-md before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border-hairline">
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-badge-promo border-2 border-border-strong"></span>
                  <p className="font-label-caps text-label-caps uppercase text-primary font-bold">
                    29 Okt 2026, 11:20 WIB
                  </p>
                  <p className="font-body-md text-body-md text-primary font-medium">
                    Paket dibawa kurir J&amp;T menuju Kebayoran Baru, Jakarta Selatan
                  </p>
                  <p className="font-body-sm text-body-sm text-outline">
                    Kurir: Bpk. Joko Priyono (ID: JKT-441)
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary border-2 border-border-strong"></span>
                  <p className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                    29 Okt 2026, 04:15 WIB
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Tiba di Sorting Center Hub Jakarta Selatan (Tebet)
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-border-hairline border-2 border-border-strong"></span>
                  <p className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                    28 Okt 2026, 21:00 WIB
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Diberangkatkan dari Main Hub Gudang Logistik UrbanStore Cikarang
                  </p>
                </div>
                <div className="relative">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-border-hairline border-2 border-border-strong"></span>
                  <p className="font-label-caps text-label-caps uppercase text-on-surface-variant font-bold">
                    28 Okt 2026, 09:45 WIB
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface">
                    Pesanan diproses &amp; nomor resi telah dibuat
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-border-hairline pt-space-md flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingModalOpen(false)}
                className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold hover:bg-badge-promo hover:text-text-on-accent transition-colors cursor-pointer"
              >
                Tutup Pemantau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
          <div className="bg-canvas-base border-2 border-border-strong w-full max-w-lg p-space-lg shadow-[8px_8px_0px_0px_#111827]">
            <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
              <div>
                <span className="font-label-caps text-label-caps uppercase text-outline">
                  Faktur Resmi UrbanStore Studio
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold">
                  INVOICE {invoiceModalOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceModalOrder(null)}
                className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <div className="py-space-md space-y-space-sm font-body-sm text-body-sm">
              <div className="flex justify-between">
                <span className="text-outline">Tanggal Transaksi:</span>
                <span className="font-medium text-primary">{invoiceModalOrder.dateStr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Penerima:</span>
                <span className="font-medium text-primary">{invoiceModalOrder.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Metode Pembayaran:</span>
                <span className="font-medium text-primary">{invoiceModalOrder.paymentMethod}</span>
              </div>
              <div className="border-t border-border-hairline pt-space-sm space-y-2">
                {invoiceModalOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.name} ({it.size}) × {it.quantity}
                    </span>
                    <span className="font-mono font-semibold">
                      {formatRupiah(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border-hairline pt-space-sm flex justify-between font-headline-sm text-primary font-bold">
                <span>Total Lunas (Termasuk PPN)</span>
                <span>{formatRupiah(invoiceModalOrder.total)}</span>
              </div>
            </div>
            <div className="border-t border-border-hairline pt-space-md flex justify-end gap-space-sm">
              <button
                type="button"
                onClick={() => {
                  onShowToast(`Faktur ${invoiceModalOrder.orderNumber}.pdf berhasil diunduh`);
                  setInvoiceModalOrder(null);
                }}
                className="px-space-md py-2 bg-badge-promo text-text-on-accent font-label-caps text-label-caps uppercase font-bold hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
              >
                Unduh PDF
              </button>
              <button
                type="button"
                onClick={() => setInvoiceModalOrder(null)}
                className="px-space-md py-2 bg-primary text-on-primary font-label-caps text-label-caps uppercase font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Add/Edit Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
          <div className="bg-canvas-base border-2 border-border-strong w-full max-w-lg p-space-lg shadow-[8px_8px_0px_0px_#111827]">
            <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary uppercase font-bold">
                {editingAddress ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="py-space-md space-y-space-sm">
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-primary mb-1">
                  Label Alamat (Rumah / Kantor / Apartemen)
                </label>
                <input
                  type="text"
                  required
                  value={addrLabel}
                  onChange={(e) => setAddrLabel(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-primary mb-1">
                  Nama Penerima &amp; Nomor Telepon
                </label>
                <input
                  type="text"
                  required
                  value={addrRecipient}
                  onChange={(e) => setAddrRecipient(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-primary mb-1">
                  Alamat Lengkap &amp; Kode Pos
                </label>
                <textarea
                  rows={3}
                  required
                  value={addrAddress}
                  onChange={(e) => setAddrAddress(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong"
                />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps uppercase text-primary mb-1">
                  Catatan Kurir
                </label>
                <input
                  type="text"
                  value={addrNote}
                  onChange={(e) => setAddrNote(e.target.value)}
                  className="w-full bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong"
                />
              </div>
              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-space-md py-2 border border-border-hairline font-label-caps text-label-caps uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-space-md py-2 bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent font-label-caps text-label-caps uppercase font-bold cursor-pointer"
                >
                  Simpan Alamat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
