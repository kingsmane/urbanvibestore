import React from 'react';
import { SavedAddress } from '../../data/storeData';

interface AddressModalProps {
  setAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingAddress: SavedAddress | null;
  addrLabel: string;
  setAddrLabel: React.Dispatch<React.SetStateAction<string>>;
  addrRecipient: string;
  setAddrRecipient: React.Dispatch<React.SetStateAction<string>>;
  addrAddress: string;
  setAddrAddress: React.Dispatch<React.SetStateAction<string>>;
  addrNote: string;
  setAddrNote: React.Dispatch<React.SetStateAction<string>>;
  handleSaveAddress: (e: React.FormEvent) => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  setAddressModalOpen,
  editingAddress,
  addrLabel,
  setAddrLabel,
  addrRecipient,
  setAddrRecipient,
  addrAddress,
  setAddrAddress,
  addrNote,
  setAddrNote,
  handleSaveAddress,
}) => {
  return (
    <>
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
    </>
  );
};
