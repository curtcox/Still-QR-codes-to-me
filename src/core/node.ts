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
