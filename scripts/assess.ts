import { mkdir, writeFile } from 'node:fs/promises';
import { generateQR, presets } from '../src/core/index.js';
import { compareDecoders } from './lib/independent-scan.js';
import { ZXING_WASM_VERSION } from 'zxing-wasm/reader';

const payloads = ['https://example.com/hello', 'A', 'Hello, 世界! Café 🌿', 'WIFI:T:WPA;S:Studio network;P:a-long-example-password;;'];
const report = [];
for (const preset of presets) {
  for (const text of payloads) {
    const { svg } = generateQR({ text, style: preset.id, size: 768 });
    const checks = await compareDecoders(svg, text);
    report.push({ style: preset.id, text, checks });
  }
  const checks = report.filter(row => row.style === preset.id).flatMap(row => row.checks);
  console.log(`${preset.id}: jsQR ${checks.filter(c => c.jsQR).length}/${checks.length}; ZXing ${checks.filter(c => c.zxing).length}/${checks.length}`);
}
const directory = new URL('../examples/generated/', import.meta.url);
await mkdir(directory, { recursive: true });
await writeFile(new URL('decoder-report.json', directory), JSON.stringify({ zxingVersion: ZXING_WASM_VERSION, size: 768, report }, null, 2) + '\n');
// Disagreement remains a failure signal; never silently substitute one decoder for another.
if (report.some(row => row.checks.some(check => !check.jsQR || !check.zxing))) process.exitCode = 2;
