import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import QRCode from 'qrcode';
import { composeArtwork, artworkSVG, generateQR, materials } from '../src/core/index.js';
import { loadArtwork, imageQR, refineImageQR, checkScannability } from '../src/core/node.js';
const artwork = await loadArtwork(await readFile('public/artwork/bamboo-grove.png'));
test('image projection decodes URL, Unicode, Wi-Fi and short payloads after refinement', async () => {
  for (const text of ['https://example.com/hello', 'Hello 世界 🌱', 'A', 'WIFI:T:WPA;S:Studio;P:example123;;']) {
    const result = await refineImageQR({ text, artwork, strength: .9, size: 768 });
    assert.equal(result.passed, true, text);
    assert.ok(result.attempts.at(-1)!.checks.every(c => c.passed));
  }
});
test('reserved cells and quiet zone stay solid in image mode', () => {
  const text = 'Protected structure';
  const encoded = QRCode.create(text, { errorCorrectionLevel: 'H', maskPattern: 3 });
  const n = encoded.modules.size, size = (n + 8) * 8;
  const result = composeArtwork({ text, artwork, size, strength: 1, maskPattern: 3 });
  for (let row = -4; row < n + 4; row++) for (let col = -4; col < n + 4; col++) {
    const quiet = row < 0 || col < 0 || row >= n || col >= n;
    if (!quiet && !encoded.modules.isReserved(row, col)) continue;
    const x = (col + 4) * 8 + 4, y = (row + 4) * 8 + 4;
    const index = (y * size + x) * 4;
    assert.equal(result.data[index], !quiet && encoded.modules.get(row, col) ? 28 : 248);
  }
});
test('image projection is deterministic, retains texture, and freedom changes pixels', () => {
  const options = { text: 'Repeat me', artwork, size: 256 };
  const a = composeArtwork(options);
  assert.deepEqual(a.data, composeArtwork(options).data);
  assert.notDeepEqual(a.data, composeArtwork({ ...options, strength: 0 }).data);
  assert.ok(new Set(a.data).size > 100, 'Artwork detail must survive projection');
});
test('image input rejects active resources, invalid dimensions, strengths and masks', async () => {
  assert.throws(() => artworkSVG('https://example.com/image.svg', 512));
  assert.throws(() => composeArtwork({ text: 'x', artwork, strength: NaN }));
  assert.throws(() => composeArtwork({ text: 'x', artwork, maskPattern: 8 }));
  assert.throws(() => composeArtwork({ text: 'x', artwork: { ...artwork, width: 2 } }));
  await assert.rejects(loadArtwork(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>')));
});
test('different materials change geometry even in the same palette', () => {
  const outputs = materials.map(material => generateQR({ text: 'Material', recipe: { material } }).svg);
  assert.equal(new Set(outputs).size, materials.length);
  assert.throws(() => generateQR({ text: 'x', recipe: { detail: 2 } }));
});
test('image composition handles transparent artwork and preserves exact payload', async () => {
  const transparent = { width: 64, height: 64, data: new Uint8ClampedArray(64 * 64 * 4) };
  const result = await imageQR({ text: 'Transparency', artwork: transparent, strength: 0, size: 512 });
  assert.ok((await checkScannability(result.svg, 'Transparency')).every(c => c.passed));
});

test('ice and fire source artwork refine into decodable image codes', async () => {
  for (const id of ['glacial-ice', 'embers']) {
    const source = await loadArtwork(await readFile(`public/artwork/${id}.png`));
    const result = await refineImageQR({ text: 'https://example.com/hello', artwork: source, strength: .9, size: 1024 });
    assert.equal(result.passed, true, id);
  }
});

test('refinement reports failure when even maximum correction cannot decode a dense tiny code', async () => {
  const result = await refineImageQR({ text: 'https://example.com/?data=' + '0123456789abc'.repeat(45), artwork, strength: .9, size: 128 });
  assert.equal(result.passed, false);
  assert.equal(result.attempts.at(-1)!.strength, 0);
  assert.ok(result.attempts.every(attempt => attempt.checks.some(check => !check.passed)));
  assert.ok(result.svg.includes('data:image/png;base64,'));
});
