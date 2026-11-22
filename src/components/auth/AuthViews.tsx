import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { homePathFor } from '../../auth/guards';
import { describeAuthError } from '../../services/errors';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

const inputClass =
  'w-full bg-surface-subtle border border-border-hairline p-space-sm font-body-md text-body-md text-on-surface outline-none focus:border-border-strong focus:bg-canvas-base transition-colors';

interface FieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
}

const Field: React.FC<FieldProps> = ({ id, label, type = 'text', value, onChange, error, autoComplete, placeholder }) => (
  <div className="space-y-space-xs">
    <label htmlFor={id} className="font-label-caps text-label-caps uppercase text-on-surface tracking-wider block">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className={inputClass}
    />
    {error && (
      <p id={`${id}-error`} className="font-body-sm text-body-sm text-error font-medium">
        {error}
      </p>
    )}
  </div>
);

const AuthShell: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <main className="min-h-screen bg-surface flex items-center justify-center px-margin py-space-xl">
    <div className="w-full max-w-md">
      <div className="mb-space-lg text-center">
        <span className="font-headline-lg text-headline-lg uppercase tracking-tight text-primary font-bold">
          UrbanStore
        </span>
        <span className="block font-label-caps text-label-caps uppercase tracking-widest text-secondary mt-1">
          Curated Fashion
        </span>
      </div>
      <div className="bg-canvas-base p-space-lg shadow-sm border border-border-hairline">
        <h1 className="font-headline-md text-headline-md uppercase tracking-tight text-primary">{title}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-space-md">{subtitle}</p>
        {children}
      </div>
    </div>
  </main>
);

const SubmitButton: React.FC<{ busy: boolean; children: React.ReactNode }> = ({ busy, children }) => (
  <button
    type="submit"
    disabled={busy}
    className="w-full bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent disabled:opacity-60 disabled:cursor-not-allowed py-3 font-label-caps text-label-caps uppercase tracking-wider font-bold transition-colors cursor-pointer"
  >
    {busy ? 'Memproses…' : children}
  </button>
);

/* -------------------------------- Masuk -------------------------------- */

export const LoginView: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Masukkan alamat email yang valid.';
    if (!password) next.password = 'Kata sandi wajib diisi.';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const profile = await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from;
      const safeFrom = from && from.startsWith('/') && !from.startsWith('//') ? from : null;
      const role = profile?.role ?? 'customer';
      const target =
        role === 'admin'
          ? safeFrom?.startsWith('/admin')
            ? safeFrom
            : homePathFor('admin')
          : safeFrom && !safeFrom.startsWith('/admin')
            ? safeFrom
            : '/';
      navigate(target, { replace: true });
    } catch (err) {
      setFormError(describeAuthError(err));
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Masuk" subtitle="Masuk dengan email dan kata sandi untuk melanjutkan belanja.">
      <form onSubmit={submit} noValidate className="space-y-space-md">
        <Field id="login-email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="nama@email.com" />
        <Field id="login-password" label="Kata Sandi" type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="current-password" />
        {formError && (
          <p role="alert" className="font-body-sm text-body-sm text-error font-medium bg-error-container p-space-sm">
            {formError}
          </p>
        )}
        <SubmitButton busy={busy}>Masuk</SubmitButton>
      </form>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md text-center">
        Belum punya akun?{' '}
        <Link to="/daftar" state={location.state} className="text-primary font-semibold underline">
          Daftar
        </Link>
      </p>
    </AuthShell>
  );
};

/* -------------------------------- Daftar -------------------------------- */

export const RegisterView: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Nama lengkap wajib diisi.';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Masukkan alamat email yang valid.';
    if (password.length < MIN_PASSWORD_LENGTH) next.password = `Kata sandi minimal ${MIN_PASSWORD_LENGTH} karakter.`;
    if (confirm !== password) next.confirm = 'Konfirmasi kata sandi tidak sama.';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const { needsEmailConfirmation } = await signUp(email, password, fullName);
      if (needsEmailConfirmation) {
        setConfirmationSent(true);
        setBusy(false);
      } else {
        // Sesi langsung aktif: guard akan mengarahkan ke beranda.
        navigate('/', { replace: true });
      }
    } catch (err) {
      setFormError(describeAuthError(err));
      setBusy(false);
    }
  };

  if (confirmationSent) {
    return (
      <AuthShell title="Cek Email Anda" subtitle="Pendaftaran hampir selesai.">
        <p role="status" className="font-body-md text-body-md text-on-surface">
          Kami mengirim tautan konfirmasi ke <strong>{email.trim()}</strong>. Buka email tersebut untuk
          mengaktifkan akun, lalu masuk.
        </p>
        <Link
          to="/masuk"
          className="mt-space-md block w-full text-center bg-primary text-on-primary hover:bg-badge-promo hover:text-text-on-accent py-3 font-label-caps text-label-caps uppercase tracking-wider font-bold transition-colors"
        >
          Ke Halaman Masuk
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Daftar" subtitle="Buat akun pelanggan UrbanStore.">
      <form onSubmit={submit} noValidate className="space-y-space-md">
        <Field id="register-name" label="Nama Lengkap" value={fullName} onChange={setFullName} error={errors.fullName} autoComplete="name" />
        <Field id="register-email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" placeholder="nama@email.com" />
        <Field id="register-password" label="Kata Sandi" type="password" value={password} onChange={setPassword} error={errors.password} autoComplete="new-password" />
        <Field id="register-confirm" label="Ulangi Kata Sandi" type="password" value={confirm} onChange={setConfirm} error={errors.confirm} autoComplete="new-password" />
        {formError && (
          <p role="alert" className="font-body-sm text-body-sm text-error font-medium bg-error-container p-space-sm">
            {formError}
          </p>
        )}
        <SubmitButton busy={busy}>Buat Akun</SubmitButton>
      </form>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md text-center">
        Sudah punya akun?{' '}
        <Link to="/masuk" state={location.state} className="text-primary font-semibold underline">
          Masuk
        </Link>
      </p>
    </AuthShell>
  );
};
