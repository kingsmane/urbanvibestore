import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import App from './../App';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

const savedAddresses = () => JSON.parse(localStorage.getItem('urbanstore_addresses_v1')!);

describe('AccountView', () => {
  it('menampilkan riwayat pesanan seed di tab pesanan', async () => {
    renderAt('/akun/orders');
    expect((await screen.findAllByText(/#URBN-202611-8492/)).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/#URBN-202610-3104/).length).toBeGreaterThan(0);
  });

  it('berpindah tab lewat tombol dan menampilkan konten tab', async () => {
    const user = userEvent.setup();
    renderAt('/akun/orders');
    await user.click(await screen.findByRole('button', { name: /Buku Alamat/ }));
    expect(await screen.findByRole('button', { name: /Tambah Alamat Baru/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /My Fit Profile/ }));
    expect(screen.queryByRole('button', { name: /Tambah Alamat Baru/ })).toBeNull();

    await user.click(screen.getByRole('button', { name: /Pengaturan/ }));
    expect(await screen.findAllByRole('checkbox')).not.toHaveLength(0);
  });

  it('URL /akun/addresses langsung membuka tab alamat', async () => {
    renderAt('/akun/addresses');
    expect(await screen.findByRole('button', { name: /Tambah Alamat Baru/ })).toBeInTheDocument();
  });

  it('menambah alamat baru lewat modal dan menyimpannya', async () => {
    const user = userEvent.setup();
    renderAt('/akun/addresses');
    await user.click(await screen.findByRole('button', { name: /Tambah Alamat Baru/ }));

    const submit = await screen.findByRole('button', { name: 'Simpan Alamat' });
    const form = submit.closest('form') as HTMLFormElement;
    const [label, recipient] = within(form).getAllByRole('textbox') as HTMLInputElement[];
    // urutan textbox: label, penerima, (textarea alamat), catatan
    const textboxes = within(form).getAllByRole('textbox') as HTMLElement[];
    const addressBox = textboxes.find((el) => el.tagName === 'TEXTAREA')!;
    const noteBox = textboxes[textboxes.length - 1];

    await user.clear(label);
    await user.type(label, 'Kos');
    await user.clear(recipient);
    await user.type(recipient, 'Budi (+62 811-1111-2222)');
    await user.type(addressBox, 'Jl. Kenanga No. 3, Bandung 40111');
    await user.type(noteBox, 'Titip di pos');
    await user.click(submit);

    await waitFor(() => expect(savedAddresses()).toHaveLength(3));
    const added = savedAddresses()[2];
    expect(added.label).toBe('Kos');
    expect(added.fullAddress).toContain('Bandung');
    expect(added.isPrimary).toBe(false);
    // modal tertutup
    expect(screen.queryByRole('button', { name: 'Simpan Alamat' })).toBeNull();
  }, 30000);

  it('mengubah alamat utama', async () => {
    const user = userEvent.setup();
    renderAt('/akun/addresses');
    await screen.findByRole('button', { name: /Tambah Alamat Baru/ });
    const setPrimary = screen.getAllByRole('button', { name: /Jadikan Utama/i });
    await user.click(setPrimary[0]);
    await waitFor(() => {
      const primary = savedAddresses().filter((a: { isPrimary: boolean }) => a.isPrimary);
      expect(primary).toHaveLength(1);
      expect(primary[0].id).toBe('addr-2');
    });
  });
});
