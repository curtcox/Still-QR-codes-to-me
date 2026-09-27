import { filmStyles, type Recipe, type StylePreset } from './types.js';

// Original, unlettered illustrations following examples/film/BRIEF.md. No logos or borrowed artwork.
const pink = ['#681f48', '#fff4fa', '#bd517f'];
const gold = ['#59400b', '#fff9df', '#b48823'];
const sea = ['#124457', '#f2fcff', '#3f8ca2'];
const slate = ['#303940', '#f5f8fa', '#82949f'];
const palettes: Record<string, string[]> = {
  bat: ['#352744', '#fbf4ff', '#786289'], 'beauty-mark': pink, gills: pink,
  blueprint: ['#123c78', '#f1f8ff', '#346ea8'], 'chrome-red-eye': slate,
  'cube-lattice': ['#233b30', '#f4fbf5', '#648675'], 'field-radio': ['#17483e', '#fff7e4', '#419988'],
  flame: ['#722815', '#fff8ec', '#d16623'], 'gold-android': ['#302800', '#fff9df', '#b48823'], 'gold-scales': gold,
  grass: ['#24421d', '#faffef', '#73964c'], honeycomb: gold,
  'lobster-shell': ['#662b29', '#fff6ee', '#b3644b'], claw: ['#662b29', '#fff6ee', '#b3644b'],
  ocean: sea, 'song-waves': sea, pulp: ['#513a20', '#fff7dd', '#b67732'],
};
const shapeMap: Record<string, Recipe['shape']> = {
  circuit: 'circuit', honeycomb: 'hexagon', feathers: 'feather', grass: 'grass-blade',
  'gold-scales': 'fish-scale', 'paw-prints': 'paw', 'lobster-shell': 'shell',
  hashchain: 'classy', 'cube-lattice': 'gapped', ocean: 'wave', 'song-waves': 'wave',
};
export function makeFilmPresets(base: Recipe): StylePreset[] {
  return filmStyles.map(id => {
    const [foreground, background, accent] = palettes[id] ?? slate;
    return { id, name: id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      description: `Unlettered ${id.replaceAll('-', ' ')} scenery outside a protected four-module quiet zone.`,
      inspiration: 'Frog or Axolotl · film collection', safety: 'experimental',
      recipe: { ...base, foreground, background, accent, border: `film-${id}`, shape: shapeMap[id] ?? 'square',
        material: 'none', texture: 'none', gradient: false, effect: 'none', animation: 'none', eye: id === 'enigma' ? 'dots' : 'square' } };
  });
}

