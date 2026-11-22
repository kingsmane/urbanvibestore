import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INITIAL_ORDERS } from '../data/storeData';
import { CUSTOMER } from '../test/memoryServices';
import { renderApp } from '../test/renderApp';

const CART_KEY = `urbanstore_cart_v2:${CUSTOMER.id}`;
const cart = () => JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');

describe('HomeView', () => {
  it('pencarian tanpa hasil menampilkan empty state lalu bisa direset', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    const search = await screen.findByPlaceholderText('Cari warna, material, nama...');
    await user.type(search, 'zzzzqqq');
    expect(await screen.findByText('Tidak Ada Artikel yang Cocok')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tampilkan Semua Koleksi' }));
    await waitFor(() => expect(screen.queryByText('Tidak Ada Artikel yang Cocok')).toBeNull());
  });

  it('opsi sort tidak memuat "Paling Populer"', async () => {
    renderApp({ path: '/' });
    await screen.findByPlaceholderText('Cari warna, material, nama...');
    expect(screen.queryByRole('option', { name: /Paling Populer/ })).toBeNull();
    expect(screen.getByRole('option', { name: /Harga: Terendah/ })).toBeInTheDocument();
  });

  it('tombol tambah produk di katalog memasukkan item ke keranjang', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    const adds = await screen.findAllByRole('button', { name: 'Tambah Produk' });
    await user.click(adds[0]);
    await waitFor(() => expect(cart()).toHaveLength(1));
  });

  it('katalog memuat produk pairing nyata (sepatu dan kaus kaki)', async () => {
    renderApp({ path: '/' });
    expect((await screen.findAllByText(/Vibram Sole Leather Derbies/)).length).toBeGreaterThan(0);
  });
});

describe('ProductDetailView', () => {
  it('produk habis: tombol dinonaktifkan dan tidak menambah ke keranjang', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-4' });
    const btn = await screen.findByRole('button', { name: /Stok Habis/ });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(cart()).toEqual([]);
  });

  it('tambah ke keranjang memakai ukuran default produk', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-2' });
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/ }));
    expect(cart()[0].size).toBe('M');
    expect(cart()[0].price).toBe(389000);
  });

  it('tidak bisa menambah melebihi stok tersedia', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-3' }); // ukuran default 28, stok 10
    const add = await screen.findByRole('button', { name: /Tambah ke Keranjang/ });
    for (let i = 0; i < 12; i += 1) await user.click(add);
    expect(cart()[0].quantity).toBe(10);
  }, 30000);

  it('modal zoom foto dapat dibuka', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-1' });
    await user.click(await screen.findByRole('button', { name: 'Perbesar foto' }));
    expect(document.querySelectorAll('.fixed.inset-0').length).toBeGreaterThan(0);
  });

  it('modal panduan ukuran dapat dibuka dan ditutup', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-1' });
    await user.click(await screen.findByRole('button', { name: /Cek Panduan Ukuran/ }));
    expect(await screen.findByText('Panduan Ukuran Presisi')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tutup Panduan Ukuran' }));
    await waitFor(() => expect(screen.queryByText('Panduan Ukuran Presisi')).toBeNull());
  });

  it('bagian pairing menambah produk katalog dengan quick add', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-1' });
    const quick = await screen.findAllByRole('button', { name: 'Quick Add' });
    await user.click(quick[0]);
    await waitFor(() => expect(cart()).toHaveLength(1));
    expect(cart()[0].productId).toBe('prod-3'); // produk sungguhan, bukan item palsu
  });
});

describe('SizeGuideView', () => {
  it('menghitung rekomendasi ukuran dan menyimpannya ke profil', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/panduan-ukuran' });
    await user.click(await screen.findByRole('button', { name: /Hitung Ukuran Rekomendasi/ }));
    await waitFor(() => expect(state.fitProfile).not.toBeNull());
    expect(['S', 'M', 'L', 'XL', 'XXL']).toContain(state.fitProfile!.calculatedSize);
    expect(state.fitProfile!.recommendedTop).toBe(`Size ${state.fitProfile!.calculatedSize}`);
  });

  it('memilih preferensi Slim menghitung ulang ukuran', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/panduan-ukuran' });
    await user.click(await screen.findByRole('button', { name: 'Slim' }));
    await waitFor(() => expect(state.fitProfile?.preference).toBe('slim'));
  });

  it('"Gunakan Ukuran" kembali ke halaman produk terakhir dan menyimpan ukuran', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/panduan-ukuran' });
    const use = (await screen.findAllByRole('button', { name: /Gunakan Ukuran/ }))[0];
    await user.click(use);
    expect(
      await screen.findByRole('heading', { level: 1, name: /Oversized Heavyweight Tee/ })
    ).toBeInTheDocument();
    await waitFor(() => expect(state.fitProfile?.recommendedTop).toMatch(/^Size /));
  });
});

