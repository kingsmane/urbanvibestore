import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../auth/AuthContext';
import { ServicesProvider } from '../services/ServicesContext';
import { ADMIN, CUSTOMER, MemoryOptions, createMemoryServices } from './memoryServices';

export interface RenderAppOptions extends MemoryOptions {
  path?: string;
  /** 'customer' | 'admin' untuk langsung login, null untuk pengunjung. */
  as?: 'customer' | 'admin' | null;
}

/** Render aplikasi penuh dengan layanan in-memory; kembalikan layanan agar dapat diperiksa. */
export function renderApp({ path = '/', as = 'customer', ...memory }: RenderAppOptions = {}) {
  const sessionUserId = as === 'admin' ? ADMIN.id : as === 'customer' ? CUSTOMER.id : null;
  const mem = createMemoryServices({ sessionUserId, ...memory });
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <ServicesProvider services={mem.services}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ServicesProvider>
    </MemoryRouter>
  );
  return { ...utils, ...mem };
}
