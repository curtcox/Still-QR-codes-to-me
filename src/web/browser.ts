import { composeArtwork, artworkSVG } from '../core/artwork.js';
import { decodeMatches, reduceContrast, type ScanResult } from '../core/scan.js';
export async function rasterize(svg: string, size: number, blur = false): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Canvas is unavailable in this browser.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    if (blur) ctx.filter = 'blur(0.6px)';
    ctx.drawImage(image, 0, 0, size, size);
    return canvas;
  } finally { URL.revokeObjectURL(url); }
}
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob), link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function scan(svg: string, text: string, size: number): Promise<ScanResult[]> {
  const small = Math.min(size, 256);
  const results: ScanResult[] = [];
  for (const test of [
    { name: `Export · ${size}px`, size, blur: false, contrast: false },
    { name: `Reduced · ${small}px`, size: small, blur: false, contrast: false },
    { name: 'Soft focus · 0.6px', size: small, blur: true, contrast: false },
    { name: 'Low contrast · 55%', size: small, blur: false, contrast: true },
  ]) {
    await new Promise(resolve => setTimeout(resolve, 0));
    const canvas = await rasterize(svg, test.size, test.blur);
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, test.size, test.size).data;
    results.push({ name: test.name, passed: decodeMatches(test.contrast ? reduceContrast(pixels) : pixels, test.size, test.size, text) });
  }
  return results;
}

export async function readArtwork(file: Blob): Promise<import('../core/artwork.js').RasterArtwork> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Use PNG, JPEG, or WebP artwork.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Artwork must be smaller than 12 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('Artwork must be smaller than 40 megapixels.');
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    const crop = Math.min(bitmap.width, bitmap.height);
    ctx.drawImage(bitmap, (bitmap.width - crop) / 2, (bitmap.height - crop) / 2, crop, crop, 0, 0, 1024, 1024);
    return { data: ctx.getImageData(0, 0, 1024, 1024).data, width: 1024, height: 1024 };
  } finally { bitmap.close(); }
}
export function renderArtwork(options: import('../core/artwork.js').ArtworkOptions): { svg: string; moduleCount: number } {
  const result = composeArtwork(options);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = result.width;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(new ImageData(new Uint8ClampedArray(result.data), result.width, result.height), 0, 0);
  return { svg: artworkSVG(canvas.toDataURL('image/png'), result.width), moduleCount: result.moduleCount };
}
