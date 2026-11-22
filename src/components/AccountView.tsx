import React, { useState, useEffect } from 'react';
import {
  Order,
  OrderItemSnapshot,
  Product,
  SavedAddress,
  FitProfile,
  formatRupiah,
} from '../data/storeData';
import type { AddressInput, Profile } from '../services/types';
import { describeError } from '../services/errors';
import { ProfileHeader } from './account/ProfileHeader';
import { OrdersTab } from './account/OrdersTab';
import { AddressesTab } from './account/AddressesTab';
import { FitProfileTab } from './account/FitProfileTab';
import { SettingsTab } from './account/SettingsTab';
import { AccountSidebar } from './account/AccountSidebar';
import { TrackingModal } from './account/TrackingModal';
import { InvoiceModal } from './account/InvoiceModal';
import { AddressModal } from './account/AddressModal';

interface AccountViewProps {
  orders: Order[];
  addresses: SavedAddress[];
  fitProfile: FitProfile;
  products: Product[];
  profile: Profile | null;
  initialTab?: 'orders' | 'addresses' | 'fitprofile' | 'settings';
  onSaveAddress: (input: AddressInput) => Promise<void>;
  onSetPrimaryAddress: (id: string) => Promise<void>;
  onNavigateHome: () => void;
  onNavigateSizeGuide: () => void;
  onPayOrder: (order: Order) => void;
  onCancelOrder: (orderId: string) => Promise<void>;
  onReorderItem: (item: OrderItemSnapshot) => void;
  onOpenProduct: (productId: string) => void;
  onShowToast: (msg: string, sub?: string) => void;
  onTabChange?: (tab: 'orders' | 'addresses' | 'fitprofile' | 'settings') => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  orders,
  addresses,
  fitProfile,
  products,
  profile,
  initialTab = 'orders',
  onSaveAddress,
  onSetPrimaryAddress,
  onNavigateHome,
  onNavigateSizeGuide,
  onPayOrder,
  onCancelOrder,
  onReorderItem,
  onOpenProduct,
  onShowToast,
  onTabChange,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'fitprofile' | 'settings'>(
    initialTab
  );
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [copiedVa, setCopiedVa] = useState(false);
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);
  const [checkResultText, setCheckResultText] = useState<Record<string, string>>({});
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  // Address Form Modal
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addrLabel, setAddrLabel] = useState('Rumah');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrAddress, setAddrAddress] = useState('');
  const [addrPostal, setAddrPostal] = useState('');
  const [addrNote, setAddrNote] = useState('');
  const [addrError, setAddrError] = useState<string | null>(null);
  const [addrSaving, setAddrSaving] = useState(false);

  // Notification Settings
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEarlyAccess, setNotifEarlyAccess] = useState(true);
  const [notifNewsletter, setNotifNewsletter] = useState(false);

  const changeTab = (tab: 'orders' | 'addresses' | 'fitprofile' | 'settings') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const hasPending = orders.some((o) => o.status === 'PENDING_PAYMENT');
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasPending]);

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

  // Status pembayaran hanya berubah di server (admin/gateway); tombol ini hanya memberi umpan balik.
  const handleCheckStatus = (orderId: string) => {
    setCheckingOrderId(orderId);
    setTimeout(() => {
      setCheckingOrderId(null);
      setCheckResultText((prev) => ({ ...prev, [orderId]: 'Menunggu Transfer' }));
      onShowToast('Pembayaran belum terverifikasi', 'Status diperbarui otomatis setelah pembayaran kami terima');
    }, 600);
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddrLabel('Rumah');
    setAddrName(profile?.fullName ?? '');
    setAddrPhone(profile?.phone ?? '');
    setAddrAddress('');
    setAddrPostal('');
    setAddrNote('');
    setAddrError(null);
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setAddrLabel(addr.label);
    setAddrName(addr.recipientName ?? '');
    setAddrPhone(addr.phone);
    setAddrAddress(addr.streetAddress ?? addr.fullAddress);
    setAddrPostal(addr.postalCode ?? '');
    setAddrNote(addr.courierNote.replace(/^Catatan kurir:\s*/i, ''));
    setAddrError(null);
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addrSaving) return;
    if (!addrName.trim() || !addrPhone.trim()) {
      setAddrError('Nama penerima dan nomor telepon wajib diisi.');
      return;
    }
    if (addrAddress.trim().length < 10) {
      setAddrError('Alamat terlalu singkat; lengkapi dengan nomor rumah dan RT/RW.');
      return;
    }
    if (!/^\d{5}$/.test(addrPostal.trim())) {
      setAddrError('Kode pos harus 5 digit angka.');
      return;
    }
    setAddrError(null);
    setAddrSaving(true);
    try {
      await onSaveAddress({
        id: editingAddress?.id,
        label: addrLabel,
        recipientName: addrName,
        phone: addrPhone,
        province: editingAddress?.province,
        city: editingAddress?.city,
        district: editingAddress?.district,
        postalCode: addrPostal,
        fullAddress: addrAddress,
        courierNote: addrNote,
        isPrimary: !editingAddress && addresses.length === 0,
      });
      onShowToast(editingAddress ? 'Alamat pengiriman berhasil diperbarui' : 'Alamat baru berhasil ditambahkan');
      setAddressModalOpen(false);
    } catch (err) {
      setAddrError(describeError(err));
    } finally {
      setAddrSaving(false);
    }
  };

  const handleSetPrimaryAddress = async (id: string) => {
    try {
      await onSetPrimaryAddress(id);
      onShowToast('Alamat utama berhasil diubah');
    } catch (err) {
      onShowToast('Alamat utama gagal diubah', describeError(err));
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING_PAYMENT').length;

  return (
    <div className="flex flex-col w-full">
      {/* Top Profile Dossier & Quick Metrics (Swiss Identity System) */}
      <ProfileHeader orders={orders} addresses={addresses} profile={profile} onNavigateHome={onNavigateHome} activeTab={activeTab} changeTab={changeTab} pendingCount={pendingCount} />

      {/* Content Work Area (Main Panel + Context Sidebar) */}
      <section className="w-full">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* LEFT 8-COLUMN MAIN STREAM */}
            <div className="lg:col-span-8 space-y-space-lg">
              {/* TAB 1: RIWAYAT PESANAN */}
              {activeTab === 'orders' && (
                <OrdersTab orders={orders} onPayOrder={onPayOrder} onReorderItem={onReorderItem} onCancelOrder={onCancelOrder} nowMs={nowMs} copiedVa={copiedVa} checkingOrderId={checkingOrderId} checkResultText={checkResultText} setTrackingOrder={setTrackingOrder} setInvoiceModalOrder={setInvoiceModalOrder} formatTimer={formatTimer} handleCopyVa={handleCopyVa} handleCheckStatus={handleCheckStatus} />
              )}

              {/* TAB 2: BUKU ALAMAT */}
              {activeTab === 'addresses' && (
                <AddressesTab addresses={addresses} openAddAddressModal={openAddAddressModal} openEditAddressModal={openEditAddressModal} handleSetPrimaryAddress={handleSetPrimaryAddress} />
              )}

              {/* TAB 3: FIT PROFILE */}
              {activeTab === 'fitprofile' && (
                <FitProfileTab fitProfile={fitProfile} onNavigateSizeGuide={onNavigateSizeGuide} />
              )}

              {/* TAB 4: SETTINGS */}
              {activeTab === 'settings' && (
                <SettingsTab onShowToast={onShowToast} notifWhatsapp={notifWhatsapp} setNotifWhatsapp={setNotifWhatsapp} notifEarlyAccess={notifEarlyAccess} setNotifEarlyAccess={setNotifEarlyAccess} notifNewsletter={notifNewsletter} setNotifNewsletter={setNotifNewsletter} />
              )}
            </div>

            {/* RIGHT 4-COLUMN CONTEXTUAL SIDEBAR */}
            <AccountSidebar fitProfile={fitProfile} onNavigateHome={onNavigateHome} onNavigateSizeGuide={onNavigateSizeGuide} products={products} onOpenProduct={onOpenProduct} onShowToast={onShowToast} />
          </div>
        </div>
      </section>

      {/* Interactive Tracking Modal */}
      {trackingOrder && (
        <TrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />
      )}

      {/* Invoice Modal */}
      {invoiceModalOrder && (
        <InvoiceModal onShowToast={onShowToast} invoiceModalOrder={invoiceModalOrder} setInvoiceModalOrder={setInvoiceModalOrder} />
      )}

      {/* Address Add/Edit Modal */}
      {addressModalOpen && (
        <AddressModal setAddressModalOpen={setAddressModalOpen} editingAddress={editingAddress} addrLabel={addrLabel} setAddrLabel={setAddrLabel} addrName={addrName} setAddrName={setAddrName} addrPhone={addrPhone} setAddrPhone={setAddrPhone} addrAddress={addrAddress} setAddrAddress={setAddrAddress} addrPostal={addrPostal} setAddrPostal={setAddrPostal} addrNote={addrNote} setAddrNote={setAddrNote} addrError={addrError} addrSaving={addrSaving} handleSaveAddress={handleSaveAddress} />
      )}
    </div>
  );
};
