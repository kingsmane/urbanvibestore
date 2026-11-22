import React from 'react';
import { SavedAddress } from '../../data/storeData';

interface AddressModalProps {
  setAddressModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingAddress: SavedAddress | null;
  addrLabel: string;
  setAddrLabel: React.Dispatch<React.SetStateAction<string>>;
  addrName: string;
  setAddrName: React.Dispatch<React.SetStateAction<string>>;
  addrPhone: string;
  setAddrPhone: React.Dispatch<React.SetStateAction<string>>;
  addrAddress: string;
  setAddrAddress: React.Dispatch<React.SetStateAction<string>>;
  addrPostal: string;
  setAddrPostal: React.Dispatch<React.SetStateAction<string>>;
  addrNote: string;
  setAddrNote: React.Dispatch<React.SetStateAction<string>>;
  addrError: string | null;
  addrSaving: boolean;
  handleSaveAddress: (e: React.FormEvent) => void;
}

const labelClass =
  'block font-label-caps text-label-caps uppercase text-primary mb-1';
const inputClass =
  'w-full bg-surface-subtle border border-border-hairline p-2 font-body-sm text-body-sm outline-none focus:border-border-strong';

export const AddressModal: React.FC<AddressModalProps> = ({
  setAddressModalOpen,
  editingAddress,
  addrLabel,
  setAddrLabel,
  addrName,
  setAddrName,
  addrPhone,
  setAddrPhone,
  addrAddress,
  setAddrAddress,
  addrPostal,
  setAddrPostal,
  addrNote,
  setAddrNote,
  addrError,
  addrSaving,
  handleSaveAddress,
}) => {
  return (
    <>
      <div className="fixed inset-0 z-[100] bg-border-strong/60 flex items-center justify-center p-margin">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
          className="bg-canvas-base border-2 border-border-strong w-full max-w-lg max-h-[90vh] overflow-y-auto p-space-lg shadow-[8px_8px_0px_0px_#111827]"
        >
          <div className="flex items-center justify-between border-b border-border-hairline pb-space-sm">
            <h3
              id="address-modal-title"
              className="font-headline-sm text-headline-sm text-primary uppercase font-bold"
            >
              {editingAddress ? 'Ubah Alamat Pengiriman' : 'Tambah Alamat Baru'}
            </h3>
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setAddressModalOpen(false)}
              className="p-1 hover:bg-surface-muted text-primary cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                close
              </span>
            </button>
          </div>
          <form onSubmit={handleSaveAddress} className="py-space-md space-y-space-sm">
            <div>
              <label htmlFor="addr-label" className={labelClass}>
                Label Alamat (Rumah / Kantor / Apartemen)
              </label>
              <input
                id="addr-label"
                type="text"
                required
                value={addrLabel}
                onChange={(e) => setAddrLabel(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div>
                <label htmlFor="addr-name" className={labelClass}>
                  Nama Penerima
                </label>
                <input
                  id="addr-name"
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="addr-phone" className={labelClass}>
                  Nomor Telepon
                </label>
                <input
                  id="addr-phone"
                  type="tel"
                  required
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  placeholder="+62 812-3456-7890"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label htmlFor="addr-address" className={labelClass}>
                Alamat Lengkap
              </label>
              <textarea
                id="addr-address"
                rows={3}
                required
                value={addrAddress}
                onChange={(e) => setAddrAddress(e.target.value)}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              <div>
                <label htmlFor="addr-postal" className={labelClass}>
                  Kode Pos
                </label>
                <input
                  id="addr-postal"
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  required
                  value={addrPostal}
                  onChange={(e) => setAddrPostal(e.target.value)}
                  placeholder="12160"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="addr-note" className={labelClass}>
                  Catatan Kurir
                </label>
                <input
                  id="addr-note"
                  type="text"
                  value={addrNote}
                  onChange={(e) => setAddrNote(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            {addrError && (
              <p role="alert" className="font-body-sm text-body-sm text-error font-medium">
                {addrError}
              </p>
            )}
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
                disabled={addrSaving}
                className="px-space-md py-2 bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent disabled:opacity-60 font-label-caps text-label-caps uppercase font-bold cursor-pointer"
              >
                {addrSaving ? 'Menyimpan…' : 'Simpan Alamat'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
