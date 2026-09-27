import sharp from 'sharp';
import { decodeMatches, reduceContrast, type ScanResult } from './scan.js';
export async function toPNG(svg: string, size?: number): Promise<Buffer> {
  let pipeline = sharp(Buffer.from(svg));
  if (size) pipeline = pipeline.resize(size, size);
  return pipeline.png().toBuffer();
}
export async function checkScannability(svg: string, text: string): Promise<ScanResult[]> {
  const input = Buffer.from(svg);
  const { width = 1024 } = await sharp(input).metadata();
  const small = Math.min(width, 256);
  const cases = [
    { name: `Export (${width}px)`, size: width, blur: false, contrast: false },
    { name: `Reduced (${small}px)`, size: small, blur: false, contrast: false },
    { name: `Blur (${small}px, σ 0.6)`, size: small, blur: true, contrast: false },
    { name: `Low contrast (${small}px)`, size: small, blur: false, contrast: true },
  ];
  const results: ScanResult[] = [];
  for (const test of cases) {
    let pipeline = sharp(input).resize(test.size, test.size);
    if (test.blur) pipeline = pipeline.blur(.6);
    const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixels = new Uint8ClampedArray(data);
    results.push({ name: test.name, passed: decodeMatches(test.contrast ? reduceContrast(pixels) : pixels, info.width, info.height, text) });
  }
  return results;
}

/** Decode local raster artwork; SVG and other active/vector formats are not accepted. */
export async function loadArtwork(input: Buffer): Promise<import('./artwork.js').RasterArtwork> {
  const source = sharp(input, { limitInputPixels: 40_000_000 });
  const metadata = await source.metadata();
  if (!['png', 'jpeg', 'webp'].includes(metadata.format ?? '')) throw new Error('Use PNG, JPEG, or WebP artwork.');
  const { data, info } = await source.rotate().resize(1024, 1024, { fit: 'cover' }).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data: new Uint8ClampedArray(data), width: info.width, height: info.height };
}
export async function imageQR(options: import('./artwork.js').ArtworkOptions): Promise<{ svg: string; strength: number; moduleCount: number; maskPattern: number }> {
  const { composeArtwork, artworkSVG } = await import('./artwork.js');
  const result = composeArtwork(options);
  const png = await sharp(result.data, { raw: { width: result.width, height: result.height, channels: 4 } }).png().toBuffer();
  return { svg: artworkSVG(`data:image/png;base64,${png.toString('base64')}`, result.width), strength: result.strength, moduleCount: result.moduleCount, maskPattern: result.maskPattern };
}
/** Decrease artistic freedom until every scan condition passes; report failure honestly. */
export async function refineImageQR(options: import('./artwork.js').ArtworkOptions) {
  const initial = options.strength ?? .7;
  const attempts: { strength: number; checks: ScanResult[] }[] = [];
  let result = await imageQR(options);
  for (const strength of [...new Set([initial, Math.max(0, initial - .2), Math.max(0, initial - .4), 0])]) {
    if (strength !== initial) result = await imageQR({ ...options, strength });
    const checks = await checkScannability(result.svg, options.text);
    attempts.push({ strength, checks });
    if (checks.every(check => check.passed)) return { ...result, attempts, passed: true };
  }
  return { ...result, attempts, passed: false };
}
