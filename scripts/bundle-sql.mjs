/**
 * Menggabungkan semua migrasi menjadi satu berkas supabase/setup.sql agar bisa
 * ditempel sekali ke Supabase SQL Editor. Jalankan: npm run db:bundle
 * (jalankan `npm run db:seed` dulu bila storeData.ts berubah).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const dir = new URL('../supabase/migrations/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

const parts = [
  `-- =====================================================================
-- UrbanStore - setup database lengkap (DIHASILKAN oleh scripts/bundle-sql.mjs)
-- Jalankan SEKALI pada project Supabase yang masih kosong (SQL Editor -> Run).
-- Isi: ${files.join(', ')}
-- =====================================================================
`,
  ...files.map((f) => `\n-- >>>>>>>>>> ${f}\n${readFileSync(new URL(f, dir), 'utf8').trimEnd()}\n`),
];

writeFileSync(new URL('../supabase/setup.sql', import.meta.url), parts.join('\n'));
console.log(`supabase/setup.sql: ${files.length} migrasi digabung`);
