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
    await user.click(screen.getByRole('link', { name: 'Voucher' }));
    expect(await screen.findByRole('heading', { name: /Voucher & Promo/ })).toBeInTheDocument();
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

    await user.selectOptions(screen.getByLabelText('Status'), 'SEMUA');
    await user.type(screen.getByLabelText('Cari pesanan'), '0003');
    expect(screen.queryByText('#URBN-TEST-0002')).toBeNull();
    expect(screen.getByText('#URBN-TEST-0003')).toBeInTheDocument();
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

  it('admin dapat mencari produk dan mengubah nama serta harga coret', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/produk');
    await user.type(await screen.findByLabelText('Cari produk'), 'Linen Shirt');
    expect(screen.queryByLabelText(/Harga Oversized Heavyweight Tee/)).toBeNull();

    const nameInput = screen.getByLabelText(/^Nama Boxy Minimalist Linen Shirt/);
    const origInput = screen.getByLabelText(/^Harga coret Boxy Minimalist Linen Shirt/);
    await user.clear(nameInput);
    await user.type(nameInput, 'Boxy Linen Shirt V2');
    await user.clear(origInput);
    await user.type(origInput, '450000');
    await user.click(within(nameInput.closest('li') as HTMLElement).getByRole('button', { name: 'Simpan Harga' }));
    await waitFor(() => {
      expect(state.names.get('prod-2')).toBe('Boxy Linen Shirt V2');
      expect(state.originalPrices.get('prod-2')).toBe(450000);
    });
  });

  it('admin dapat menambah produk baru dengan color picker dan upload foto terkompresi', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/produk');
    await user.click(await screen.findByRole('button', { name: '+ Tambah Produk' }));
    await user.type(screen.getByLabelText('Nama Produk Baru'), 'Minimalist Cargo Pants - Ink');
    await user.type(screen.getByLabelText('Nama Singkat Produk Baru'), 'Minimalist Cargo Pants');
    await user.type(screen.getByLabelText('SKU Produk Baru'), 'URBN-CRG-99');
    await user.type(screen.getByLabelText('Harga Produk Baru'), '549000');

    const file = new File(['dummy-image-bytes'], 'cargo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('Upload Foto Utama'), file);
    await waitFor(() => expect(state.uploadedImages).toContain('/uploads/products/cargo.png'));
    expect(screen.getByLabelText('URL Foto Produk Baru')).toHaveValue('/uploads/products/cargo.png');

    await user.click(screen.getByRole('button', { name: '+ Tambah Warna' }));
    await user.type(screen.getByLabelText('Nama warna 3'), 'Olive Green');

    await user.type(screen.getByLabelText('Catatan Fitting Produk Baru'), 'Model 180cm memakai L');
    await user.click(screen.getByRole('button', { name: 'Simpan Produk Baru' }));

    expect(await screen.findByText('Minimalist Cargo Pants - Ink')).toBeInTheDocument();
    expect(state.customProducts[0].shortName).toBe('Minimalist Cargo Pants');
    expect(state.customProducts[0].image).toBe('/uploads/products/cargo.png');
    expect(state.customProducts[0].specs.fitNote).toBe('Model 180cm memakai L');
    expect(state.customProducts[0].colors).toHaveLength(3);
  });

  it('admin dapat membuka halaman edit detail produk dan menyimpan perubahan menyeluruh', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/produk');
    const editLinks = await screen.findAllByRole('link', { name: 'Edit Detail' });
    await user.click(editLinks[0]);

    expect(await screen.findByRole('heading', { name: 'Edit Produk' })).toBeInTheDocument();
    const shortInput = await screen.findByLabelText('Nama Singkat Produk Baru');
    await user.clear(shortInput);
    await user.type(shortInput, 'Heavyweight Tee Pro');

    const fitInput = screen.getByLabelText('Catatan Fitting Produk Baru');
    await user.clear(fitInput);
    await user.type(fitInput, 'Model 185cm memakai XL');

    await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));
    expect(await screen.findByRole('heading', { name: 'Produk & Stok' })).toBeInTheDocument();
    expect(state.productOverrides.get('prod-1')?.shortName).toBe('Heavyweight Tee Pro');
    expect(state.productOverrides.get('prod-1')?.specs.fitNote).toBe('Model 185cm memakai XL');
  });
});

describe('panel admin: voucher', () => {
  it('admin membuat voucher baru dan menonaktifkannya', async () => {
    const user = userEvent.setup();
    const { state } = adminApp('/admin/voucher');
    await user.type(await screen.findByLabelText('Kode Voucher'), 'hemat75');
    await user.type(screen.getByLabelText('Deskripsi Voucher'), 'Promo Akhir Pekan');
    await user.type(screen.getByLabelText('Nominal Diskon'), '75000');
    await user.click(screen.getByRole('button', { name: 'Simpan Voucher' }));

    await waitFor(() => expect(state.vouchers.get('HEMAT75')?.discountAmount).toBe(75000));
    const toggle = await screen.findByLabelText('Aktifkan voucher HEMAT75');
    expect(toggle).toBeChecked();

    await user.click(toggle);
    await waitFor(() => expect(state.vouchers.get('HEMAT75')?.isActive).toBe(false));
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
