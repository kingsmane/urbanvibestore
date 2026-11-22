import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';

const UPLOAD_MAX_BYTES = 5 * 1024 * 1024;

function localUploadPlugin(): Plugin {
  const attach = (middlewares: {use: (route: string, fn: (req: any, res: any, next: () => void) => void) => void}) => {
    middlewares.use('/api/upload', (req, res, next) => {
      if (req.method !== 'POST') return next();
      const chunks: Buffer[] = [];
      let total = 0;
      req.on('data', (chunk: Buffer) => {
        total += chunk.length;
        if (total > UPLOAD_MAX_BYTES * 1.4) {
          res.statusCode = 413;
          res.end(JSON.stringify({error: 'Ukuran berkas terlalu besar (maks 5MB).'}));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
            fileName?: string;
            dataBase64?: string;
          };
          const rawName = (body.fileName || 'image.webp').replace(/[^a-zA-Z0-9._-]/g, '-');
          const ext = path.extname(rawName).toLowerCase();
          if (!['.webp', '.jpg', '.jpeg', '.png'].includes(ext)) {
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Format gambar tidak didukung.'}));
            return;
          }
          const buf = Buffer.from(body.dataBase64 || '', 'base64');
          if (buf.length === 0 || buf.length > UPLOAD_MAX_BYTES) {
            res.statusCode = 400;
            res.end(JSON.stringify({error: 'Data gambar tidak valid atau melebihi 5MB.'}));
            return;
          }
          const outDir = path.resolve(__dirname, 'public/uploads/products');
          fs.mkdirSync(outDir, {recursive: true});
          const uniqueName = `${Date.now()}-${rawName}`;
          fs.writeFileSync(path.join(outDir, uniqueName), buf);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({url: `/uploads/products/${uniqueName}`}));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({error: 'Gagal memproses unggahan.'}));
        }
      });
    });
  };
  return {
    name: 'local-upload-api',
    configureServer(server) {
      attach(server.middlewares);
    },
    configurePreviewServer(server) {
      attach(server.middlewares);
    },
  };
}

export default defineConfig(({mode}) => {
  // Hanya dua nilai publik Supabase yang diteruskan ke bundle browser. Memakai
  // `define` (bukan envPrefix) agar variabel rahasia lain di .env tidak pernah
  // ikut terekspos. Mendukung nama VITE_* maupun SUPABASE_* di .env.
  const env = loadEnv(mode, process.cwd(), '');
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_PROJECT_URL || '';
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_PUBLISHABLE_KEY || '';
  return {
    define: {
      __SUPABASE_URL__: JSON.stringify(supabaseUrl),
      __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(supabaseKey),
    },
    plugins: [
      react(),
      tailwindcss(),
      localUploadPlugin(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
