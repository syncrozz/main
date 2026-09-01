/**
 * Utility to compress images (Files or Data URLs) before saving to LocalStorage or Firestore.
 * Reduces raw 2MB-10MB files down to lightweight 50KB-120KB web-optimized WebP/JPEG data URLs.
 * This completely prevents browser LocalStorage QuotaExceededError (5MB limit) and Firestore 1MB document limit.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
}

const DEFAULT_OPTIONS: CompressOptions = {
  maxWidth: 1200,
  maxHeight: 675,
  quality: 0.82,
  format: 'image/webp'
};

/**
 * Compress an image File and return a compressed Data URL
 */
export async function compressImageFile(file: File, options?: CompressOptions): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const src = e.target?.result as string;
      if (!src) {
        reject(new Error('Empty image file result'));
        return;
      }

      compressDataUrl(src, opts)
        .then(resolve)
        .catch(() => {
          // If canvas compression fails for any reason (e.g. SVG or strange format), fallback to original src
          resolve(src);
        });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Compress an existing Data URL (base64) using HTML Canvas
 */
export async function compressDataUrl(dataUrl: string, options?: CompressOptions): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // If it's an external HTTP URL or SVG data URL, return as-is
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://') || dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }

  // If it's already small (< 60KB), no heavy compression needed
  if (dataUrl.length < 80000) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onerror = () => {
      // Fallback to original
      resolve(dataUrl);
    };

    img.onload = () => {
      try {
        let width = img.width;
        let height = img.height;
        const maxW = opts.maxWidth || 1200;
        const maxH = opts.maxHeight || 675;

        // Calculate aspect ratio scale
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG if WebP not supported
        let result = '';
        try {
          result = canvas.toDataURL(opts.format || 'image/webp', opts.quality || 0.82);
        } catch {
          result = canvas.toDataURL('image/jpeg', opts.quality || 0.82);
        }

        // Return compressed if smaller, else original
        if (result && result.length < dataUrl.length) {
          resolve(result);
        } else {
          resolve(dataUrl);
        }
      } catch (err) {
        console.warn('Image compression fallback used:', err);
        resolve(dataUrl);
      }
    };

    img.src = dataUrl;
  });
}
