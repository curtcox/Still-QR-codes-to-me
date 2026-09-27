import type { Material, ModuleContext, Recipe } from './types.js';

/** Stable coordinate noise. Materials have no external assets or random global state. */
export function noise(seed: number, a: number, b: number): number {
  let n = (seed ^ Math.imul(a + 1, 374761393) ^ Math.imul(b + 1, 668265263)) >>> 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
const f = (value: number) => Number(value.toFixed(3));
const line = (d: string, width = .04, opacity = .25) => `<path d="${d}" fill="none" stroke="white" stroke-width="${width}" opacity="${opacity}"/>`;

/** Recognizable silhouettes and interior detail, not palette aliases. All art is cell-local. */
export function materialModule(material: Material, c: ModuleContext, detail: number): string {
  const { x, y, random, row, column, darkAt } = c;
  let art = '';
  const shine = .12 + detail * .19;
  switch (material) {
    case 'none': return '';
    case 'bamboo': {
      const top = darkAt(row - 1, column), bottom = darkAt(row + 1, column);
      art = `<rect x=".07" y="${top ? 0 : .02}" width=".86" height="${top && bottom ? 1 : .98}" rx=".12"/>`;
      for (let k = 0; k < 5; k++) art += line(`M${f(.15 + k * .15)} .03Q${f(.12 + k * .15)} .5 ${f(.16 + k * .15)} .98`, .027, shine * (k % 2 ? .4 : 1));
      if (row % 3 === column % 3 || !bottom) art += `<path d="M.07 .81Q.5 .91 .93 .81" stroke="black" opacity=".45" fill="none" stroke-width=".1"/>` + line('M.08 .78Q.5 .88 .92 .78', .045, shine);
      break;
    }
    case 'oak':
      art = '<rect width="1" height="1" rx=".05"/>';
      for (let k = 0; k < 5; k++) { const u = f(.1 + k * .19), wave = f(.03 + random * .12); art += line(`M${u} 0C${f(u + wave)} .3 ${f(u - wave)} .6 ${u} 1`, .025, shine); }
      if (random > .7) art += `<ellipse cx=".5" cy=".5" rx=".16" ry=".34" stroke="black" opacity=".3" stroke-width=".05" fill="none"/>`;
      break;
    case 'beans':
      art = `<g transform="rotate(${f((random - .5) * 70)} .5 .5)"><path d="M.48 .025C.1 .015 .02 .26 .045 .59C.08 .96 .35 1 .64 .96C.95 .91 1 .63 .955 .35C.92 .09 .72 .025 .48 .025Z"/><path d="M.57 .08C.28 .3 .76 .62 .42 .92" fill="none" stroke="black" stroke-width=".055" opacity=".6"/>${line('M.28 .14Q.12 .3 .17 .55', .06, shine)}</g>`;
      break;
    case 'ants':
      art = `<g transform="rotate(${(row + column) % 2 ? 90 : 0} .5 .5)"><path d="M.36 .36L.14 .19L.04 .28M.36 .47L.12 .43L.025 .54M.38 .57L.17 .7L.07 .86M.64 .36L.86 .19L.96 .28M.64 .47L.88 .43L.975 .54M.62 .57L.83 .7L.93 .86M.39 .17L.29 .03M.61 .17L.71 .03" stroke="currentColor" stroke-width=".085" fill="none" stroke-linecap="round"/><ellipse cx=".5" cy=".24" rx=".245" ry=".205"/><ellipse cx=".5" cy=".46" rx=".26" ry=".2"/><ellipse cx=".5" cy=".74" rx=".32" ry=".25"/>${line('M.38 .63Q.31 .77 .41 .87', .045, shine)}</g>`;
      break;
    case 'fire':
      art = `<path d="M.08 .96Q-.02 .58 .22 .27Q.18 .52 .39 .5Q.39 .17 .62 .01Q.52 .33 .79 .43Q1.04 .65 .92 .97Z"/>${line('M.28 .85Q.13 .65 .4 .57Q.49 .45 .52 .27', .075, shine * 1.25)}${line('M.7 .87Q.91 .68 .69 .56', .07, shine)}`;
      break;
    case 'ice':
      art = `<path d="M.13 .025L.77 .01L.98 .22L.94 .87L.7 .99L.03 .92L.01 .32Z"/><path d="M.13 .03L.47 .36L.03 .92M.47 .36L.77 .01M.47 .36L.7 .99M.47 .36L.94 .87" stroke="white" stroke-width=".045" opacity="${shine}" fill="none"/><path d="M.13 .03L.47 .36L.77 .01Z" fill="white" opacity="${shine * .4}"/>`;
      break;
    case 'clouds':
      art = `<path d="M.13 .92C-.05 .88 -.04 .6 .08 .51C-.03 .29 .18 .13 .34 .23C.35 -.03 .7 -.02 .76 .21C1 .12 1.07 .5 .88 .57C1.1 .79 .89 1.02 .71 .94Z"/>${line('M.12 .52Q.27 .41 .39 .54M.4 .25Q.59 .12 .69 .32M.67 .63Q.89 .54 .9 .75', .065, shine)}`;
      break;
    case 'ripples':
      art = '<rect width="1" height="1" rx=".12"/>';
      for (let k = 0; k < 4; k++) art += line(`M0 ${f(k * .27 + .05)}Q.5 ${f(k * .27 + .27)} 1 ${f(k * .27 + .05)}`, .043, shine);
      break;
    case 'leaves':
      art = `<g transform="rotate(${(row + column) % 2 ? 90 : 0} .5 .5)"><path d="M.015 .02C.68 -.03 1.045 .18 .975 .98C.27 1.045 -.03 .68 .015 .02Z"/>${line('M.09 .1L.89 .9M.32 .33L.32 .1M.48 .49L.52 .18M.66 .67L.79 .35M.32 .33L.1 .34M.48 .49L.2 .56M.66 .67L.37 .8', .028, shine * 1.2)}</g>`;
      break;
  }
  return `<g transform="translate(${x} ${y})" color="inherit">${art}</g>`;
}

/** A continuous material field. The renderer clips it separately to dark data and the surround. */
export function materialField(material: Material, size: number, seed: number, surroundOnly = false): string {
  let art = '';
  switch (material) {
    case 'oak':
      for (let i = 0; i < size * 4; i++) {
        const x = i * .28;
        art += `<path d="M${f(x)} 0C${f(x + 4 * Math.sin(i))} ${f(size * .32)} ${f(x - 3 * Math.cos(i))} ${f(size * .69)} ${f(x)} ${size}"/>`;
      }
      for (const [x, y] of [[size * .29, size * .38], [size * .73, size * .71]]) for (let r = .4; r < 4; r += .4) art += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r * .52)}" ry="${f(r)}"/>`;
      return `<g fill="none" stroke="currentColor" stroke-width=".055">${art}</g>`;
    case 'ripples':
      for (let p = 0; p < 5; p++) for (let r = .5; r < size * .6; r += 1.1) art += `<ellipse cx="${f(noise(seed, p, 1) * size)}" cy="${f(noise(seed, p, 2) * size)}" rx="${f(r)}" ry="${f(r * .65)}"/>`;
      return `<g fill="none" stroke="currentColor" stroke-width=".09">${art}</g>`;
    case 'ice':
      for (let p = 0; p < 75; p++) { const x = noise(seed, p, 1) * size, y = noise(seed, p, 2) * size; art += `<path d="M${f(x)} ${f(y)}l2 -3l-1 -2m1 2l3 1m-5 2l-3 4"/>`; }
      return `<g fill="none" stroke="currentColor" stroke-width=".08">${art}</g>`;
    default:
      for (let row = 0; row < size; row += 2.4) for (let col = 0; col < size; col += 2.4) {
        if (surroundOnly && row >= 6 && col >= 6 && row + 2.4 <= size - 6 && col + 2.4 <= size - 6) continue;
        const random = noise(seed, Math.round(row * 10), Math.round(col * 10));
        art += `<g transform="translate(${f(col)} ${f(row)}) scale(2.4)">${materialModule(material, { x: 0, y: 0, row: Math.round(row), column: Math.round(col), random, darkAt: () => false }, .9)}</g>`;
      }
      return art;
  }
}
export function materialSurround(recipe: Recipe, dimension: number): string {
  if (recipe.material === 'none') return '';
  return `<g fill="${recipe.accent}" color="${recipe.accent}" opacity=".6">${materialField(recipe.material, dimension, recipe.seed, true)}</g>`;
}
