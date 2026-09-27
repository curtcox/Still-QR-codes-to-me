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
