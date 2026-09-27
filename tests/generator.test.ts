import { test } from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { generateQR, presets, shapes, borders, textures } from '../src/core/index.js';
import { checkScannability } from '../src/core/node.js';

const payloads = [
  'https://example.com/hello',
  'A',
  'Hello, 世界! Café 🌿',
  'WIFI:T:WPA;S:Studio network;P:a-long-example-password;;',
];
for (const preset of presets) {
  test(`${preset.id}: every render decodes the exact payload under four conditions`, async () => {
    for (const text of payloads) {
      const { svg } = generateQR({ text, style: preset.id, size: 768 });
      const results = await checkScannability(svg, text);
      for (const result of results) assert.ok(result.passed, `${preset.id}: ${JSON.stringify(text)}: ${result.name}`);
    }
  });
}
test('every shape and border can be composed and decoded', async () => {
  for (let i = 0; i < shapes.length; i++) {
    const text = 'https://example.com/composition';
    const { svg } = generateQR({ text, recipe: { shape: shapes[i], border: borders[i % borders.length], texture: textures[i % textures.length], gradient: true } });
    const results = await checkScannability(svg, text);
    assert.ok(results.every(r => r.passed), `${shapes[i]} / ${borders[i % borders.length]} failed`);
  }
});
test('reserved modules and four-module quiet zone remain exact after stylization', async () => {
  const text = 'https://example.com/' + 'a'.repeat(180);
  const encoded = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const n = encoded.modules.size, dimension = n + 16;
  const { svg } = generateQR({ text, style: 'letterpress', recipe: { foreground: '#000000', background: '#ffffff' }, size: dimension * 8 });
  const { data, info } = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const pixel = (x: number, y: number) => [...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3)];
  for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) if (encoded.modules.isReserved(row, col)) {
    assert.deepEqual(pixel((col + 8) * 8 + 4, (row + 8) * 8 + 4), encoded.modules.get(row, col) ? [0, 0, 0] : [255, 255, 255]);
  }
  for (let y = 4 * 8; y < (n + 12) * 8; y++) for (let x = 4 * 8; x < (n + 12) * 8; x++) {
    if (x < 8 * 8 || x >= (n + 8) * 8 || y < 8 * 8 || y >= (n + 8) * 8) assert.deepEqual(pixel(x, y), [255, 255, 255]);
  }
});
test('seeded textures are deterministic and respond to the seed', () => {
  const options = { text: 'Repeatable', style: 'terrazzo' };
  assert.equal(generateQR(options).svg, generateQR(options).svg);
  assert.notEqual(generateQR(options).svg, generateQR({ ...options, recipe: { seed: 43 } }).svg);
});
test('research-derived presets expose source credits and SVG-native effects', () => {
  const credited = presets.filter(preset => preset.credit);
  assert.equal(credited.length, 24);
  for (const preset of credited) {
    assert.match(preset.credit!.url, /^https:\/\//);
    assert.ok(preset.credit!.name.length > 2);
    assert.ok(preset.credit!.technique.length > 8);
  }
  assert.match(generateQR({ text: 'motion', style: 'gradient-sweep' }).svg, /<animate /);
  assert.match(generateQR({ text: 'depth', style: 'floating-sticker' }).svg, /<filter /);
  assert.match(generateQR({ text: 'eyes', style: 'classy-noir' }).svg, /rx="1\.15"/);
});
test('rejects invalid payload, colors, size, seed, style and correction', () => {
  for (const options of [
    { text: '' }, { text: 'x', recipe: { foreground: '#eeeeee' } },
    { text: 'x', recipe: { background: '#000000' } },
    { text: 'x', recipe: { foreground: 'red" onload="alert(1)' } },
    { text: 'x', recipe: { seed: NaN } }, { text: 'x', size: 127 },
    { text: 'x', size: Infinity }, { text: 'x', style: 'missing' },
    { text: 'x', recipe: { gradient: true, accent: '#eeeeee' } },
  ]) assert.throws(() => generateQR(options));
  assert.throws(() => generateQR({ text: 'x', errorCorrection: 'INVALID' as 'H' }));
  assert.throws(() => generateQR({ text: 'x'.repeat(5000) }));
});
test('escapes untrusted payload in SVG metadata', () => {
  const { svg } = generateQR({ text: '<script>alert("x")</script>&' });
  assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes('&lt;script&gt;'));
});
test('custom renderer is restricted to data cells and clipped to each cell', async () => {
  const text = 'Custom artwork';
  const { svg } = generateQR({ text, moduleRenderer: () => '<rect x="0" y="0" width="999" height="999"/>' });
  const results = await checkScannability(svg, text);
  assert.ok(results.every(r => r.passed));
});
test('high-density payloads decode at the exported resolution', async () => {
  const text = 'https://example.com/long?data=' + '0123456789abc'.repeat(45);
  const result = generateQR({ text, style: 'editorial', size: 2048 });
  const checks = await checkScannability(result.svg, text);
  assert.equal(checks[0].passed, true);
  assert.ok(generateQR({ text, size: 128 }).warnings.some(w => w.includes('Small modules')));
});