describe('OrderConfirmationView', () => {
  const orderUrl = '/pesanan/ord-1';

  it('menampilkan nomor order dan VA dari order', async () => {
    renderApp({ path: orderUrl, orders: INITIAL_ORDERS });
    expect((await screen.findAllByText(/#URBN-202611-8492/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('8277 0812 3456 7890').length).toBeGreaterThan(0);
  });

  it('tidak ada lagi simulasi unggah bukti yang menandai lunas', async () => {
    renderApp({ path: orderUrl, orders: INITIAL_ORDERS });
    await screen.findAllByText(/#URBN-202611-8492/);
    expect(screen.queryByRole('button', { name: /Unggah Bukti/ })).toBeNull();
  });

  it('cek status memuat ulang dari server dan tidak mengubah status menjadi lunas', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: orderUrl, orders: INITIAL_ORDERS });
    await user.click(await screen.findByRole('button', { name: /Cek Status Pembayaran/ }));
    expect(await screen.findByText(/Status diperbarui dari server/)).toBeInTheDocument();
    expect(state.orders.find((o) => o.id === 'ord-1')?.status).toBe('PENDING_PAYMENT');
  });

  it('status berubah di server (pembayaran diverifikasi) tampil setelah cek status', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: orderUrl, orders: INITIAL_ORDERS });
    const check = await screen.findByRole('button', { name: /Cek Status Pembayaran/ });
    state.orders.find((o) => o.id === 'ord-1')!.status = 'PAID';
    await user.click(check);
    expect(await screen.findByText(/Pembayaran Terverifikasi/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Batalkan Pesanan/ })).toBeNull();
  });

  it('pembeli dapat membatalkan pesanan yang belum dibayar', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: orderUrl, orders: INITIAL_ORDERS });
    await user.click(await screen.findByRole('button', { name: /Batalkan Pesanan/ }));
    await waitFor(() => expect(state.orders.find((o) => o.id === 'ord-1')?.status).toBe('CANCELLED'));
    expect(await screen.findByText(/Pesanan Ini Tidak Dilanjutkan/)).toBeInTheDocument();
  });
});

describe('Layout', () => {
  it('footer: membuka modal informasi Kebijakan Privasi tanpa klaim SSL 256-bit', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/' });
    await user.click(await screen.findByRole('button', { name: 'Kebijakan Privasi' }));
    expect(await screen.findByText(/koneksi HTTPS/)).toBeInTheDocument();
    expect(screen.queryByText(/256-Bit SSL/)).toBeNull();
  });

  it('newsletter: submit disimpan ke server dan input dikosongkan', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/' });
    const input = await screen.findByPlaceholderText('Surel Anda');
    await user.type(input, 'a@b.co');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveValue(''));
    expect(state.subscribers).toEqual(['a@b.co']);
  });

  it('navigasi: tombol keranjang membuka checkout', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-2' });
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/ }));
    await user.click((await screen.findAllByRole('button', { name: 'Shopping Cart' }))[0]);
    expect(await screen.findByText('Penyelesaian Pesanan')).toBeInTheDocument();
  });

  it('toast tambah ke keranjang tidak memuat klaim gratis ongkir otomatis', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-2' });
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/ }));
    expect(await screen.findByText(/Ditambahkan: Boxy Minimalist Linen Shirt/)).toBeInTheDocument();
    expect(screen.queryByText(/Gratis Ongkir Otomatis/i)).toBeNull();
  });

  it('header menampilkan inisial pengguna dan tombol keluar', async () => {
    renderApp({ path: '/' });
    expect(await screen.findByRole('button', { name: 'Keluar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Akun Pengguna' })).toHaveTextContent('B');
  });

  it('customer tidak melihat tautan Admin', async () => {
    renderApp({ path: '/' });
    await screen.findByRole('button', { name: 'Keluar' });
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull();
  });
});
