import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from '../App';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

const store = (key: string) => JSON.parse(localStorage.getItem(key) ?? 'null');

describe('HomeView', () => {
  it('pencarian tanpa hasil menampilkan empty state lalu bisa direset', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const search = await screen.findByPlaceholderText('Cari warna, material, nama...');
    await user.type(search, 'zzzzqqq');
    expect(await screen.findByText('Tidak Ada Artikel yang Cocok')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tampilkan Semua Koleksi' }));
    await waitFor(() => expect(screen.queryByText('Tidak Ada Artikel yang Cocok')).toBeNull());
  });

  it('opsi sort tidak lagi memuat "Paling Populer"', async () => {
    renderAt('/');
    await screen.findByPlaceholderText('Cari warna, material, nama...');
    expect(screen.queryByRole('option', { name: /Paling Populer/ })).toBeNull();
    expect(screen.getByRole('option', { name: /Harga: Terendah/ })).toBeInTheDocument();
  });

  it('tombol tambah produk di katalog memasukkan item ke keranjang', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const adds = await screen.findAllByRole('button', { name: 'Tambah Produk' });
    await user.click(adds[0]);
    await waitFor(() => expect(store('urbanstore_cart_v1')).toHaveLength(1));
  });
});

describe('ProductDetailView', () => {
  it('produk habis: tombol dinonaktifkan dan tidak menambah ke keranjang', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-4');
    const btn = await screen.findByRole('button', { name: /Stok Habis/ });
    expect(btn).toBeDisabled();
    await user.click(btn);
    expect(store('urbanstore_cart_v1')).toEqual([]);
  });

  it('tambah ke keranjang memakai ukuran default produk', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-2');
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/ }));
    const cart = store('urbanstore_cart_v1');
    expect(cart[0].size).toBe('M');
    expect(cart[0].price).toBe(389000);
  });

  it('modal zoom foto dapat dibuka', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-1');
    await user.click(await screen.findByRole('button', { name: 'Perbesar foto' }));
    // modal zoom menambah tombol tutup/gambar ekstra
    expect(document.querySelectorAll('.fixed.inset-0').length).toBeGreaterThan(0);
  });

  it('modal panduan ukuran dapat dibuka dan ditutup', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-1');
    await user.click(await screen.findByRole('button', { name: /Cek Panduan Ukuran/ }));
    expect(await screen.findByText('Panduan Ukuran Presisi')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tutup Panduan Ukuran' }));
    await waitFor(() => expect(screen.queryByText('Panduan Ukuran Presisi')).toBeNull());
  });
});

describe('SizeGuideView', () => {
  it('menghitung rekomendasi ukuran dan menyimpannya ke fit profile', async () => {
    const user = userEvent.setup();
    renderAt('/panduan-ukuran');
    await user.click(await screen.findByRole('button', { name: /Hitung Ukuran Rekomendasi/ }));
    const fit = store('urbanstore_fit_v1');
    expect(['S', 'M', 'L', 'XL', 'XXL']).toContain(fit.calculatedSize);
    expect(fit.recommendedTop).toBe(`Size ${fit.calculatedSize}`);
  });

  it('memilih preferensi Slim menghitung ulang ukuran', async () => {
    const user = userEvent.setup();
    renderAt('/panduan-ukuran');
    await user.click(await screen.findByRole('button', { name: 'Slim' }));
    expect(store('urbanstore_fit_v1').preference).toBe('slim');
  });

  it('"Gunakan Ukuran" kembali ke halaman produk terakhir dan menyimpan ukuran', async () => {
    const user = userEvent.setup();
    renderAt('/panduan-ukuran');
    const use = (await screen.findAllByRole('button', { name: /Gunakan Ukuran/ }))[0];
    await user.click(use);
    expect(
      await screen.findByRole('heading', { level: 1, name: /Oversized Heavyweight Tee/ })
    ).toBeInTheDocument();
    expect(store('urbanstore_fit_v1').recommendedTop).toMatch(/^Size /);
  });
});

describe('OrderConfirmationView', () => {
  const orderUrl = '/pesanan/ord-1';

  it('menampilkan nomor order dan VA dari order', async () => {
    renderAt(orderUrl);
    expect((await screen.findAllByText(/#URBN-202611-8492/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('8277 0812 3456 7890').length).toBeGreaterThan(0);
  });

  it('cek status tanpa unggah bukti tidak mengubah status order', async () => {
    const user = userEvent.setup();
    renderAt(orderUrl);
    await user.click(await screen.findByRole('button', { name: /Cek Status Pembayaran/ }));
    expect(await screen.findByText(/Menunggu input transfer/, undefined, { timeout: 4000 })).toBeInTheDocument();
    const o = store('urbanstore_orders_v1').find((x: { id: string }) => x.id === 'ord-1');
    expect(o.status).toBe('PENDING_PAYMENT');
  }, 15000);

  it('unggah bukti lalu cek status mengubah order menjadi IN_TRANSIT', async () => {
    const user = userEvent.setup();
    renderAt(orderUrl);
    await user.click(await screen.findByRole('button', { name: /Unggah Bukti Transfer/ }));
    await user.click(screen.getByRole('button', { name: /Cek Status Pembayaran/ }));
    await waitFor(
      () => {
        const o = store('urbanstore_orders_v1').find((x: { id: string }) => x.id === 'ord-1');
        expect(o.status).toBe('IN_TRANSIT');
      },
      { timeout: 4000 }
    );
  }, 15000);
});

describe('Layout', () => {
  it('footer: membuka modal informasi Kebijakan Privasi dan tidak mengklaim SSL 256-bit', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('button', { name: 'Kebijakan Privasi' }));
    expect(await screen.findByText(/koneksi HTTPS/)).toBeInTheDocument();
    expect(screen.queryByText(/256-Bit SSL/)).toBeNull();
  });

  it('newsletter: submit menampilkan konfirmasi dan mengosongkan input', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const input = await screen.findByPlaceholderText('Surel Anda');
    await user.type(input, 'a@b.co');
    await user.keyboard('{Enter}');
    await waitFor(() => expect(input).toHaveValue(''));
  });

  it('navigasi: tombol keranjang membuka checkout dan badge menghitung item', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-2');
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/ }));
    await user.click((await screen.findAllByRole('button', { name: 'Shopping Cart' }))[0]);
    expect(await screen.findByText('Penyelesaian Pesanan')).toBeInTheDocument();
  });

  it('toast tambah ke keranjang tidak memuat klaim gratis ongkir', async () => {
    const user = userEvent.setup();
    renderAt('/produk/prod-2');
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/ }));
    expect(await screen.findByText(/Ditambahkan: Boxy Minimalist Linen Shirt/)).toBeInTheDocument();
    expect(screen.queryByText(/Gratis Ongkir Otomatis/i)).toBeNull();
  });
});
