#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { writeFile, readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { generateQR, presets, type Recipe, type GeneratedQR, type GenerateOptions } from './core/index.js';
import { checkScannability, toPNG, loadArtwork, imageQR, refineImageQR } from './core/node.js';

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
    ecc: { type: 'string' }, 'module-px': { type: 'string' }, frame: { type: 'string' },
    batch: { type: 'string' }, 'out-dir': { type: 'string' },
    artwork: { type: 'string' }, strength: { type: 'string', default: '0.7' }, refine: { type: 'boolean' },
    style: { type: 'string' }, out: { type: 'string', short: 'o' },
    size: { type: 'string' }, recipe: { type: 'string' },
    check: { type: 'boolean', default: false }, list: { type: 'boolean' }, help: { type: 'boolean', short: 'h' },
  } });
  if (values.help) {
    console.log(`Still QR — a code with character

Usage: still-qr "https://example.com" --style botanical -o code.svg --check
       still-qr "Hello" --recipe recipe.json -o code.png --size 1024
       still-qr --list

--ecc     L, M, Q, or H (default: H; batch uses each manifest ECC)
--module-px N  Integer pixels per module; determines size (cannot combine --size)
--frame   none or preset; none exports just the code and its quiet zone
--batch   Manifest JSON; writes PNGs, sidecars, scan reports, and sheet.png
--out-dir Batch output directory (required with --batch); batch may overwrite
          Every procedural PNG also gets a same-stem JSON geometry sidecar.
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
  if (values.ecc && !['L','M','Q','H'].includes(values.ecc)) throw new Error('--ecc must be L, M, Q, or H.');
  if (values.frame && !['none','preset'].includes(values.frame)) throw new Error('--frame must be none or preset.');
  const modulePx = values['module-px'] === undefined ? undefined : Number(values['module-px']);
  if (modulePx !== undefined && (!Number.isInteger(modulePx) || modulePx < 1 || modulePx > 128)) throw new Error('--module-px must be an integer from 1 to 128.');
  if (modulePx !== undefined && values.size !== undefined) throw new Error('Choose --module-px or --size, not both.');
  if (values.batch) {
    if (!values['out-dir'] || positionals.length || values.out || values.style || values.recipe || values.artwork || values.ecc || values.size || values.refine) throw new Error('--batch requires --out-dir and takes its payloads, ECC and sizes from the manifest.');
    const { runBatch } = await import('./core/batch.js');
    const summary = await runBatch(values.batch, values['out-dir'], { modulePx, frame: values.frame as GenerateOptions['frame'] });
    console.error(`${summary.passed}/${summary.entries} entries passed; ${summary.styles} styles`);
    if (summary.failed) process.exitCode = 2;
    return;
  }
  if (values['out-dir']) throw new Error('--out-dir requires --batch.');
  if (values.artwork && (values.ecc || values.frame || modulePx !== undefined)) throw new Error('--ecc, --frame and --module-px currently require procedural output.');
  if (positionals.length !== 1) throw new Error('Supply one quoted payload. Run with --help for usage.');
  if (values.out && !['.svg', '.png'].includes(extname(values.out).toLowerCase())) throw new Error('Output filename must end in .svg or .png.');
  const recipe = values.recipe ? JSON.parse(await readFile(values.recipe, 'utf8')) as Partial<Recipe> : undefined;
  if (recipe !== undefined && (!recipe || typeof recipe !== 'object' || Array.isArray(recipe))) throw new Error('Recipe must be a JSON object.');
  const text = positionals[0];
  if (values.refine && !values.artwork) throw new Error('--refine requires --artwork.');
  if (values.artwork && values.recipe) throw new Error('Choose --artwork or --recipe; image integration does not apply material recipes.');
  let result: { svg: string; warnings: string[] };
  let generated: GeneratedQR | undefined;
  if (values.artwork) {
    const artwork = await loadArtwork(await readFile(values.artwork));
    const options = { text, artwork, size: values.size === undefined ? undefined : Number(values.size), strength: Number(values.strength) };
    if (values.refine) {
      const refined = await refineImageQR(options);
      console.error(`Refinement: ${refined.attempts.length} attempt(s), freedom ${refined.strength.toFixed(2)}, ${refined.passed ? 'all checks passed' : 'scan failure'}`);
      if (!refined.passed) process.exitCode = 2;
      result = { svg: refined.svg, warnings: ['Image SVG embeds raster artwork. Test at intended physical size.'] };
    } else result = { ...(await imageQR(options)), warnings: ['Experimental image integration. Use --check or --refine.'] };
  } else result = generated = generateQR({ text, style: values.style, size: values.size === undefined ? undefined : Number(values.size), recipe, modulePx, frame: values.frame as GenerateOptions['frame'], errorCorrection: values.ecc as GenerateOptions['errorCorrection'] });
  for (const warning of result.warnings) console.error(`Note: ${warning}`);
  if (values.out) {
    const isPNG = extname(values.out).toLowerCase() === '.png';
    const sidecarPath = values.out.slice(0, -extname(values.out).length) + '.json';
    if (isPNG && generated) {
      const { access } = await import('node:fs/promises');
      try { await access(sidecarPath); throw new Error(`Sidecar already exists: ${sidecarPath}`); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    }
    await writeFile(values.out, extname(values.out).toLowerCase() === '.png' ? await toPNG(result.svg) : result.svg, { flag: 'wx' });
    if (isPNG && generated) await writeFile(sidecarPath, JSON.stringify({ schemaVersion: 1, style: generated.style.id, text, ...generated.geometry }, null, 2) + '\n', { flag: 'wx' });
    console.error(`Created ${values.out}`);
  } else process.stdout.write(result.svg + '\n');
  if (values.check) {
    const checks = await checkScannability(result.svg, text);
    for (const check of checks) console.error(`${check.passed ? 'PASS' : 'FAIL'} ${check.name}`);
    if (checks.some(check => !check.passed)) process.exitCode = 2;
  }
}
main().catch(error => { console.error(`Error: ${error instanceof Error ? error.message : String(error)}`); process.exitCode = 1; });
