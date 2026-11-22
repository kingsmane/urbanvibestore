import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { INITIAL_ORDERS, PRODUCTS } from './data/storeData';
import { CUSTOMER } from './test/memoryServices';
import { renderApp } from './test/renderApp';

const tee = PRODUCTS.find((p) => p.id === 'prod-1')!;
const CART_KEY = `urbanstore_cart_v2:${CUSTOMER.id}`;

const seedCart = (quantity = 1) =>
  localStorage.setItem(
    CART_KEY,
    JSON.stringify([
      {
        id: 'c1',
        productId: tee.id,
        sku: `${tee.sku}-M`,
        name: tee.shortName,
        price: tee.price,
        color: 'Chalk White',
        size: 'M',
        quantity,
        image: tee.image,
      },
    ])
  );

const storedCart = () => JSON.parse(localStorage.getItem(CART_KEY) ?? '[]');

describe('routing', () => {
  it('merender detail produk dari URL', async () => {
    renderApp({ path: '/produk/prod-2' });
    expect(
      await screen.findByRole('heading', { level: 1, name: /Boxy Minimalist Linen Shirt/ })
    ).toBeInTheDocument();
  });

  it('produk tidak dikenal menampilkan 404 produk', async () => {
    renderApp({ path: '/produk/tidak-ada' });
    expect(await screen.findByText('Produk tidak ditemukan')).toBeInTheDocument();
  });

  it('URL tidak dikenal menampilkan halaman 404', async () => {
    renderApp({ path: '/halaman/aneh' });
    expect(await screen.findByText('Halaman tidak ditemukan')).toBeInTheDocument();
  });

  it('order yang tidak ada dialihkan ke akun', async () => {
    renderApp({ path: '/pesanan/tidak-ada', orders: INITIAL_ORDERS });
    expect((await screen.findAllByText(/#URBN-202611-8492/)).length).toBeGreaterThan(0);
  });

  it('/akun/tab-tidak-valid kembali ke tab pesanan', async () => {
    renderApp({ path: '/akun/ngawur', orders: INITIAL_ORDERS });
    expect((await screen.findAllByText(/#URBN-/)).length).toBeGreaterThan(0);
  });
});

describe('alur belanja', () => {
  it('menambah produk ke keranjang dari detail produk', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-2' });
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/i }));
    expect(storedCart()).toHaveLength(1);
    expect(storedCart()[0].productId).toBe('prod-2');
  });

  it('keranjang awal kosong untuk pengguna baru', async () => {
    renderApp({ path: '/checkout' });
    await screen.findByText('Penyelesaian Pesanan');
    expect(storedCart()).toEqual([]);
  });

  it('keranjang dipisah per akun', async () => {
    localStorage.setItem(
      'urbanstore_cart_v2:orang-lain',
      JSON.stringify([{ id: 'x', productId: 'prod-1', sku: 's', name: 'n', price: 1, color: 'c', size: 'M', quantity: 1, image: '' }])
    );
    renderApp({ path: '/checkout' });
    await screen.findByText('Penyelesaian Pesanan');
    expect(storedCart()).toEqual([]);
  });
});

describe('checkout', () => {
  const submitButton = () => screen.findByRole('button', { name: /Lanjut ke Pembayaran \(/ });

  const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.type(screen.getByPlaceholderText(/Nama jalan, nomor rumah/), 'Jl. Merdeka No. 10 RT 01/RW 02');
    await user.type(screen.getByPlaceholderText('12160'), '12160');
  };

  it('form diisi otomatis dari profil (email dan nama) dan tanpa data palsu', async () => {
    seedCart();
    renderApp({ path: '/checkout' });
    expect(await screen.findByPlaceholderText('nama@email.com')).toHaveValue(CUSTOMER.email);
    expect(screen.getByPlaceholderText(/Nama sesuai identitas/)).toHaveValue(CUSTOMER.fullName);
    expect(screen.getByPlaceholderText(/Nama jalan, nomor rumah/)).toHaveValue('');
  });

  it('alamat utama tersimpan mengisi form otomatis', async () => {
    seedCart();
    renderApp({
      path: '/checkout',
      addresses: [
        {
          id: 'a1', label: 'Rumah', isPrimary: true, recipient: 'Ani (+62 811)', phone: '+62 811-2222-3333',
          fullAddress: 'Jl. Kenanga No. 3, 40111', courierNote: '', recipientName: 'Ani Wulandari',
          streetAddress: 'Jl. Kenanga No. 3 RT 01', postalCode: '40111',
        },
      ],
    });
    await waitFor(() => expect(screen.getByPlaceholderText(/Nama sesuai identitas/)).toHaveValue('Ani Wulandari'));
    expect(screen.getByPlaceholderText('12160')).toHaveValue('40111');
    expect(screen.getByPlaceholderText(/Nama jalan, nomor rumah/)).toHaveValue('Jl. Kenanga No. 3 RT 01');
  });

  it('form tidak lengkap menampilkan error validasi dan tidak membuat order', async () => {
    seedCart();
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/checkout' });
    await user.click(await submitButton());
    expect(await screen.findByText(/Mohon lengkapi alamat pengiriman/i)).toBeInTheDocument();
    expect(screen.getByText(/Kode pos harus 5 digit/i)).toBeInTheDocument();
    expect(state.placeOrderCalls).toBe(0);
  });

  it('tidak ada voucher terpasang secara default', async () => {
    seedCart();
    renderApp({ path: '/checkout' });
    await submitButton();
    expect(screen.queryByText(/URBANFIRST — Hemat/)).toBeNull();
  });

  it('voucher tidak valid ditolak server tanpa membocorkan kode valid', async () => {
    seedCart();
    const user = userEvent.setup();
    renderApp({ path: '/checkout' });
    await user.type(await screen.findByPlaceholderText('Masukkan kode promo'), 'NGAWUR');
    await user.click(screen.getByRole('button', { name: 'Terapkan' }));
    const msg = await screen.findByText(/Kode kupon tidak valid/i);
    expect(msg.textContent).not.toMatch(/URBANFIRST|ESSENTIAL2026/);
  });

  it('voucher valid diterapkan dan mengurangi total', async () => {
    seedCart();
    const user = userEvent.setup();
    renderApp({ path: '/checkout' });
    await user.type(await screen.findByPlaceholderText('Masukkan kode promo'), 'urbanfirst');
    await user.click(screen.getByRole('button', { name: 'Terapkan' }));
    expect(await screen.findByText(/URBANFIRST — Hemat/)).toBeInTheDocument();
  });

  it('checkout berhasil: order dari server, keranjang kosong, halaman konfirmasi', async () => {
    seedCart();
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/checkout' });
    await screen.findByPlaceholderText('nama@email.com');
    await fillForm(user);
    await user.click(await submitButton());

    await waitFor(() => expect(state.orders).toHaveLength(1));
    const created = state.orders[0];
    expect(created.recipientEmail).toBe(CUSTOMER.email);
    expect(created.status).toBe('PENDING_PAYMENT');
    expect(created.orderNumber).toMatch(/^#URBN-\d{6}-\d{4}$/);
    expect(created.total).toBe(created.subtotal + created.shippingFee + created.serviceFee - created.discount);
    expect(created.vaNumber).toBeUndefined(); // metode default QRIS: tanpa VA
    // harga dari katalog server, bukan dari browser
    expect(created.subtotal).toBe(tee.price);
    // keranjang dikosongkan dan pindah ke halaman pesanan
    await waitFor(() => expect(storedCart()).toEqual([]));
    expect(await screen.findAllByText(created.orderNumber)).not.toHaveLength(0);
    // stok berkurang di server
    expect(state.stock.get('prod-1|M')).toBe(11);
  }, 30000);

  it('harga di keranjang yang dimanipulasi diabaikan: server memakai harga katalog', async () => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify([
        { id: 'c1', productId: 'prod-1', sku: 's', name: 'Tee', price: 1, color: 'Chalk White', size: 'M', quantity: 1, image: '' },
      ])
    );
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/checkout' });
    await screen.findByPlaceholderText('nama@email.com');
    await fillForm(user);
    await user.click(await submitButton());
    await waitFor(() => expect(state.orders).toHaveLength(1));
    expect(state.orders[0].subtotal).toBe(249000);
  }, 30000);

  it('stok habis saat checkout: pesan jelas, tidak ada order, keranjang tetap', async () => {
    seedCart();
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/checkout' });
    await screen.findByPlaceholderText('nama@email.com');
    await fillForm(user);
    state.stock.set('prod-1|M', 0); // stok diambil pembeli lain
    await user.click(await submitButton());
    expect(await screen.findByRole('alert')).toHaveTextContent(/Stok prod-1 ukuran M sudah habis/);
    expect(state.orders).toHaveLength(0);
    expect(storedCart()).toHaveLength(1);
  }, 30000);
});
