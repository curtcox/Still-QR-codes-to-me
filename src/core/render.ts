import { materialModule, materialField, materialSurround } from './materials.js';
import QRCode from 'qrcode';
import { getPreset } from './presets.js';
import { animations, borders, effects, eyes, shapes, textures, materials, type GenerateOptions, type GeneratedQR, type ModuleContext, type Recipe } from './types.js';

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
  if (!materials.includes(recipe.material)) throw new Error('Unknown material.');
  if (!eyes.includes(recipe.eye) || !effects.includes(recipe.effect) || !animations.includes(recipe.animation)) throw new Error('Unknown finder eye, effect, or animation.');
  if (!Number.isFinite(recipe.detail) || recipe.detail < 0 || recipe.detail > 1) throw new Error('Material detail must be between 0 and 1.');
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
function moduleSVG(shape: Recipe['shape'], { x, y, row, column, random, darkAt }: ModuleContext, strokeInk: string): string {
  const rect = (dx = 0, dy = 0, w = 1, h = 1, radius = 0) => `<rect x="${x + dx}" y="${y + dy}" width="${w}" height="${h}" rx="${radius}"/>`;
  const circle = (r: number) => `<circle cx="${x + .5}" cy="${y + .5}" r="${r}"/>`;
  switch (shape) {
    // Independently drawn geometry; origins and deliberate differences are in docs/STYLE-RESEARCH-2.md.
    case 'gapped': return rect(.1, .1, .8, .8);
    case 'contour': {
      const north = darkAt(row - 1, column), south = darkAt(row + 1, column);
      const west = darkAt(row, column - 1), east = darkAt(row, column + 1);
      const a = !north && !west ? .38 : 0, b = !north && !east ? .38 : 0;
      const c = !south && !east ? .38 : 0, d = !south && !west ? .38 : 0;
      return `<path d="M${x + a} ${y}H${x + 1 - b}Q${x + 1} ${y} ${x + 1} ${y + b}V${y + 1 - c}Q${x + 1} ${y + 1} ${x + 1 - c} ${y + 1}H${x + d}Q${x} ${y + 1} ${x} ${y + 1 - d}V${y + a}Q${x} ${y} ${x + a} ${y}Z"/>`;
    }
    case 'horizontal-pill': return rect(.02, .1, .96, .8, .4) + (darkAt(row, column - 1) ? rect(0, .1, .5, .8) : '') + (darkAt(row, column + 1) ? rect(.5, .1, .5, .8) : '');
    case 'vertical-pill': return rect(.1, .02, .8, .96, .4) + (darkAt(row - 1, column) ? rect(.1, 0, .8, .5) : '') + (darkAt(row + 1, column) ? rect(.1, .5, .8, .5) : '');
    case 'diagonal': return `<path d="M${x + .23} ${y + .77}L${x + .77} ${y + .23}" fill="none" stroke="${strokeInk}" stroke-width=".56" stroke-linecap="round"/>`;
    case 'scribble': {
      const bend = .12 + random * .16;
      return `<path d="M${x + .22} ${y + .24}C${x + .9} ${y + bend} ${x + .1} ${y + 1 - bend} ${x + .78} ${y + .76}M${x + .25} ${y + .72}Q${x + .5} ${y + .28} ${x + .75} ${y + .3}" fill="none" stroke="${strokeInk}" stroke-width=".36" stroke-linecap="round"/>`;
    }
    case 'flower': return circle(.32) + [[.32,.32],[.68,.32],[.32,.68],[.68,.68]].map(([dx,dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r=".29"/>`).join('');
    case 'gridlet': return circle(.16) + [0,.49].flatMap(dy => [0,.49].map(dx => rect(.035 + dx, .035 + dy, .44, .44, .035))).join('');
    case 'arrow': return `<path d="M${x + .04} ${y + .22}H${x + .49}V${y + .03}L${x + .97} ${y + .5}L${x + .49} ${y + .97}V${y + .78}H${x + .04}Z"/>`;
    case 'wave': return `<path d="M${x + .03} ${y + .17}Q${x + .27} ${y + .02} ${x + .5} ${y + .17}T${x + .97} ${y + .17}V${y + .83}Q${x + .73} ${y + .98} ${x + .5} ${y + .83}T${x + .03} ${y + .83}Z"/>`;
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
    case 'classy': {
      const links = (darkAt(row, column + 1) ? rect(.5, .08, .5, .84) : '') + (darkAt(row, column - 1) ? rect(0, .08, .5, .84) : '') + (darkAt(row + 1, column) ? rect(.08, .5, .84, .5) : '') + (darkAt(row - 1, column) ? rect(.08, 0, .84, .5) : '');
      return circle(.42) + links;
    }
    case 'fluid': {
      const wobble = (random - .5) * .08;
      return `<path d="M${x + .5} ${y + .03}C${x + .83 + wobble} ${y + .02} ${x + .99} ${y + .25} ${x + .95} ${y + .52}C${x + 1.02} ${y + .82 + wobble} ${x + .75} ${y + .99} ${x + .49} ${y + .95}C${x + .18} ${y + 1.01} ${x + .01} ${y + .76} ${x + .05} ${y + .48}C${x - .01} ${y + .2 - wobble} ${x + .24} ${y + .01} ${x + .5} ${y + .03}Z"/>`;
    }
    case 'star': return `<path d="M${x + .5} ${y + .015}L${x + .615} ${y + .355}L${x + .975} ${y + .355}L${x + .685} ${y + .565}L${x + .795} ${y + .93}L${x + .5} ${y + .71}L${x + .205} ${y + .93}L${x + .315} ${y + .565}L${x + .025} ${y + .355}L${x + .385} ${y + .355}Z"/>`;
    case 'heart': return `<path d="M${x + .5} ${y + .94}C${x + .39} ${y + .79} ${x + .05} ${y + .6} ${x + .05} ${y + .31}C${x + .05} ${y + .03} ${x + .39} ${y - .01} ${x + .5} ${y + .21}C${x + .61} ${y - .01} ${x + .95} ${y + .03} ${x + .95} ${y + .31}C${x + .95} ${y + .6} ${x + .61} ${y + .79} ${x + .5} ${y + .94}Z"/>`;
    case 'cross': return rect(.34, .02, .32, .96, .07) + rect(.02, .34, .96, .32, .07);
    case 'hexagon': return `<path d="M${x + .25} ${y + .03}H${x + .75}L${x + .98} ${y + .5}L${x + .75} ${y + .97}H${x + .25}L${x + .02} ${y + .5}Z"/>`;
    case 'stitch': return `<g transform="rotate(45 ${x + .5} ${y + .5})">${rect(.37, .01, .26, .98, .05)}${rect(.01, .37, .98, .26, .05)}</g>`;
    case 'bead': return circle(.485) + `<circle cx="${x + .34}" cy="${y + .3}" r=".105" fill="white" opacity=".27"/>`;
    case 'cube': return `<path d="M${x + .5} ${y + .01}L${x + .99} ${y + .14}V${y + .86}L${x + .5} ${y + .99}L${x + .01} ${y + .86}V${y + .14}Z"/><path d="M${x + .5} ${y + .5}V${y + .99}M${x + .5} ${y + .5}L${x + .01} ${y + .14}M${x + .5} ${y + .5}L${x + .99} ${y + .14}" fill="none" stroke="white" stroke-width=".05" opacity=".3"/>`;
  }
}
function finderSVG(eye: Recipe['eye'], x: number, y: number, foreground: string, background: string): string {
  if (eye === 'dots') return `<circle cx="${x + 3.5}" cy="${y + 3.5}" r="3.5" fill="${foreground}"/><circle cx="${x + 3.5}" cy="${y + 3.5}" r="2.5" fill="${background}"/><circle cx="${x + 3.5}" cy="${y + 3.5}" r="1.5" fill="${foreground}"/>`;
  if (eye === 'diamond') return `<path d="M${x + 3.5} ${y}L${x + 7} ${y + 3.5}L${x + 3.5} ${y + 7}L${x} ${y + 3.5}Z" fill="${foreground}"/><path d="M${x + 3.5} ${y + 1}L${x + 6} ${y + 3.5}L${x + 3.5} ${y + 6}L${x + 1} ${y + 3.5}Z" fill="${background}"/><path d="M${x + 3.5} ${y + 2}L${x + 5} ${y + 3.5}L${x + 3.5} ${y + 5}L${x + 2} ${y + 3.5}Z" fill="${foreground}"/>`;
  const radius = eye === 'rounded' ? 1.15 : 0;
  return `<rect x="${x}" y="${y}" width="7" height="7" rx="${radius}" fill="${foreground}"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${radius * .65}" fill="${background}"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${radius * .55}" fill="${foreground}"/>`;
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
  const border = recipe.material !== 'none' ? 6 : recipe.border === 'none' && recipe.texture === 'none' ? 0 : 4;
  const offset = border + 4, dimension = n + offset * 2;
  const darkAt = (row: number, column: number) => row >= 0 && column >= 0 && row < n && column < n && !!code.modules.get(row, column);
  const paths: string[] = [];
  const clips: string[] = [];
  const inkId = `ink-${recipe.foreground.slice(1)}-${recipe.accent.slice(1)}`;
  const structural: string[] = [];
  const finder: string[] = [
    finderSVG(recipe.eye, offset, offset, recipe.foreground, recipe.background),
    finderSVG(recipe.eye, offset + n - 7, offset, recipe.foreground, recipe.background),
    finderSVG(recipe.eye, offset, offset + n - 7, recipe.foreground, recipe.background),
  ];
  const dataCells: string[] = [];
  const payloadHash = Array.from(options.text).reduce((hash, char) => Math.imul(hash ^ char.codePointAt(0)!, 16777619) >>> 0, 2166136261);
  const materialId = `mat-${recipe.material}-${n}-${border}-${recipe.seed}-${payloadHash}-${errorCorrection}-${code.maskPattern}`;
  for (let row = 0; row < n; row++) for (let column = 0; column < n; column++) {
    if (!darkAt(row, column)) continue;
    const x = column + offset, y = row + offset;
    if (code.modules.isReserved(row, column)) {
      const inFinder = (row < 7 && column < 7) || (row < 7 && column >= n - 7) || (row >= n - 7 && column < 7);
      if (!inFinder) structural.push(`M${x} ${y}h1v1h-1z`);
    }
    else {
      dataCells.push(`M${x} ${y}h1v1h-1z`);
      const context = { x, y, row, column, random: randomAt(recipe.seed, row, column), darkAt };
      if (options.moduleRenderer) {
        const id = `cell-${n}-${border}-${row}-${column}`;
        clips.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="1" height="1"/></clipPath>`);
        paths.push(`<g clip-path="url(#${id})">${options.moduleRenderer(context)}</g>`);
      } else paths.push(recipe.material === 'none' ? moduleSVG(recipe.shape, context, recipe.gradient ? `url(#${inkId})` : recipe.foreground) : materialModule(recipe.material, context, recipe.detail));
    }
  }
  const warnings: string[] = [];
  if (recipe.material !== 'none' || style.safety === 'experimental' || recipe.eye !== 'square' || recipe.effect !== 'none' || recipe.animation !== 'none' || !['square', 'rounded', 'squircle', 'horizontal', 'vertical'].includes(recipe.shape) || options.moduleRenderer) warnings.push('Experimental artwork: verify the exported code at its intended size and on real devices.');
  if (size / dimension < 4) warnings.push('Small modules at this export size. Increase the resolution or shorten the payload.');
  if (errorCorrection !== 'H') warnings.push('High error correction is recommended for styled codes.');
  const contrast = Math.min(contrastRatio(recipe.foreground, recipe.background), recipe.gradient ? contrastRatio(recipe.accent, recipe.background) : Infinity);
  // Each module gets its own clip. Custom artwork cannot paint neighboring light or structural cells.
  // Hooks are trusted code: scripts, external resources, and SVG filters are not sandboxed here.
  const dataArt = paths.join('');
  const continuous = ['oak', 'ripples', 'ice'].includes(recipe.material)
    ? `<g clip-path="url(#${materialId})" color="white" opacity="${recipe.detail * .2}">${materialField(recipe.material, dimension, recipe.seed)}</g>` : '';
  clips.push(`<clipPath id="${materialId}"><path d="${dataCells.join('')}"/></clipPath>`);
  const gradientMotion = recipe.animation === 'sweep' ? '<animate attributeName="x1" values="-1;1;-1" dur="3.8s" repeatCount="indefinite"/><animate attributeName="x2" values="0;2;0" dur="3.8s" repeatCount="indefinite"/>' : '';
  const filterDefs = recipe.effect === 'neon' ? `<filter id="fx-${inkId}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation=".16" result="glow"/><feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : recipe.effect === 'shadow' ? `<filter id="fx-${inkId}" x="-20%" y="-20%" width="150%" height="150%"><feDropShadow dx=".12" dy=".16" stdDeviation=".08" flood-color="${recipe.accent}" flood-opacity=".5"/></filter>` : '';
  const baseInk = `<g color="${recipe.foreground}" fill="${recipe.gradient ? `url(#${inkId})` : recipe.foreground}">${dataArt}</g>${continuous}<path d="${structural.join('')}" fill="${recipe.foreground}"/><g fill="${recipe.foreground}">${finder.join('')}</g>`;
  const depth = recipe.effect === 'extrude' ? `<g fill="${recipe.accent}" color="${recipe.accent}" opacity=".4" transform="translate(.11 .11)">${dataArt}<path d="${structural.join('')}"/>${finder.join('')}</g>` : recipe.effect === 'emboss' ? `<g fill="white" color="white" opacity=".28" transform="translate(-.07 -.07)">${dataArt}${finder.join('')}</g><g fill="${recipe.accent}" color="${recipe.accent}" opacity=".35" transform="translate(.07 .07)">${dataArt}${finder.join('')}</g>` : '';
  const filteredInk = recipe.effect === 'neon' || recipe.effect === 'shadow' ? `<g filter="url(#fx-${inkId})">${baseInk}</g>` : baseInk;
  const animatedInk = recipe.animation === 'pulse' ? `<g>${filteredInk}<animate attributeName="opacity" values="1;.88;1" dur="2.4s" repeatCount="indefinite"/></g>` : filteredInk;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${dimension} ${dimension}" role="img" aria-label="Stylized QR code"><title>${escapeXML(style.name)} QR code</title><desc>${escapeXML(options.text)}</desc><defs>${clips.join('')}<linearGradient id="${inkId}" x1="0" y1="0" x2="1" y2="1">${gradientMotion}<stop stop-color="${recipe.foreground}"/><stop offset="1" stop-color="${recipe.accent}"/></linearGradient>${filterDefs}</defs><rect width="${dimension}" height="${dimension}" fill="${recipe.background}"/>${texture(recipe, dimension)}${decoration(recipe, dimension)}${materialSurround(recipe, dimension)}<rect x="${border}" y="${border}" width="${n + 8}" height="${n + 8}" fill="${recipe.background}"/>${depth}${animatedInk}</svg>`;
  return { svg, recipe, style, size, moduleCount: n, version: code.version, contrast, warnings };
}
