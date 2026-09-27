import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { generateQR, presets } from '../src/core/index.js';
import { escapeXML } from '../src/core/render.js';

const additions = presets.slice(35,45);
const cards = additions.map((preset, index) => {
  const x = 28 + index % 5 * 280, y = 105 + Math.floor(index / 5) * 345;
  const { svg } = generateQR({ text: 'https://example.com/hello', style: preset.id, size: 512 });
  return `<g transform="translate(${x} ${y})"><rect width="264" height="325" rx="12" fill="white"/><image x="12" y="12" width="240" height="240" href="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"/><text x="16" y="280" font-size="18" font-weight="bold">${escapeXML(preset.name)}</text><text x="16" y="305" font-size="13" fill="#58646a">After ${escapeXML(preset.credit!.name)}</text></g>`;
}).join('');
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="820"><rect width="1440" height="820" fill="#edf0ea"/><g font-family="Helvetica, Arial, sans-serif" fill="#20342d"><text x="28" y="46" font-size="30" font-weight="bold">Still QR / Ten more ways to make a mark</text><text x="28" y="77" font-size="17">Independent SVG implementations · source credits below · same payload in every code</text>${cards}</g></svg>`;
await writeFile(new URL('../docs/style-expansion.png', import.meta.url), await sharp(Buffer.from(sheet)).png().toBuffer());
