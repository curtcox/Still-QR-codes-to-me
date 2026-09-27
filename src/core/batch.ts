import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { generateQR, escapeXML } from './render.js';
import { getPreset } from './presets.js';
import { toPNG, checkScannability } from './node.js';
import { compareDecoders } from './independent-scan.js';
import type { GenerateOptions, GeneratedQR } from './types.js';

export interface FilmEntry {
  id: string; style: string; text: string; ecc: 'L' | 'M' | 'Q' | 'H';
  mode: 'feature' | 'shelf' | 'card'; caption: string;
}
export function validateManifest(input: unknown): FilmEntry[] {
  if (!Array.isArray(input) || !input.length) throw new Error('Manifest must be a nonempty array.');
  const ids = new Set<string>();
  for (const entry of input) {
    if (!entry || typeof entry !== 'object' || typeof entry.id !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(entry.id) || ['report','sheet'].includes(entry.id) || ids.has(entry.id)) throw new Error('Manifest ids must be unique, safe filenames (report and sheet are reserved).');
    ids.add(entry.id);
    if (typeof entry.style !== 'string' || typeof entry.text !== 'string' || !entry.text || typeof entry.caption !== 'string' || !['L','M','Q','H'].includes(entry.ecc) || !['feature','shelf','card'].includes(entry.mode)) throw new Error(`Invalid manifest entry: ${entry.id}`);
    getPreset(entry.style);
  }
  return input as FilmEntry[];
}
export function sidecar(result: GeneratedQR, text: string) {
  return { schemaVersion: 1, style: result.style.id, text, ...result.geometry };
}
export async function runBatch(manifestPath: string, outDir: string, options: Pick<GenerateOptions, 'modulePx' | 'frame'> = {}) {
  const entries = validateManifest(JSON.parse(await readFile(manifestPath, 'utf8')));
  // Preflight all entries before overwriting any outputs.
  for (const entry of entries) generateQR({ text: entry.text, style: entry.style, errorCorrection: entry.ecc, ...options });
  await mkdir(outDir, { recursive: true });
  const report = [];
  const tiles: { entry: FilmEntry; png: Buffer }[] = [];
  const styles = new Set<string>();
  for (const entry of entries) {
    const sizes = entry.mode === 'feature' ? [380,480] : [380];
    const checks = [];
    let output: GeneratedQR | undefined;
    for (const size of sizes) {
      const code = generateQR({ text: entry.text, style: entry.style, errorCorrection: entry.ecc, size, frame: options.frame });
      const existing = await checkScannability(code.svg, entry.text);
      const independent = await compareDecoders(code.svg, entry.text);
      checks.push({ size, existing, independent, passed: existing.every(c=>c.passed) && independent.every(c=>c.jsQR && c.zxing) });
      output = code;
    }
    if (options.modulePx !== undefined) {
      output = generateQR({ text: entry.text, style: entry.style, errorCorrection: entry.ecc, ...options });
      const existing = await checkScannability(output.svg, entry.text), independent = await compareDecoders(output.svg, entry.text);
      checks.push({ size: output.size, existing, independent, passed: existing.every(c=>c.passed) && independent.every(c=>c.jsQR && c.zxing) });
    }
    const png = await toPNG(output!.svg);
    await writeFile(join(outDir, `${entry.id}.png`), png);
    await writeFile(join(outDir, `${entry.id}.json`), JSON.stringify({ ...sidecar(output!, entry.text), id: entry.id, mode: entry.mode }, null, 2)+'\n');
    const passed = checks.every(check=>check.passed);
    report.push({ ...entry, image: `${entry.id}.png`, sidecar: `${entry.id}.json`, passed, checks });
    if (!styles.has(entry.style)) { tiles.push({ entry, png }); styles.add(entry.style); }
    console.error(`${passed?'PASS':'FAIL'} ${entry.id} (${checks.map(c=>c.size).join(', ')}px)`);
  }
  const summary = { entries: entries.length, styles: styles.size, passed: report.filter(r=>r.passed).length, failed: report.filter(r=>!r.passed).length };
  await writeFile(join(outDir,'report.json'), JSON.stringify({ schemaVersion: 1, summary, entries: report }, null, 2)+'\n');
  const rows = report.flatMap(entry => entry.checks.map(check => {
    const conditions = check.independent.map((c,i) => `${c.condition}: ${check.existing[i].passed && c.jsQR && c.zxing ? 'PASS' : 'FAIL'} (jsQR ${check.existing[i].passed && c.jsQR ? '✓':'✗'}, ZXing ${c.zxing?'✓':'✗'})`).join('; ');
    return `| ${entry.id} | ${entry.style} | ${check.size} | ${check.passed?'PASS':'FAIL'} | ${conditions} |`;
  }));
  await writeFile(join(outDir,'report.md'), `# Film QR scan report\n\n${summary.passed}/${summary.entries} entries passed; ${summary.styles} styles. Exact payload and manifest ECC; four conditions in both decoders. Feature entries tested at 380px and 480px.\n\n| Entry | Style | Pixels | Result | Conditions |\n| --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`);
  // Labels belong only to this review sheet, never to exported film artwork.
  const columns = 7, cell = 240, rowsCount = Math.ceil(tiles.length/columns);
  const layers = await Promise.all(tiles.map(async ({entry,png},i) => ({ input: await sharp(png).resize(220,220).png().toBuffer(), left: i%columns*cell+10, top: Math.floor(i/columns)*270+10 })));
  const labels = `<svg xmlns="http://www.w3.org/2000/svg" width="${columns*cell}" height="${rowsCount*270}">${tiles.map(({entry},i)=>`<text x="${i%columns*cell+12}" y="${Math.floor(i/columns)*270+252}" font-family="sans-serif" font-size="15" fill="#24322d">${escapeXML(entry.style)}</text>`).join('')}</svg>`;
  await sharp({ create: { width: columns*cell, height: rowsCount*270, channels: 4, background: '#ffffff' } }).composite([...layers,{input:Buffer.from(labels),left:0,top:0}]).png().toFile(join(outDir,'sheet.png'));
  return summary;
}
