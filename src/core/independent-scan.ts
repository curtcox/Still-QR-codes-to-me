import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';
import sharp from 'sharp';
import { decodeMatches, reduceContrast } from './scan.js';

const require = createRequire(import.meta.url);
// Load the installed binary explicitly: assessment works offline, without a CDN.
prepareZXingModule({ overrides: { wasmBinary: new Uint8Array(await readFile(require.resolve('zxing-wasm/reader/zxing_reader.wasm'))).buffer } });
export async function compareDecoders(svg: string, text: string) {
  const input = Buffer.from(svg);
  const width = (await sharp(input).metadata()).width!;
  const small = Math.min(width, 256);
  const results = [];
  for (const condition of ['export', 'reduced', 'blur', 'contrast'] as const) {
    let pipeline = sharp(input).resize(condition === 'export' ? width : small);
    if (condition === 'blur') pipeline = pipeline.blur(.6);
    const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const rgba = new Uint8ClampedArray(data);
    const pixels = condition === 'contrast' ? reduceContrast(rgba) : rgba;
    const decoded = await readBarcodes({ colorSpace: 'srgb', data: new Uint8ClampedArray(pixels), width: info.width, height: info.height }, { formats: ['QRCode'], tryHarder: true, textMode: 'Plain' });
    results.push({ condition, jsQR: decodeMatches(pixels, info.width, info.height, text), zxing: decoded.some(result => result.isValid && result.text === text) });
  }
  return results;
}
