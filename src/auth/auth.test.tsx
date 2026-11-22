import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ADMIN, CUSTOMER } from '../test/memoryServices';
import { renderApp } from '../test/renderApp';

const typeLogin = async (user: ReturnType<typeof userEvent.setup>, email: string, password: string) => {
  await user.type(await screen.findByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Kata Sandi'), password);
  await user.click(screen.getByRole('button', { name: 'Masuk' }));
};

describe('penjaga rute (guards)', () => {
  it('pengunjung yang belum login dapat membuka beranda, detail produk, dan panduan ukuran', async () => {
    for (const path of ['/', '/produk/prod-1', '/panduan-ukuran']) {
      const { unmount } = renderApp({ path, as: null });
      expect(await screen.findByRole('link', { name: 'Masuk' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Keluar' })).toBeNull();
      unmount();
    }
  });

  it('pengunjung belum login dapat menambah item ke keranjang lalu diarahkan ke masuk saat checkout', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/produk/prod-2', as: null });
    await user.click(await screen.findByRole('button', { name: /Tambah ke Keranjang/i }, { timeout: 5000 }));
    await user.click(screen.getByRole('button', { name: 'Shopping Cart' }));
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
    await typeLogin(user, CUSTOMER.email, CUSTOMER.password);
    expect(await screen.findByText('Penyelesaian Pesanan')).toBeInTheDocument();
    expect(screen.getByText(/Boxy Minimalist Linen Shirt/)).toBeInTheDocument();
  });

  it('pengunjung belum login tidak dapat membuka checkout, pesanan, akun, maupun admin', async () => {
    for (const path of ['/checkout', '/pesanan/ord-1', '/akun/orders', '/admin', '/admin/pesanan']) {
      const { unmount } = renderApp({ path, as: null });
      expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
      unmount();
    }
  });

  it('customer yang membuka /admin dialihkan ke toko', async () => {
    renderApp({ path: '/admin', as: 'customer' });
    expect(await screen.findByRole('button', { name: 'Keluar' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ringkasan' })).toBeNull();
    expect(await screen.findByPlaceholderText('Cari warna, material, nama...')).toBeInTheDocument();
  });

  it('admin yang membuka halaman masuk dialihkan ke panel admin', async () => {
    renderApp({ path: '/masuk', as: 'admin' });
    expect(await screen.findByRole('heading', { name: 'Ringkasan' })).toBeInTheDocument();
  });

  it('customer yang sudah login membuka halaman masuk dialihkan ke beranda toko', async () => {
    renderApp({ path: '/masuk', as: 'customer' });
    expect(await screen.findByPlaceholderText('Cari warna, material, nama...')).toBeInTheDocument();
  });
});

describe('masuk', () => {
  it('customer masuk dengan email dan kata sandi lalu melihat toko', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/masuk', as: null });
    await typeLogin(user, CUSTOMER.email, CUSTOMER.password);
    expect(await screen.findByPlaceholderText('Cari warna, material, nama...')).toBeInTheDocument();
  });

  it('admin masuk dan langsung diarahkan ke panel admin', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/masuk', as: null });
    await typeLogin(user, ADMIN.email, ADMIN.password);
    expect(await screen.findByRole('heading', { name: 'Ringkasan' })).toBeInTheDocument();
  });

  it('kembali ke halaman yang semula dituju setelah masuk', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/akun/orders', as: null });
    await typeLogin(user, CUSTOMER.email, CUSTOMER.password);
    expect(await screen.findByRole('button', { name: 'Keluar' })).toBeInTheDocument();
    expect(await screen.findByText(/Riwayat Pesanan/i)).toBeInTheDocument();
  });

  it('customer tidak diarahkan ke /admin walau itu halaman semula', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/admin', as: null });
    await typeLogin(user, CUSTOMER.email, CUSTOMER.password);
    expect(await screen.findByPlaceholderText('Cari warna, material, nama...')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ringkasan' })).toBeNull();
  });

  it('kredensial salah menampilkan pesan error dalam bahasa Indonesia', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/masuk', as: null });
    await typeLogin(user, CUSTOMER.email, 'salah-total');
    expect(await screen.findByRole('alert')).toHaveTextContent('Email atau kata sandi salah.');
    expect(screen.getByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
  });

  it('validasi form: email tidak valid dan kata sandi kosong', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/masuk', as: null });
    await user.type(await screen.findByLabelText('Email'), 'bukan-email');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByText('Masukkan alamat email yang valid.')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi.')).toBeInTheDocument();
  });
});

describe('daftar', () => {
  const fill = async (
    user: ReturnType<typeof userEvent.setup>,
    v: { name?: string; email?: string; password?: string; confirm?: string }
  ) => {
    const nameField = await screen.findByLabelText('Nama Lengkap');
    if (v.name !== undefined) await user.type(nameField, v.name);
    if (v.email !== undefined) await user.type(screen.getByLabelText('Email'), v.email);
    if (v.password !== undefined) await user.type(screen.getByLabelText('Kata Sandi'), v.password);
    if (v.confirm !== undefined) await user.type(screen.getByLabelText('Ulangi Kata Sandi'), v.confirm);
    await user.click(screen.getByRole('button', { name: 'Buat Akun' }));
  };

  it('pendaftaran berhasil membuat akun customer dan masuk ke toko', async () => {
    const user = userEvent.setup();
    const { users } = renderApp({ path: '/daftar', as: null });
    await fill(user, { name: 'Citra Lestari', email: 'citra@example.com', password: 'rahasia123', confirm: 'rahasia123' });
    expect(await screen.findByPlaceholderText('Cari warna, material, nama...')).toBeInTheDocument();
    const created = users.find((u) => u.email === 'citra@example.com')!;
    expect(created.role).toBe('customer');
    expect(created.fullName).toBe('Citra Lestari');
  });

  it('akun baru tidak pernah menjadi admin walau mencoba mengirim peran', async () => {
    const user = userEvent.setup();
    const { users } = renderApp({ path: '/daftar', as: null });
    await fill(user, { name: 'Admin Palsu', email: 'palsu@example.com', password: 'rahasia123', confirm: 'rahasia123' });
    await screen.findByPlaceholderText('Cari warna, material, nama...');
    expect(users.find((u) => u.email === 'palsu@example.com')!.role).toBe('customer');
  });

  it('dengan konfirmasi email aktif: menampilkan instruksi cek email', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/daftar', as: null, needsEmailConfirmation: true });
    await fill(user, { name: 'Dewi', email: 'dewi@example.com', password: 'rahasia123', confirm: 'rahasia123' });
    expect(await screen.findByRole('heading', { name: 'Cek Email Anda' })).toBeInTheDocument();
    expect(screen.getByText('dewi@example.com')).toBeInTheDocument();
  });

  it('kata sandi < 8 karakter, konfirmasi berbeda, dan nama kosong ditolak', async () => {
    const user = userEvent.setup();
    const { users } = renderApp({ path: '/daftar', as: null });
    await fill(user, { email: 'x@example.com', password: 'pendek', confirm: 'beda' });
    expect(await screen.findByText('Kata sandi minimal 8 karakter.')).toBeInTheDocument();
    expect(screen.getByText('Konfirmasi kata sandi tidak sama.')).toBeInTheDocument();
    expect(screen.getByText('Nama lengkap wajib diisi.')).toBeInTheDocument();
    expect(users.find((u) => u.email === 'x@example.com')).toBeUndefined();
  });

  it('email yang sudah terdaftar ditolak dengan pesan jelas', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/daftar', as: null });
    await fill(user, { name: 'Budi', email: CUSTOMER.email, password: 'rahasia123', confirm: 'rahasia123' });
    expect(await screen.findByRole('alert')).toHaveTextContent('Email ini sudah terdaftar');
  });
});

describe('keluar', () => {
  it('tombol Keluar mengakhiri sesi dan kembali ke halaman masuk', async () => {
    const user = userEvent.setup();
    const { state } = renderApp({ path: '/', as: 'customer' });
    await user.click(await screen.findByRole('button', { name: 'Keluar' }));
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
    expect(state.signOutCalls).toBe(1);
  });

  it('setelah keluar, halaman akun tidak lagi dapat dibuka tanpa masuk kembali', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/akun/orders', as: 'customer' });
    await user.click(await screen.findByRole('button', { name: 'Keluar' }));
    await screen.findByRole('heading', { name: 'Masuk' });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Keluar' })).toBeNull());
  });

  it('admin melihat tautan Admin di toko dan dapat keluar dari panel', async () => {
    const user = userEvent.setup();
    renderApp({ path: '/', as: 'admin' }); // admin boleh melihat toko
    expect(await screen.findByRole('link', { name: 'Admin' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Admin' }));
    expect(await screen.findByRole('heading', { name: 'Ringkasan' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keluar' }));
    expect(await screen.findByRole('heading', { name: 'Masuk' })).toBeInTheDocument();
  });
});
