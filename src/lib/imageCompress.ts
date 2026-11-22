export interface CompressedImage {
  blob: Blob;
  fileName: string;
  originalSize: number;
  compressedSize: number;
}

const replaceExtension = (name: string, ext: string): string =>
  `${name.replace(/\.[^.]+$/, '') || 'image'}.${ext}`;

/**
 * Mengompres gambar di sisi klien (resize maks. 1200px + re-encode WebP/JPEG)
 * sebelum diunggah ke server.
 */
export async function compressImage(
  file: File,
  options: { maxDimension?: number; quality?: number } = {}
): Promise<CompressedImage> {
  const { maxDimension = 1200, quality = 0.8 } = options;

  if (typeof document === 'undefined' || typeof createImageBitmap !== 'function') {
    return {
      blob: file,
      fileName: file.name,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      bitmap.close();
      return { blob: file, fileName: file.name, originalSize: file.size, compressedSize: file.size };
    }
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const encode = (mime: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));

    const webp = await encode('image/webp');
    if (webp && webp.type === 'image/webp') {
      return {
        blob: webp,
        fileName: replaceExtension(file.name, 'webp'),
        originalSize: file.size,
        compressedSize: webp.size,
      };
    }

    const jpeg = await encode('image/jpeg');
    if (jpeg) {
      return {
        blob: jpeg,
        fileName: replaceExtension(file.name, 'jpg'),
        originalSize: file.size,
        compressedSize: jpeg.size,
      };
    }
  } catch {
    /* fallback ke file asli bila browser/test tidak mendukung decode */
  }

  return {
    blob: file,
    fileName: file.name,
    originalSize: file.size,
    compressedSize: file.size,
  };
}