/** Scene units are QR modules. Every prop is clipped to the 8-module outside band. */
export function filmScene(id: string, size: number, recipe: Recipe): string {
  const s = size, m = s / 2, a = recipe.accent, ink = recipe.foreground;
  const path = (d: string, fill = 'none', stroke = a, width = .3) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const rect = (x: number, y: number, w: number, h: number, fill = 'none', r = .2) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${a}" stroke-width=".25"/>`;
  const circle = (x: number, y: number, r: number, fill = a) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${ink}" stroke-width=".15"/>`;
  const at = (art: string, x = m, y = 4, angle = 0) => `<g transform="translate(${x} ${y}) rotate(${angle})">${art}</g>`;
  const sides = (art: string) => [0, 90, 180, 270].map(angle => `<g transform="rotate(${angle} ${m} ${m})">${art}</g>`).join('');
  const ticks = (step = 3) => Array.from({ length: Math.floor((s - 16) / step) }, (_, i) => 9 + i * step);
  const rim = rect(2, 2, s - 4, s - 4) + rect(6.8, 6.8, s - 13.6, s - 13.6);
  const waves = (count = 3) => Array.from({ length: count }, (_, i) => path(`M8 ${2 + i * 1.5}Q${m / 2} ${i * 1.5} ${m} ${2 + i * 1.5}T${s - 8} ${2 + i * 1.5}`)).join('');
  const mic = rect(-1.25, -2.5, 2.5, 3.5, ink, 1.2) + path('M-2 -1V.6Q-2 2 0 2Q2 2 2 .6V-1M0 2V3M-1.5 3H1.5') + [-1.5,-.8,0].map(y => path(`M-.8 ${y}H.8`, 'none', '#ffffff', .12)).join('');
  let art = '';
  switch (id) {
    case 'bat': art = sides(waves(2)) + at(path('M-6 -2Q-3 -1 -1 1L0 -1L1 1Q3 -1 6 -2L5 2Q3 0 2 2Q1 1 0 3Q-1 1 -2 2Q-3 0 -5 2Z', ink)); break;
    case 'beauty-mark': art = sides(path(`M2 9Q7 ${m} 2 ${s-9}L5 ${s-9}Q8 ${m} 5 9Z`, '#ffffff')) + at(path('M-1 -3L0 -1L1 -3L2 0L1 1Q3 2 5 3Q0 4 -5 3Q-3 2 -1 1L-2 0Z', '#ffffff', a)) + circle(s-4, 12, .8, ink); break;
    case 'blueprint': art = sides(path(`M8 4H${s-8}M8 2V6M${s-8} 2V6M8 4l2 -1m-2 1l2 1M${s-8} 4l-2 -1m2 1l-2 1`) + ticks().map(x => path(`M${x} 6v1`, 'none', a, .12)).join('')); break;
    case 'boxing-ring': art = [2.5,4,5.5].map(v => rect(v,v,s-2*v,s-2*v)).join('') + [3,s-3].flatMap(x => [3,s-3].map(y => rect(x-1,y-1,2,2,ink))).join(''); break;
    case 'butterfly': {
      let x=.1,y=0,z=0; const points: [number,number][]=[];
      for(let i=0;i<1700;i++){const dx=10*(y-x),dy=x*(28-z)-y,dz=x*y-8*z/3;x+=dx*.008;y+=dy*.008;z+=dz*.008;if(i>100)points.push([x,z]);}
      art = at(path(points.map(([u,v],i)=>`${i?'L':'M'}${u*.36} ${v*.12-3}`).join(' '),'none',ink,.16)) + sides(waves(1)); break;
    }
    case 'calendar': art = rim + ticks(4).map(x=>at(rect(-.45,-2,.9,4,ink,.45),x,3)).join('') + sides(ticks(4).map(x=>rect(x, s-6,3,3)).join('')); break;
    case 'car-wash': art = [4,s-4].map(x=>rect(x-2,9,4,s-18,ink,1)+ticks(1).map(y=>path(`M${x-2.5} ${y}h5`)).join('')).join('') + ticks(3).map((x,i)=>circle(x,3+i%2,.7,'#ffffff')).join(''); break;
    case 'chrome-red-eye': art = [1.5,2.5,4,5.5,6.5].map((v,i)=>rect(v,v,s-v*2,s-v*2,['#eef2f4','#929fa5','#414b52','#b3bdc2','#eef2f4'][i])).join('') + at(path('M-4 0Q0 -3 4 0Q0 3 -4 0Z','#232d35')+circle(0,0,1,'#b50022')); break;
    case 'circuit': art = sides(ticks(4).map(x=>path(`M${x} 7V4h2V2`)+circle(x+2,2,.35)).join('')) + at(rect(-2,-2,4,4,ink)+[-2,-1,0,1,2].map(x=>path(`M${x} -3v1M${x} 2v1`)).join('')); break;
    case 'claw': art = rim + at(path('M-1 3Q-4 0 -3 -3L0 -1L1 -4Q5 -2 3 1L1 2L1 4Z',a,ink),s-5,5,-30); break;
    case 'compass': art = sides(at(path('M0 -3L2 2L0 1L-2 2Z',ink)+path('M0 -3V2'),m,4)); break;
    case 'cube-lattice': art = sides(ticks(4).map(x=>at(path('M0 -2L2 -1V1L0 2L-2 1V-1ZM-2 -1L0 0L2 -1M0 0V2',a,ink),x,4)).join('')); break;
    case 'dial': art = rim + at(path('M-5 2A5 5 0 0 1 5 2M-4 1l1 .3M-3 -1l.5 .7M0 -3v1M3 -1l-.5 .7M4 1l-1 .3M0 2L2 -1')+circle(0,2,.4,ink)); break;
    case 'door': art = rect(1,1,s-2,s-2, a)+rect(3,3,s-6,s-6,recipe.background)+[3,s-6].flatMap(x=>[10,m,s-16].map(y=>rect(x,y,3,6))).join('')+circle(s-4,m, .65,gold[2]); break;
    case 'egg': art = sides(ticks(2).map(x=>path(`M${x} 2q-1 2 0 4`)).join('')) + at(path('M0 -3C-3 -1 -3 3 0 3C3 3 3 -1 0 -3Z',a,ink)+path('M-1 -1L0 0L-.5 1L.5 2')); break;
    case 'electron-shells': art = sides([0,1,2].map(i=>path(`M8 ${2+i*1.6}Q${m} ${-1+i*1.6} ${s-8} ${2+i*1.6}`)+circle(m+(i-1)*8,1.5+i*1.6,.5,ink)).join('')); break;
    case 'enigma': art = sides(ticks(6).map(x=>at(circle(0,0,2.4,'none')+circle(0,0,1.6,'none')+Array.from({length:12},(_,i)=>path(`M${Math.cos(i*Math.PI/6)*1.9} ${Math.sin(i*Math.PI/6)*1.9}l${Math.cos(i*Math.PI/6)*.5} ${Math.sin(i*Math.PI/6)*.5}`)).join(''),x,4)).join('')); break;
    case 'feathers': art = rim + at(path('M-1 3Q-3 0 -1 -2Q1 -4 2 -1L3 0L1 0Q1 2 -1 3L-3 4L-2 1',a,ink)+circle(.5,-1.7,.18,ink),s-5,5) + sides(ticks(5).map(x=>at(path('M-1 2Q-3 -2 1 -2Q3 1 -1 2M-1 2L1 -2'),x,4)).join('')); break;
    case 'field-radio': art = rect(1,1,s-2,s-2,'#ccd4cc',2)+rect(5.5,5.5,s-11,s-11,recipe.background)+path('M4 12V1L7 .5')+[m-3,m,m+3].map(x=>circle(x,s-4,.9,ink)).join('')+ticks(1).map(y=>path(`M2 ${y}h2`)).join(''); break;
    case 'filing-drawers': art = sides(ticks(6).map(x=>rect(x,1.5,5,5)+rect(x+1.5,3,2,.8,ink)).join('')); break;
    case 'flame': art = sides(ticks(3).map(x=>at(path('M-1 3Q-3 0 0 -3Q0 -1 1 0L2 -1Q4 3 -1 3Z',a,ink),x,4)).join('')); break;
    case 'gills': art = [4,s-4].map((x,j)=>ticks(5).map(y=>at(path('M0 2V-2M0 0L-2 -2M0 0L2 -2M0 1L-2 0M0 1L2 0','none',a,.5),x,y,j?90:-90)).join('')).join('')+at(path('M-4 1Q0 -2 4 1M-2 1v.1M2 1v.1')); break;
    case 'goalposts': art = path(`M3 ${s-2}V3H${s-3}V${s-2}M1 ${s-3}h5M${s-6} ${s-3}h5`,'none',ink,.9)+path(`M5 6H${s-5}`); break;
    case 'gold-android': art = rim + at(path('M-4 0Q0 -3 4 0Q0 3 -4 0Z','#d6b349',ink)+circle(0,0,1,'#fff26b')+circle(0,0,.45,ink)); break;
    case 'gold-scales': art = sides(ticks(2.5).map(x=>path(`M${x-1.3} 2Q${x} 7 ${x+1.3} 2`,a,ink)).join('')); break;
    case 'grass': art = sides(ticks(1.3).map((x,i)=>path(`M${x} 7Q${x-2} 4 ${x-1} 1Q${x+.5} 4 ${x+.3} 7Q${x+2} 4 ${x+1.5} ${2+i%2}Z`,a,ink,.1)).join('')); break;
    case 'hashchain': art = sides(ticks(4).map(x=>at(rect(-2,-1,3,2,'none',1)+rect(0,-1,3,2,'none',1),x,4)).join('')); break;
    case 'honeycomb': art = sides(ticks(3.5).map(x=>at(path('M-1 -2H1L2 0L1 2H-1L-2 0Z',a,ink),x,4)).join('')); break;
    case 'lobster-shell': art = sides(ticks(3).map(x=>at(path('M-1 -2Q2 -3 2 0Q2 3 -1 2L0 0Z',a,ink),x,4)).join('')); break;
    case 'mask': art = sides(ticks(1.8).map((x,i)=>rect(x,2,1.6,i%3?3:5,i%3?ink:recipe.background)).join(''))+at(path('M-2 -2Q0 -3 2 -2V1Q0 4 -2 1Z',recipe.background,ink)+path('M-1 -.5h.4M.6 -.5h.4M-1 1Q0 2 1 1'),s-5,5,-20); break;
    case 'maze': art = sides(ticks(6).map(x=>path(`M${x} 1v5h4V3h-2M${x+5} 1v6`)).join('')); break;
    case 'mic': art = rim + at(mic); break;
    case 'two-mics': art = rim + at(mic,m-4,4,-20)+at(mic,m+4,4,20); break;
    case 'mirror': art = rect(1.5,1.5,s-3,s-3,'#b9c6c9',3)+rect(3,3,s-6,s-6,recipe.background,2)+rect(6,6,s-12,s-12)+at(path('M0 -3V3M-3 0H3M-2 -2L2 2M-2 2L2 -2','none','#ffffff',.5),4,5); break;
    case 'ocean': art = sides(waves(4)); break;
    case 'oom-bars': art = sides(ticks(6).map(x=>[1,2,3,4].map((h,i)=>rect(x+i,7-h, .7,h,a,0)).join('')).join('')); break;
    case 'paw-prints': art = sides(ticks(5).map(x=>at(circle(0,1,1,a)+[-1.3,-.45,.45,1.3].map((u,i)=>circle(u,-.5-Math.sin(i/3*Math.PI)*.5,.45,ink)).join(''),x,4)).join('')); break;
    case 'pulp': art = rim + at(path('M0 -3Q3 -1 1 2L2 3L0 2L-2 3L-1 2Q-3 -1 0 -3Z',a,ink)+circle(0,-.5,.6,recipe.background)+path('M-.5 2L0 4L.5 2',gold[2],ink),m,4,45); break;
    case 'rulebook': art = rect(1,1,s-2,s-2,a)+rect(3,2,s-5,s-4,recipe.background)+path(`M5 2V${s-2}`)+sides(ticks(3).map(x=>path(`M${x} 4h2M${x} 5h1`)).join('')); break;
    case 'signpost': art = rim+at(path('M0 -3V3M-3 -2H2L3 -1L2 0H-3ZM3 1H-2L-3 2L-2 3H3Z',a,ink)); break;
    case 'song-waves': art = sides(ticks(5).map(x=>at(path('M-1 -1Q1 0 -1 1M0 -2Q3 0 0 2M1 -3Q5 0 1 3'),x,4)).join('')); break;
    case 'staircase': art = sides(ticks(6).map(x=>path(`M${x} 6h1V5h1V4h1V3h1V2h1`, 'none', ink,.6)).join('')); break;
    case 'switchboard': art = rim+sides(ticks(6).map(x=>circle(x,2,.55,ink)+circle(x+3,5,.55,ink)+path(`M${x} 2C${x-2} 7 ${x+5} 0 ${x+3} 5`)).join('')); break;
    case 'tentacles': art = sides(ticks(5).map(x=>path(`M${x} 7Q${x-4} 2 ${x} 1Q${x+3} 1 ${x+1} 3`,'none',a,1)).join(''))+at(circle(0,0,2.4,'#ffe888')+circle(-.8,-.5,.2,ink)+circle(.8,-.5,.2,ink)+path('M-1 1Q0 2 1 1','none',ink)); break;
    case 'thermometer': art = rim+at(rect(-.6,-3,1.2,4,'#ffffff',.6)+circle(0,1.5,1.2,'#ab2534')+path('M0 1V-2','none','#ab2534',.5)+path('M1 -2h1M1 -1h.7M1 0h1'),s-4,m); break;
    case 'tv': art = rect(1,2,s-2,s-4,a,3)+rect(5,6,s-10,s-12,recipe.background,2)+path(`M${m-4} .5L${m} 3L${m+4} .5`)+circle(s-3,m-2,.8,ink)+circle(s-3,m+2,.8,ink); break;
    case 'winged-sandal': art = rim+at(path('M-3 2Q0 1 3 2L3 3H-3ZM-1 2L0 -1L1 2M0 0Q-4 0 -4 -3L-2 -2L-2 -3L0 -1Q2 -4 4 -3L3 -1L1 1',a,ink)); break;
    default: throw new Error(`Unknown film scenery: ${id}`);
  }
  // A hard clip prevents even stroke edges entering the quiet zone.
  return `<svg x="0" y="0" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}"><defs><clipPath id="film-band-${id}-${s}"><path clip-rule="evenodd" d="M0 0H${s}V${s}H0Z M8 8V${s-8}H${s-8}V8Z"/></clipPath></defs><g clip-path="url(#film-band-${id}-${s})">${art}</g></svg>`;
}
