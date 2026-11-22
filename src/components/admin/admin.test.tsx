import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INITIAL_ORDERS } from '../../data/storeData';
import { ADMIN, CUSTOMER } from '../../test/memoryServices';
import { renderApp } from '../../test/renderApp';

const orders = (...statuses: string[]) =>
  statuses.map((status, i) => ({
    ...INITIAL_ORDERS[0],
    id: `o${i + 1}`,
    orderNumber: `#URBN-TEST-000${i + 1}`,
    status: status as never,
  }));

/** Render panel admin dengan pesanan milik customer. */
const adminApp = (path: string, seed: ReturnType<typeof orders> = []) => {
  const app = renderApp({ path, as: 'admin', orders: seed });
  // pesanan dimiliki customer, bukan admin
  app.state.orders.forEach((o) => (o.userId = CUSTOMER.id));
  return app;
};

describe('panel admin: ringkasan', () => {
  it('menampilkan statistik toko', async () => {
    adminApp('/admin', orders('PENDING_PAYMENT', 'PAID'));
    expect(await screen.findByRole('heading', { name: 'Ringkasan' })).toBeInTheDocument();
    expect(await screen.findByText('Pendapatan (dibayar)')).toBeInTheDocument();
    expect(screen.getByText('Stok menipis')).toBeInTheDocument();
    expect(await screen.findByText(/1 pesanan menunggu pembayaran/)).toBeInTheDocument();
  });

  it('navigasi antar menu admin', async () => {
    const user = userEvent.setup();
    adminApp('/admin');
    await user.click(await screen.findByRole('link', { name: 'Pesanan' }));
    expect(await screen.findByRole('heading', { name: 'Pesanan' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Produk & Stok' }));
    expect(await screen.findByRole('heading', { name: 'Produk & Stok' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Pengguna' }));
    expect(await screen.findByRole('heading', { name: 'Pengguna' })).toBeInTheDocument();
  });
});

describe('panel admin: pesanan', () => {
  it('admin melihat pesanan semua pelanggan dan dapat memfilter status', async () => {
    const user = userEvent.setup();
    adminApp('/admin/pesanan', orders('PENDING_PAYMENT', 'PAID', 'CANCELLED'));
    expect(await screen.findByText('#URBN-TEST-0001')).toBeInTheDocument();
    expect(screen.getByText('#URBN-TEST-0002')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Status'), 'PAID');
    expect(screen.queryByText('#URBN-TEST-0001')).toBeNull();
    expect(screen.getByText('#URBN-TEST-0002')).toBeInTheDocument();
  });

  it('alur lengkap: tandai lunas -> proses -> kirim (resi) -> selesai', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/pesanan', orders('PENDING_PAYMENT'));
    const row = await screen.findByRole('button', { name: /#URBN-TEST-0001/ });
    await user.click(row);

    await user.click(await screen.findByRole('button', { name: 'Tandai Lunas' }));
    await waitFor(() => expect(state.orders[0].status).toBe('PAID'));

    await user.click(await screen.findByRole('button', { name: 'Proses Pesanan' }));
    await waitFor(() => expect(state.orders[0].status).toBe('PROCESSING'));

    // resi wajib diisi
    await user.click(await screen.findByRole('button', { name: 'Tandai Dikirim' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/resi wajib diisi/i);
    expect(state.orders[0].status).toBe('PROCESSING');

    await user.type(screen.getByLabelText('Nomor resi'), 'JT123456789');
    await user.click(screen.getByRole('button', { name: 'Tandai Dikirim' }));
    await waitFor(() => expect(state.orders[0].status).toBe('IN_TRANSIT'));
    expect(state.orders[0].trackingNumber).toBe('JT123456789');

    await user.click(await screen.findByRole('button', { name: 'Tandai Selesai' }));
    await waitFor(() => expect(state.orders[0].status).toBe('COMPLETED'));
  }, 30000);

  it('admin membatalkan pesanan berbayar (refund)', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/pesanan', orders('PAID'));
    await user.click(await screen.findByRole('button', { name: /#URBN-TEST-0001/ }));
    await user.click(await screen.findByRole('button', { name: /Batalkan & Refund/ }));
    await waitFor(() => expect(state.orders[0].status).toBe('REFUNDED'));
  });
});

describe('panel admin: produk & stok', () => {
  it('admin mengubah harga produk dan berlaku di katalog toko', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/produk');
    const price = await screen.findByLabelText('Harga Oversized Heavyweight Tee - Charcoal');
    await user.clear(price);
    await user.type(price, '259000');
    await user.click(within(price.closest('li') as HTMLElement).getByRole('button', { name: 'Simpan Harga' }));
    await waitFor(() => expect(state.prices.get('prod-1')).toBe(259000));
  });

  it('admin mengubah stok per ukuran', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/produk');
    const stockInput = (await screen.findAllByLabelText('Stok ukuran M'))[0];
    await user.clear(stockInput);
    await user.type(stockInput, '40');
    await user.click(screen.getAllByRole('button', { name: 'Simpan stok ukuran M' })[0]);
    await waitFor(() => expect(state.stock.get('prod-1|M')).toBe(40));
  });

  it('admin menonaktifkan produk sehingga hilang dari katalog toko', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/produk');
    await user.click(await screen.findByLabelText('Aktifkan Wide-Leg Pleated Trousers - Ink Black'));
    await waitFor(() => expect(state.inactive.has('prod-3')).toBe(true));
  });
});

describe('panel admin: pengguna', () => {
  it('admin mengubah peran pengguna lain, tetapi tidak peran sendiri', async () => {
    const user = userEvent.setup();
    const { users } = adminApp('/admin/pengguna');
    const customerRole = await screen.findByLabelText(`Peran ${CUSTOMER.email}`);
    expect(screen.getByLabelText(`Peran ${ADMIN.email}`)).toBeDisabled();

    await user.selectOptions(customerRole, 'admin');
    await waitFor(() => expect(users.find((u) => u.id === CUSTOMER.id)?.role).toBe('admin'));
  });
});
