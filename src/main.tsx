import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import { getSupabase, isSupabaseConfigured } from './lib/supabase.ts';
import { ServicesProvider } from './services/ServicesContext.tsx';
import { createSupabaseServices } from './services/supabaseServices.ts';
import './index.css';

const root = createRoot(document.getElementById('root')!);

if (!isSupabaseConfigured) {
  root.render(
    <main className="min-h-screen flex items-center justify-center bg-surface px-margin">
      <div role="alert" className="max-w-md bg-canvas-base border border-border-hairline p-space-lg">
        <h1 className="font-headline-md text-headline-md uppercase text-primary mb-space-xs">
          Supabase belum dikonfigurasi
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Isi <code>SUPABASE_PROJECT_URL</code> dan <code>SUPABASE_PUBLISHABLE_KEY</code> di file{' '}
          <code>.env</code>, lalu jalankan ulang server pengembangan.
        </p>
      </div>
    </main>
  );
} else {
  const services = createSupabaseServices(getSupabase());
  root.render(
    <StrictMode>
      <ServicesProvider services={services}>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ServicesProvider>
    </StrictMode>
  );
}
