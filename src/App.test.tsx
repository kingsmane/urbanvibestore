import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './App';
import { PRODUCTS } from './data/storeData';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

const tee = PRODUCTS.find((p) => p.id === 'prod-1')!;
const seedCart = () =>
  localStorage.setItem(
    'urbanstore_cart_v1',
    JSON.stringify([
      {
        id: 'c1',
        productId: tee.id,
        sku: `${tee.sku}-M`,
        name: tee.shortName,
        price: tee.price,
        color: 'Chalk White',
        size: 'M',
        quantity: 1,
        image: tee.image,
      },
    ])
  );

describe('routing', () => {
  it('merender detail produk dari URL', async () => {
    renderAt('/produk/prod-2');
    expect(
      await screen.findByRole('heading', { level: 1, name: /Boxy Minimalist Linen Shirt/ })
    ).toBeInTheDocument();
  });

  it('produk tidak dikenal menampilkan 404 produk', async () => {
    renderAt('/produk/tidak-ada');
    expect(await screen.findByText('Produk tidak ditemukan')).toBeInTheDocument();
  });

  it('URL tidak dikenal menampilkan halaman 404', async () => {
    renderAt('/halaman/aneh');
    expect(await screen.findByText('Halaman tidak ditemukan')).toBeInTheDocument();
  });

  it('order yang tidak ada dialihkan ke akun', async () => {
    renderAt('/pesanan/tidak-ada');
    await waitFor(() => expect(screen.queryByText('Halaman tidak ditemukan')).toBeNull());
    // halaman akun menampilkan tab riwayat pesanan
    expect(await screen.findAllByText(/#URBN-/)).not.toHaveLength(0);
  });

  it('/akun dialihkan ke tab pesanan dan tab tidak valid kembali ke pesanan', async () => {
    renderAt('/akun/ngawur');
    expect(await screen.findAllByText(/#URBN-/)).not.toHaveLength(0);
  });
});

describe('alur belanja', () => {
  it('menambah produk ke keranjang dari detail produk memperbarui badge', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-2');
    const btn = await screen.findByRole('button', { name: /Tambah ke Keranjang/i });
    await user.click(btn);
    const stored = JSON.parse(localStorage.getItem('urbanstore_cart_v1')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].productId).toBe('prod-2');
  });

  it('keranjang awal kosong untuk pengunjung baru', async () => {
    renderAt('/checkout');
    await screen.findByText('Penyelesaian Pesanan');
    expect(localStorage.getItem('urbanstore_cart_v1')).toBe('[]');
  });
});

describe('checkout', () => {
  const submitButton = () => screen.findByRole('button', { name: /Lanjut ke Pembayaran \(/ });

  it('form kosong menampilkan error validasi dan tidak membuat order', async () => {
    seedCart();
    const user = userEvent.setup();
    renderAt('/checkout');
    await user.click(await submitButton());
    expect(await screen.findByText(/alamat surel aktif yang valid/i)).toBeInTheDocument();
    expect(screen.getByText(/nomor WhatsApp\/telepon Indonesia/i)).toBeInTheDocument();
    expect(screen.getByText(/Nama lengkap penerima wajib diisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Kode pos harus 5 digit/i)).toBeInTheDocument();
    // hanya 3 seed order; tidak ada order baru
    expect(JSON.parse(localStorage.getItem('urbanstore_orders_v1')!)).toHaveLength(3);
  });

  it('tidak ada voucher terpasang secara default', async () => {
    seedCart();
    renderAt('/checkout');
    await submitButton();
    expect(screen.queryByText(/URBANFIRST — Hemat/)).toBeNull();
  });

  it('voucher tidak valid ditolak tanpa membocorkan kode valid', async () => {
    seedCart();
    const user = userEvent.setup();
    renderAt('/checkout');
    await user.type(await screen.findByPlaceholderText('Masukkan kode promo'), 'NGAWUR');
    await user.click(screen.getByRole('button', { name: 'Terapkan' }));
    const msg = await screen.findByText(/Kode kupon tidak valid/i);
    expect(msg.textContent).not.toMatch(/URBANFIRST|ESSENTIAL2026/);
  });

  it('checkout berhasil: order unik, keranjang kosong, pindah ke halaman pesanan', async () => {
    seedCart();
    const user = userEvent.setup();
    renderAt('/checkout');

    await user.type(await screen.findByPlaceholderText('nama@email.com'), 'budi@example.com');
    await user.type(screen.getByPlaceholderText('812-3456-7890'), '812-3456-7890');
    await user.type(screen.getByPlaceholderText(/Nama sesuai identitas/), 'Budi Santoso');
    await user.type(
      screen.getByPlaceholderText(/Nama jalan, nomor rumah/),
      'Jl. Merdeka No. 10 RT 01/RW 02'
    );
    await user.type(screen.getByPlaceholderText('12160'), '12160');
    await user.click(await submitButton());

    await waitFor(() => {
      const orders = JSON.parse(localStorage.getItem('urbanstore_orders_v1') ?? '[]');
      expect(orders.length).toBeGreaterThan(3); // 3 seed + order baru
    });

    const orders = JSON.parse(localStorage.getItem('urbanstore_orders_v1')!);
    const created = orders[0];
    expect(created.recipientEmail).toBe('budi@example.com');
    expect(created.status).toBe('PENDING_PAYMENT');
    expect(created.orderNumber).toMatch(/^#URBN-\d{6}-\d{4}$/);
    expect(created.voucherCode).toBeUndefined();
    expect(created.discount).toBe(0);
    // total = subtotal + ongkir + biaya layanan
    expect(created.total).toBe(created.subtotal + created.shippingFee + created.serviceFee);
    // nomor order tidak menimpa order seed
    const numbers = orders.map((o: { orderNumber: string }) => o.orderNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
    // keranjang dikosongkan
    expect(localStorage.getItem('urbanstore_cart_v1')).toBe('[]');
    // tampil halaman konfirmasi dengan VA order baru
    expect(await screen.findAllByText(created.vaNumber)).not.toHaveLength(0);
  });

  it('dua order berturut-turut tidak saling menimpa', async () => {
    const user = userEvent.setup();
    const fill = async () => {
      await user.type(await screen.findByPlaceholderText('nama@email.com'), 'a@b.co');
      await user.type(screen.getByPlaceholderText('812-3456-7890'), '81234567890');
      await user.type(screen.getByPlaceholderText(/Nama sesuai identitas/), 'Ani');
      await user.type(screen.getByPlaceholderText(/Nama jalan, nomor rumah/), 'Jl. Mawar No. 5 RT 2');
      await user.type(screen.getByPlaceholderText('12160'), '12345');
      await user.click(await submitButton());
    };

    seedCart();
    const first = renderAt('/checkout');
    await fill();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('urbanstore_orders_v1')!)).toHaveLength(4)
    );
    first.unmount();

    seedCart();
    renderAt('/checkout');
    await fill();
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem('urbanstore_orders_v1')!)).toHaveLength(5)
    );
  }, 30000);
});

describe('navigasi', () => {
  it('logo/nama toko tersedia dan halaman home merender katalog', async () => {
    renderAt('/');
    const grid = await screen.findAllByText(/Oversized Heavyweight Tee/);
    expect(grid.length).toBeGreaterThan(0);
    expect(within(document.body).queryByText(/Paling Populer/)).toBeNull();
  });
});
