#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { writeFile, readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { generateQR, presets, type Recipe } from './core/index.js';
import { checkScannability, toPNG, loadArtwork, imageQR, refineImageQR } from './core/node.js';

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    artwork: { type: 'string' }, strength: { type: 'string', default: '0.7' }, refine: { type: 'boolean' },
    style: { type: 'string', default: 'editorial' }, out: { type: 'string', short: 'o' },
    size: { type: 'string', default: '1024' }, recipe: { type: 'string' },
    check: { type: 'boolean', default: false }, list: { type: 'boolean' }, help: { type: 'boolean', short: 'h' },
  } });
  if (values.help) {
    console.log(`Still QR — a code with character

Usage: still-qr "https://example.com" --style botanical -o code.svg --check
       still-qr "Hello" --recipe recipe.json -o code.png --size 1024
       still-qr --list

--style   Preset ID (default: editorial)
--recipe  JSON recipe overrides (export from the playground)
--out, -o SVG or PNG output (default: SVG to stdout)
--size    Export width/height, 128–4096 px (default: 1024)
--check   Decode original, reduced, blurred, and low-contrast renders;
          exit 2 if any check fails. A failed check does not delete the output.
--artwork Local PNG/JPEG/WebP source for image-integrated QR
--strength Image freedom from 0 to 1 (default: 0.7)
--refine  Reduce image freedom until all four scan checks pass
--list    List available styles
--help    Show help

Payload and artwork stay local. No network calls or API keys required.`);
    return;
  }
  if (values.list) { for (const p of presets) console.log(`${p.id.padEnd(18)} ${p.name.padEnd(18)} ${p.safety} — ${p.description}${p.credit ? ` [after ${p.credit.name}: ${p.credit.url}]` : ''}`); return; }
  if (positionals.length !== 1) throw new Error('Supply one quoted payload. Run with --help for usage.');
  if (values.out && !['.svg', '.png'].includes(extname(values.out).toLowerCase())) throw new Error('Output filename must end in .svg or .png.');
  const recipe = values.recipe ? JSON.parse(await readFile(values.recipe, 'utf8')) as Partial<Recipe> : undefined;
  if (recipe !== undefined && (!recipe || typeof recipe !== 'object' || Array.isArray(recipe))) throw new Error('Recipe must be a JSON object.');
  const text = positionals[0];
  if (values.refine && !values.artwork) throw new Error('--refine requires --artwork.');
  if (values.artwork && values.recipe) throw new Error('Choose --artwork or --recipe; image integration does not apply material recipes.');
  let result: { svg: string; warnings: string[] };
  if (values.artwork) {
    const artwork = await loadArtwork(await readFile(values.artwork));
    const options = { text, artwork, size: Number(values.size), strength: Number(values.strength) };
    if (values.refine) {
      const refined = await refineImageQR(options);
      console.error(`Refinement: ${refined.attempts.length} attempt(s), freedom ${refined.strength.toFixed(2)}, ${refined.passed ? 'all checks passed' : 'scan failure'}`);
      if (!refined.passed) process.exitCode = 2;
      result = { svg: refined.svg, warnings: ['Image SVG embeds raster artwork. Test at intended physical size.'] };
    } else result = { ...(await imageQR(options)), warnings: ['Experimental image integration. Use --check or --refine.'] };
  } else result = generateQR({ text, style: values.style, size: Number(values.size), recipe });
  for (const warning of result.warnings) console.error(`Note: ${warning}`);
  if (values.out) {
    await writeFile(values.out, extname(values.out).toLowerCase() === '.png' ? await toPNG(result.svg) : result.svg, { flag: 'wx' });
    console.error(`Created ${values.out}`);
  } else process.stdout.write(result.svg + '\n');
  if (values.check) {
    const checks = await checkScannability(result.svg, text);
    for (const check of checks) console.error(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}`);
    if (checks.some(check => !check.passed)) process.exitCode = 2;
  }
}
main().catch(error => { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
