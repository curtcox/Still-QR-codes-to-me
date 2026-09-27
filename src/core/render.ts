import QRCode from 'qrcode';
import { getPreset } from './presets.js';
import { borders, shapes, textures, type GenerateOptions, type GeneratedQR, type ModuleContext, type Recipe } from './types.js';

export function escapeXML(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);
}
function luminance(hex: string): number {
  const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
}
export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a), l2 = luminance(b);
  return (Math.max(l1, l2) + .05) / (Math.min(l1, l2) + .05);
}
function validate(recipe: Recipe): void {
  for (const key of ['foreground', 'background', 'accent'] as const) {
    if (!/^#[0-9a-f]{6}$/i.test(recipe[key])) throw new Error(`${key} must be a six-digit hex color, such as #173e35.`);
  }
  if (!shapes.includes(recipe.shape) || !borders.includes(recipe.border) || !textures.includes(recipe.texture)) throw new Error('Unknown shape, border, or texture.');
  if (typeof recipe.gradient !== 'boolean') throw new Error('gradient must be true or false.');
  if (!Number.isSafeInteger(recipe.seed) || recipe.seed < 0 || recipe.seed > 0xffffffff) throw new Error('seed must be an integer from 0 to 4294967295.');
  if (luminance(recipe.background) < .65) throw new Error('Choose a light background to keep the QR clear margin readable.');
  const inks = recipe.gradient ? [recipe.foreground, recipe.accent] : [recipe.foreground];
  if (inks.some(ink => contrastRatio(ink, recipe.background) < 4.5)) throw new Error('Use darker ink: QR colors must have at least 4.5:1 contrast against the background.');
}
function randomAt(seed: number, row: number, column: number): number {
  let n = (seed ^ Math.imul(row + 1, 374761393) ^ Math.imul(column + 1, 668265263)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function moduleSVG(shape: Recipe['shape'], { x, y, row, column, random, darkAt }: ModuleContext): string {
  const rect = (dx = 0, dy = 0, w = 1, h = 1, radius = 0) => `<rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" rx="${radius}"/>`;
  const circle = (r: number) => `<circle cx="${x + .5}" cy="${y + .5}" r="${r}"/>`;
  switch (shape) {
    case 'square': return rect();
    case 'rounded': return rect(.025, .025, .95, .95, .23);
    case 'dots': return circle(.47);
    case 'diamond': return `<path d="M${x + .5} ${y}L${x + 1} ${y + .5}L${x + .5} ${y + 1}L${x} ${y + .5}Z"/>`;
    case 'squircle': return rect(.015, .015, .97, .97, .36);
    case 'horizontal': return rect(0, .09, 1, .82, .12);
    case 'vertical': return rect(.09, 0, .82, 1, .12);
    case 'weave': return (row + column) % 2 ? rect(.09, 0, .82, 1, .06) : rect(0, .09, 1, .82, .06);
    case 'mosaic': { const inset = .02 + random * .055; return rect(inset, inset, 1 - 2 * inset, 1 - 2 * inset, random * .18); }
    case 'circuit': return circle(.43) + (darkAt(row, column + 1) ? rect(.5, .27, .5, .46) : '') + (darkAt(row, column - 1) ? rect(0, .27, .5, .46) : '') + (darkAt(row + 1, column) ? rect(.27, .5, .46, .5) : '') + (darkAt(row - 1, column) ? rect(.27, 0, .46, .5) : '');
    case 'petal': return `<path d="M${x + .05} ${y + .05}H${x + .5}Q${x + .95} ${y + .05} ${x + .95} ${y + .5}V${y + .95}H${x + .5}Q${x + .05} ${y + .95} ${x + .05} ${y + .5}Z"/>`;
    case 'halftone': return circle(.43 + random * .06);
  }
}
/** Decorative art stays outside the solid QR plate, including its four-module quiet zone. */
function decoration(recipe: Recipe, size: number): string {
  const s = size, mid = s / 2;
  const frame = `<rect x="1.1" y="1.1" width="${s - 2.2}" height="${s - 2.2}" rx="1.2"/>`;
  let art = '';
  switch (recipe.border) {
    case 'none': break;
    case 'frame': art = frame + `<rect x="1.7" y="1.7" width="${s - 3.4}" height="${s - 3.4}" rx=".7" stroke-width=".09"/>`; break;
    case 'botanical':
      for (let side = 0; side < 4; side++) {
        let stem = `<path d="M4 1.5Q${mid} 3 ${s - 4} 1.5"/>`;
        for (let x = 5; x < s - 4; x += 3) stem += `<path d="M${x} 2Q${x - 1} .4 ${x - 1.9} .7Q${x - 1.4} 2.1 ${x} 2M${x + .8} 2Q${x + 1.4} 3.6 ${x + 2.2} 3.1Q${x + 2} 2 ${x + .8} 2"/>`;
        art += `<g transform="rotate(${side * 90} ${mid} ${mid})">${stem}</g>`;
      } break;
    case 'postage': art = `<rect x="1.6" y="1.6" width="${s - 3.2}" height="${s - 3.2}" stroke-width="1.2" stroke-dasharray=".15 1.25" stroke-linecap="round"/>` + `<rect x="2.6" y="2.6" width="${s - 5.2}" height="${s - 5.2}" stroke-width=".12"/>`; break;
    case 'orbit':
      for (let side = 0; side < 4; side++) art += `<g transform="rotate(${side * 90} ${mid} ${mid})"><path d="M4 3Q${mid} -1.5 ${s - 4} 3"/><circle cx="${mid + 4}" cy="1.1" r=".55" fill="${recipe.accent}"/></g>`;
      break;
    case 'deco': art = frame; for (let side = 0; side < 4; side++) art += `<g transform="rotate(${side * 90} ${mid} ${mid})"><path d="M${mid - 4} 1.5L${mid} 3.4L${mid + 4} 1.5M${mid - 2} 1.5L${mid} 2.4L${mid + 2} 1.5"/></g>`; break;
    case 'grid':
      art = frame;
      for (let x = 4; x < s - 3; x += 2) art += `<path d="M${x} .5v1.2M${x} ${s - .5}v-1.2M.5 ${x}h1.2M${s - .5} ${x}h-1.2"/>`;
      break;
    case 'ticket': art = `<rect x="1.3" y="1.3" width="${s - 2.6}" height="${s - 2.6}" rx="2" stroke-dasharray="1 .7"/>`; for (const x of [1.3, s - 1.3]) art += `<circle cx="${x}" cy="${mid}" r="1.3" fill="${recipe.background}"/>`; break;
  }
  return `<g fill="none" stroke="${recipe.accent}" stroke-width=".2">${art}</g>`;
}
function texture(recipe: Recipe, size: number): string {
  if (recipe.texture === 'none') return '';
  let art = '';
  if (recipe.texture === 'lines') {
    for (let y = .4; y < size; y += .7) art += `<path d="M0 ${y}H${size}"/>`;
    return `<g stroke="${recipe.accent}" stroke-width=".055" opacity=".13">${art}</g>`;
  }
  for (let i = 0; i < 700; i++) {
    const x = randomAt(recipe.seed, i, 1) * size, y = randomAt(recipe.seed, i, 2) * size;
    art += `<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${recipe.texture === 'paper' ? .035 : (.04 + randomAt(recipe.seed, i, 3) * .11).toFixed(3)}"/>`;
  }
  return `<g fill="${recipe.accent}" opacity="${recipe.texture === 'paper' ? .2 : .25}">${art}</g>`;
}
export function generateQR(options: GenerateOptions): GeneratedQR {
  if (typeof options.text !== 'string' || options.text.length === 0) throw new Error('Enter a URL or some text to encode.');
  const size = options.size ?? 1024;
  if (!Number.isInteger(size) || size < 128 || size > 4096) throw new Error('Export size must be an integer between 128 and 4096 pixels.');
  const errorCorrection = options.errorCorrection ?? 'H';
  if (!['L', 'M', 'Q', 'H'].includes(errorCorrection)) throw new Error('Error correction must be L, M, Q, or H.');
  const style = getPreset(options.style);
  const recipe = { ...style.recipe, ...options.recipe };
  validate(recipe);
  const code = QRCode.create(options.text, { errorCorrectionLevel: errorCorrection });
  const n = code.modules.size;
  const border = recipe.border === 'none' && recipe.texture === 'none' ? 0 : 4;
  const offset = border + 4, dimension = n + offset * 2;
  const darkAt = (row: number, column: number) => row >= 0 && column >= 0 && row < n && column < n && !!code.modules.get(row, column);
  const paths: string[] = [];
  const clips: string[] = [];
  const inkId = `ink-${recipe.foreground.slice(1)}-${recipe.accent.slice(1)}`;
  const structural: string[] = [];
  for (let row = 0; row < n; row++) for (let column = 0; column < n; column++) {
    if (!darkAt(row, column)) continue;
    const x = column + offset, y = row + offset;
    if (code.modules.isReserved(row, column)) structural.push(`M${x} ${y}h1v1h-1z`);
    else {
      const context = { x, y, row, column, random: randomAt(recipe.seed, row, column), darkAt };
      if (options.moduleRenderer) {
        const id = `cell-${n}-${border}-${row}-${column}`;
        clips.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="1" height="1"/></clipPath>`);
        paths.push(`<g clip-path="url(#${id})">${options.moduleRenderer(context)}</g>`);
      } else paths.push(moduleSVG(recipe.shape, context));
    }
  }
  const warnings: string[] = [];
  if (style.safety === 'experimental' || ['dots', 'diamond', 'weave', 'mosaic', 'circuit', 'petal', 'halftone'].includes(recipe.shape) || options.moduleRenderer) warnings.push('Experimental artwork: verify the exported code at its intended size and on real devices.');
  if (size / dimension < 4) warnings.push('Small modules at this export size. Increase the resolution or shorten the payload.');
  if (errorCorrection !== 'H') warnings.push('High error correction is recommended for styled codes.');
  const contrast = Math.min(contrastRatio(recipe.foreground, recipe.background), recipe.gradient ? contrastRatio(recipe.accent, recipe.background) : Infinity);
  // Each module gets its own clip. Custom artwork cannot paint neighboring light or structural cells.
  // Hooks are trusted code: scripts, external resources, and SVG filters are not sandboxed here.
  const dataArt = paths.join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${dimension} ${dimension}" role="img" aria-label="Stylized QR code"><title>${escapeXML(style.name)} QR code</title><desc>${escapeXML(options.text)}</desc><defs>${clips.join('')}<linearGradient id="${inkId}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${recipe.foreground}"/><stop offset="1" stop-color="${recipe.accent}"/></linearGradient></defs><rect width="${dimension}" height="${dimension}" fill="${recipe.background}"/>${texture(recipe, dimension)}${decoration(recipe, dimension)}<rect x="${border}" y="${border}" width="${n + 8}" height="${n + 8}" fill="${recipe.background}"/><g fill="${recipe.gradient ? `url(#${inkId})` : recipe.foreground}">${dataArt}</g><path d="${structural.join('')}" fill="${recipe.foreground}"/></svg>`;
  return { svg, recipe, style, size, moduleCount: n, version: code.version, contrast, warnings };
}
