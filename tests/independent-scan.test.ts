import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateQR, presets } from '../src/core/index.js';
import { compareDecoders } from '../scripts/lib/independent-scan.js';

test('new research styles pass two independent decoders, including Unicode', async () => {
  for (const style of presets.slice(35,45)) for (const text of ['https://example.com/hello', 'Hello, 世界! Café 🌿']) {
    const checks = await compareDecoders(generateQR({ text, style: style.id, size: 768 }).svg, text);
    for (const check of checks) assert.ok(check.jsQR && check.zxing, `${style.id}: ${text}: ${JSON.stringify(check)}`);
  }
});
test('independent assessment rejects a different expected payload', async () => {
  const checks = await compareDecoders(generateQR({ text: 'actual' }).svg, 'wrong');
  assert.ok(checks.every(check => !check.jsQR && !check.zxing));
});
