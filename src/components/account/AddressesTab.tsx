import React from 'react';
import { SavedAddress } from '../../data/storeData';

interface AddressesTabProps {
  addresses: SavedAddress[];
  openAddAddressModal: () => void;
  openEditAddressModal: (addr: SavedAddress) => void;
  handleSetPrimaryAddress: (id: string) => void;
}

export const AddressesTab: React.FC<AddressesTabProps> = ({
  addresses,
  openAddAddressModal,
  openEditAddressModal,
  handleSetPrimaryAddress,
}) => {
  return (
    <>
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
    </>
  );
};
