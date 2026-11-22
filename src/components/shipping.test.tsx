import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '../data/storeData';
import { CUSTOMER } from '../test/memoryServices';
import { renderApp } from '../test/renderApp';

const tee = PRODUCTS.find((p) => p.id === 'prod-1')!;

const seedCart = (quantity: number) =>
  localStorage.setItem(
    `urbanstore_cart_v2:${CUSTOMER.id}`,
    JSON.stringify([
      {
        id: 'c1', productId: tee.id, sku: `${tee.sku}-M`, name: tee.shortName,
        price: tee.price, color: 'Chalk White', size: 'M', quantity, image: tee.image,
      },
    ])
  );

const placeOrder = async () => {
  const user = userEvent.setup();
  const app = renderApp({ path: '/checkout' });
  await screen.findByPlaceholderText('nama@email.com');
  await user.type(screen.getByPlaceholderText(/Nama jalan, nomor rumah/), 'Jl. Mawar No. 5 RT 2');
  await user.type(screen.getByPlaceholderText('12160'), '12345');
  await user.click(await screen.findByRole('button', { name: /Lanjut ke Pembayaran \(/ }));
  await waitFor(() => expect(app.state.orders).toHaveLength(1));
  return app.state.orders[0];
};

describe('gratis ongkir di checkout', () => {
  it('subtotal >= Rp 500.000 (3 x 249.000): ongkir reguler Rp 0 dan total konsisten', async () => {
    seedCart(3);
    const order = await placeOrder();
    expect(order.subtotal).toBe(747000);
    expect(order.shippingFee).toBe(0);
    expect(order.total).toBe(747000 + 0 + order.serviceFee);
  }, 30000);

  it('subtotal < Rp 500.000 (1 x 249.000): ongkir Rp 12.000', async () => {
    seedCart(1);
    const order = await placeOrder();
    expect(order.shippingFee).toBe(12000);
    expect(order.total).toBe(249000 + 12000 + order.serviceFee);
  }, 30000);

  it('ringkasan menampilkan petunjuk sisa belanja bila di bawah batas', async () => {
    seedCart(1);
    renderApp({ path: '/checkout' });
    expect(
      await screen.findByText(/Tambah Rp 251\.000 lagi untuk gratis ongkir reguler/)
    ).toBeInTheDocument();
  });

  it('tidak ada petunjuk dan tampil "Gratis" bila sudah memenuhi syarat', async () => {
    seedCart(3);
    renderApp({ path: '/checkout' });
    await screen.findByText('Penyelesaian Pesanan');
    expect(screen.queryByText(/lagi untuk gratis ongkir/)).toBeNull();
    expect((await screen.findAllByText('Gratis')).length).toBeGreaterThan(0);
  });
});
