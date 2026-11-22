import React from 'react';

interface SettingsTabProps {
  onShowToast: (msg: string, sub?: string) => void;
  notifWhatsapp: boolean;
  setNotifWhatsapp: React.Dispatch<React.SetStateAction<boolean>>;
  notifEarlyAccess: boolean;
  setNotifEarlyAccess: React.Dispatch<React.SetStateAction<boolean>>;
  notifNewsletter: boolean;
  setNotifNewsletter: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onShowToast,
  notifWhatsapp,
  setNotifWhatsapp,
  notifEarlyAccess,
  setNotifEarlyAccess,
  notifNewsletter,
  setNotifNewsletter,
}) => {
  return (
    <>
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
    </>
  );
};
