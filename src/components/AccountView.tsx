import React, { useState, useEffect } from 'react';
import {
  Order,
  SavedAddress,
  FitProfile,
  formatRupiah,
} from '../data/storeData';
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
  initialTab?: 'orders' | 'addresses' | 'fitprofile' | 'settings';
  onUpdateAddresses: (addrs: SavedAddress[]) => void;
  onNavigateHome: () => void;
  onNavigateSizeGuide: () => void;
  onPayOrder: (order: Order) => void;
  onReorderItem: (name: string, price: number, image: string) => void;
  onOpenProduct: (productId: string) => void;
  onShowToast: (msg: string, sub?: string) => void;
  onTabChange?: (tab: 'orders' | 'addresses' | 'fitprofile' | 'settings') => void;
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
  onTabChange,
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

  const changeTab = (tab: 'orders' | 'addresses' | 'fitprofile' | 'settings') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

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
        'Mutasi Virtual Account belum terdeteksi',
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
      <ProfileHeader orders={orders} addresses={addresses} onNavigateHome={onNavigateHome} activeTab={activeTab} changeTab={changeTab} pendingCount={pendingCount} />

      {/* Content Work Area (Main Panel + Context Sidebar) */}
      <section className="w-full">
        <div className="max-w-[1440px] mx-auto px-margin md:px-margin-desktop py-space-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-start">
            {/* LEFT 8-COLUMN MAIN STREAM */}
            <div className="lg:col-span-8 space-y-space-lg">
              {/* TAB 1: RIWAYAT PESANAN */}
              {activeTab === 'orders' && (
                <OrdersTab orders={orders} onPayOrder={onPayOrder} onReorderItem={onReorderItem} countdownSec={countdownSec} copiedVa={copiedVa} checkingOrderId={checkingOrderId} checkResultText={checkResultText} setTrackingModalOpen={setTrackingModalOpen} setInvoiceModalOrder={setInvoiceModalOrder} formatTimer={formatTimer} handleCopyVa={handleCopyVa} handleSimulateCheck={handleSimulateCheck} />
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
            <AccountSidebar fitProfile={fitProfile} onNavigateHome={onNavigateHome} onNavigateSizeGuide={onNavigateSizeGuide} onReorderItem={onReorderItem} onOpenProduct={onOpenProduct} onShowToast={onShowToast} />
          </div>
        </div>
      </section>

      {/* Interactive Tracking Modal */}
      {trackingModalOpen && (
        <TrackingModal setTrackingModalOpen={setTrackingModalOpen} />
      )}

      {/* Invoice Modal */}
      {invoiceModalOrder && (
        <InvoiceModal onShowToast={onShowToast} invoiceModalOrder={invoiceModalOrder} setInvoiceModalOrder={setInvoiceModalOrder} />
      )}

      {/* Address Add/Edit Modal */}
      {addressModalOpen && (
        <AddressModal setAddressModalOpen={setAddressModalOpen} editingAddress={editingAddress} addrLabel={addrLabel} setAddrLabel={setAddrLabel} addrRecipient={addrRecipient} setAddrRecipient={setAddrRecipient} addrAddress={addrAddress} setAddrAddress={setAddrAddress} addrNote={addrNote} setAddrNote={setAddrNote} handleSaveAddress={handleSaveAddress} />
      )}
    </div>
  );
};
