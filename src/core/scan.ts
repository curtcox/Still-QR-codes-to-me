import jsQRImport from 'jsqr';
import type { QRCode } from 'jsqr';
// jsQR exports a callable CommonJS value; its declarations describe a default export.
const jsQR = jsQRImport as unknown as (data: Uint8ClampedArray, width: number, height: number, options: { inversionAttempts: 'dontInvert' }) => QRCode | null;
export interface ScanResult { name: string; passed: boolean; }
export function decodeMatches(data: Uint8ClampedArray, width: number, height: number, text: string): boolean {
  return jsQR(data, width, height, { inversionAttempts: 'dontInvert' })?.data === text;
}
/** A deterministic contrast reduction, shared by browser and command-line checks. */
export function reduceContrast(data: Uint8ClampedArray): Uint8ClampedArray {
  const result = new Uint8ClampedArray(data);
  for (let i = 0; i < result.length; i += 4) for (let c = 0; c < 3; c++) result[i + c] = 128 + (result[i + c] - 128) * .55;
  return result;
}
