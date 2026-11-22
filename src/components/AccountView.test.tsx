import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INITIAL_ADDRESSES, INITIAL_ORDERS } from '../data/storeData';
import { CUSTOMER } from '../test/memoryServices';
import { renderApp } from '../test/renderApp';

const seeded = { orders: INITIAL_ORDERS, addresses: INITIAL_ADDRESSES };

describe('AccountView', () => {
  it('header menampilkan profil pengguna yang login, bukan data contoh', async () => {
    renderApp({ path: '/akun/orders', ...seeded });
    expect(await screen.findByRole('heading', { level: 1, name: CUSTOMER.fullName })).toBeInTheDocument();
    expect(screen.getAllByText(CUSTOMER.email).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Naya Rahmadani/)).toBeNull();
  });

  it('menampilkan riwayat pesanan di tab pesanan', async () => {
    renderApp({ path: '/akun/orders', ...seeded });
    expect((await screen.findAllByText(/#URBN-202611-8492/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/#URBN-202610-3104/).length).toBeGreaterThan(0);
  });

  it('status baru (dibatalkan/kedaluwarsa) tampil dengan kartu ringkas', async () => {
    const base = INITIAL_ORDERS[0];
    renderApp({
      path: '/akun/orders',
      orders: [
        { ...base, id: 'c1', orderNumber: '#URBN-CAN-0001', status: 'CANCELLED' },
        { ...base, id: 'e1', orderNumber: '#URBN-EXP-0002', status: 'EXPIRED' },
      ],
    });
    expect(await screen.findByText('#URBN-CAN-0001')).toBeInTheDocument();
    expect(screen.getByText('Dibatalkan')).toBeInTheDocument();
    expect(screen.getByText('Kedaluwarsa')).toBeInTheDocument();
  });

  it('pelanggan dapat membatalkan pesanan yang belum dibayar', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/akun/orders', ...seeded });
    const card = (await screen.findAllByText(/#URBN-202611-8492/))[0].closest('div.bg-canvas-base') as HTMLElement;
    await user.click(within(card).getByRole('button', { name: 'Batalkan' }));
    await waitFor(() => expect(state.orders.find((o) => o.id === 'ord-1')?.status).toBe('CANCELLED'));
    expect(await screen.findByText('Dibatalkan')).toBeInTheDocument();
  });

  it('berpindah tab lewat tombol dan menampilkan konten tab', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/akun/orders', ...seeded });
    await user.click(await screen.findByRole('button', { name: /Buku Alamat/ }));
    expect(await screen.findByRole('button', { name: /Tambah Alamat Baru/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /My Fit Profile/ }));
    expect(screen.queryByRole('button', { name: /Tambah Alamat Baru/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Pengaturan/ }));
    expect(await screen.findAllByRole('checkbox')).not.toHaveLength(0);
  });

  it('URL /akun/addresses langsung membuka tab alamat', async () => {
    renderApp({ path: '/akun/addresses', ...seeded });
    expect(await screen.findByRole('button', { name: /Tambah Alamat Baru/ })).toBeInTheDocument();
  });

  it('menambah alamat baru lewat modal berlabel dan menyimpannya ke server', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/akun/addresses', ...seeded });
    await user.click(await screen.findByRole('button', { name: /Tambah Alamat Baru/ }));

    const dialog = await screen.findByRole('dialog');
    const f = within(dialog);
    await user.clear(f.getByLabelText('Label Alamat (Rumah / Kantor / Apartemen)'));
    await user.type(f.getByLabelText('Label Alamat (Rumah / Kantor / Apartemen)'), 'Kos');
    await user.clear(f.getByLabelText('Nama Penerima'));
    await user.type(f.getByLabelText('Nama Penerima'), 'Budi');
    await user.clear(f.getByLabelText('Nomor Telepon'));
    await user.type(f.getByLabelText('Nomor Telepon'), '+62 811-1111-2222');
    await user.type(f.getByLabelText('Alamat Lengkap'), 'Jl. Kenanga No. 3, Bandung');
    await user.type(f.getByLabelText('Kode Pos'), '40111');
    await user.click(f.getByRole('button', { name: 'Simpan Alamat' }));

    await waitFor(() => expect(state.addresses).toHaveLength(3));
    const added = state.addresses[2];
    expect(added.label).toBe('Kos');
    expect(added.streetAddress).toContain('Bandung');
    expect(added.postalCode).toBe('40111');
    expect(added.isPrimary).toBe(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  }, 30000);

  it('kode pos tidak valid ditolak dengan pesan di modal', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/akun/addresses', ...seeded });
    await user.click(await screen.findByRole('button', { name: /Tambah Alamat Baru/ }));
    const f = within(await screen.findByRole('dialog'));
    await user.type(f.getByLabelText('Nomor Telepon'), '0811');
    await user.type(f.getByLabelText('Alamat Lengkap'), 'Jl. Kenanga No. 3, Bandung');
    await user.type(f.getByLabelText('Kode Pos'), '12');
    await user.click(f.getByRole('button', { name: 'Simpan Alamat' }));
    expect(await f.findByRole('alert')).toHaveTextContent(/Kode pos harus 5 digit/);
    expect(state.addresses).toHaveLength(2);
  }, 30000);

  it('mengubah alamat utama', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/akun/addresses', ...seeded });
    await screen.findByRole('button', { name: /Tambah Alamat Baru/ });
    const setPrimaryButtons = await screen.findAllByRole('button', { name: /Jadikan Utama/i });
    await user.click(setPrimaryButtons[0]);
    await waitFor(() => {
      const primary = state.addresses.filter((a) => a.isPrimary);
      expect(primary).toHaveLength(1);
      expect(primary[0].id).toBe('addr-2');
    });
  });
});
