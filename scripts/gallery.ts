import { mkdir, writeFile } from 'node:fs/promises';
import { generateQR, presets } from '../src/core/index.js';
import { checkScannability, toPNG } from '../src/core/node.js';
const directory = new URL('../examples/generated/', import.meta.url);
await mkdir(directory, { recursive: true });
const report = [];
for (const preset of presets) {
  const text = 'https://example.com/hello';
  const result = generateQR({ text, style: preset.id });
  await writeFile(new URL(`${preset.id}.svg`, directory), result.svg);
  await writeFile(new URL(`${preset.id}.png`, directory), await toPNG(result.svg));
  const checks = await checkScannability(result.svg, text);
  report.push({ style: preset.id, payload: text, checks });
  console.log(`${preset.id}: ${checks.filter(c => c.passed).length}/${checks.length} checks passed`);
}
await writeFile(new URL('scan-report.json', directory), JSON.stringify(report, null, 2) + '\n');
if (report.some(r => r.checks.some(c => !c.passed))) process.exitCode = 2;
