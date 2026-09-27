#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { writeFile, readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { generateQR, presets, type Recipe } from './core/index.js';
import { checkScannability, toPNG } from './core/node.js';

async function main() {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: {
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
--list    List available styles
--help    Show help

Payload and artwork stay local. No network calls or API keys required.`);
    return;
  }
  if (values.list) { for (const p of presets) console.log(`${p.id.padEnd(14)} ${p.name.padEnd(14)} ${p.safety} — ${p.description}`); return; }
  if (positionals.length !== 1) throw new Error('Supply one quoted payload. Run with --help for usage.');
  if (values.out && !['.svg', '.png'].includes(extname(values.out).toLowerCase())) throw new Error('Output filename must end in .svg or .png.');
  const recipe = values.recipe ? JSON.parse(await readFile(values.recipe, 'utf8')) as Partial<Recipe> : undefined;
  if (recipe !== undefined && (!recipe || typeof recipe !== 'object' || Array.isArray(recipe))) throw new Error('Recipe must be a JSON object.');
  const text = positionals[0];
  const result = generateQR({ text, style: values.style, size: Number(values.size), recipe });
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
