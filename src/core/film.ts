import { filmStyles, type Recipe, type StylePreset } from './types.js';

// Original, unlettered illustrations following examples/film/BRIEF.md. No logos or borrowed artwork.
const pink = ['#681f48', '#fff4fa', '#bd517f'];
const gold = ['#59400b', '#fff9df', '#b48823'];
const sea = ['#124457', '#f2fcff', '#3f8ca2'];
const slate = ['#30312f', '#F3EBDC', '#a8764f'];
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
    const [foreground, , accent] = palettes[id] ?? slate;
    const background = ['gills', 'beauty-mark'].includes(id) ? '#f8e9e8' : '#F3EBDC';
    return { id, name: id.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' '),
      description: `Painted hero ${id.replaceAll('-', ' ')} scenery outside a protected four-module quiet zone.`,
      inspiration: 'Frog or Axolotl · film collection', safety: 'experimental',
      recipe: { ...base, foreground, background, accent, border: `film-${id}`, shape: shapeMap[id] ?? 'square',
        material: 'none', texture: 'none', gradient: false, effect: 'none', animation: 'none', eye: id === 'enigma' ? 'dots' : 'square' } };
  });
}

export interface FilmExtent { top: number; right: number; bottom: number; left: number; }
const wrapStyles = new Set(['egg', 'mirror', 'tv', 'boxing-ring', 'goalposts', 'rulebook', 'blueprint', 'calendar', 'field-radio', 'filing-drawers', 'maze']);
const sideStyles = new Set(['mic','two-mics','thermometer','winged-sandal','claw','beauty-mark','door','staircase','oom-bars','switchboard','car-wash','signpost','feathers','grass','lobster-shell','gold-android','chrome-red-eye']);
/** Square export, asymmetric plate placement: both pairs of extents sum to 16 (28 for enclosing props). */
export function filmExtent(id: string): FilmExtent {
  if (wrapStyles.has(id)) return { top: 14, right: 14, bottom: 14, left: 14 };
  if (sideStyles.has(id)) return { top: 8, right: 14, bottom: 8, left: 2 };
  return { top: 14, right: 8, bottom: 2, left: 8 };
}

/** Flat gouache-like blocks, darker outlines and a single shade plane; no gradients or borrowed assets. */
export function filmScene(id: string, size: number, recipe: Recipe, extent: FilmExtent): string {
  const paper = recipe.background, edge = '#493c35', shade = '#976447', cream = '#f7e5bd';
  const red = '#ca6f50', blue = '#65979b', green = '#829768', gold = '#d2a451';
  const P = (d: string, fill = red, stroke = edge, sw = 2.4) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const R = (x:number,y:number,w:number,h:number,fill=cream,r=4) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${edge}" stroke-width="2.4"/>`;
  const C = (x:number,y:number,r:number,fill=gold) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${edge}" stroke-width="2.4"/>`;
  const E = (x:number,y:number,rx:number,ry:number,fill=cream) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${edge}" stroke-width="2.4"/>`;
  const L = (d:string, color=edge, width=3) => P(d,'none',color,width);
  const G = (art:string, transform:string) => `<g transform="${transform}">${art}</g>`;
  const plate = size - extent.left - extent.right;
  const box = { x: extent.left, y: extent.top, width: plate, height: plate };
  const place = (art:string,x:number,y:number,w:number,h:number,vw=100,vh=100) => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${vw} ${vh}" preserveAspectRatio="xMidYMid meet">${art}</svg>`;
  const side = (art:string,vh=240) => place(art, size-13.5, extent.top-3,13,plate+6,100,vh);
  const top = (art:string,vw=200) => place(art, extent.left+2, .5,plate-4,13, vw,100);
  const whole = (art:string) => place(art,.5,.5,size-1,size-1);
  // A studio microphone with a yoke, grille, substantial foot and cable. Reused as a paired single composition.
  const microphone = R(26,8,48,104,blue,22)+P('M56 10Q74 14 74 36V90Q74 109 55 112V10', '#456568')+
    [26,39,52,65,78,91].map(y=>L(`M34 ${y}H65`,cream,4)).join('')+
    L('M16 68V107Q16 133 50 133Q84 133 84 107V68',edge,9)+L('M50 135V211',edge,9)+
    E(50,222,39,10,shade)+L('M60 225Q94 217 90 238',edge,4);
  let art='';
  switch(id) {
    case 'mic': art=side(microphone); break;
    case 'two-mics': art=side(G(microphone,'translate(0 0) scale(.55 .87)')+G(microphone,'translate(44 20) scale(.55 .87)'),240); break;
    case 'thermometer': art=side(R(25,4,50,261,cream,24)+R(41,22,18,203,'#fff5dd',9)+C(50,263,30,red)+P('M43 248V100Q50 92 57 100V248Z',red,red)+[40,65,90,115,140,165,190,215].map(y=>L(`M66 ${y}H79`,shade,3)).join('')+P('M57 246Q81 255 70 281Q62 290 50 291Q76 272 57 246', '#a94936','none'),310); break;
    case 'bat': art=top(P('M99 32L109 9L119 28Q149 10 192 8L181 63Q167 39 149 62Q135 42 123 75L107 95L91 75Q75 42 61 62Q43 39 29 63L8 8Q61 11 89 28L97 9Z','#7d6882')+P('M99 32L107 95L123 75Q143 35 192 8Q145 21 119 43Z','#514757','none')+C(98,42,3,cream)+C(115,42,3,cream)); break;
    case 'butterfly': {
      const wing=P('M99 45Q66 -9 18 9Q-3 26 21 52Q-1 92 50 91Q78 86 99 51Z','#d8a85d');
      let x=.1,y=0,z=0;const points:string[]=[];
      for(let i=0;i<1300;i++){const dx=10*(y-x),dy=x*(28-z)-y,dz=x*y-8*z/3;x+=dx*.008;y+=dy*.008;z+=dz*.008;if(i>150)points.push(`${points.length?'L':'M'}${100+x*4} ${94-z*1.75}`);}
      art=top(wing+G(wing,'translate(200 0) scale(-1 1)')+P('M23 56Q67 49 97 49Q71 90 48 90Q10 91 23 56',red,'none')+G(P('M23 56Q67 49 97 49Q71 90 48 90Q10 91 23 56',red,'none'),'translate(200 0) scale(-1 1)')+L(points.join(' '),'#734f3b',.65)+L('M100 32V78',edge,7)+L('M100 35L89 20M100 35L111 20'));break;
    }
    case 'dial': art=top(P('M5 94A95 89 0 0 1 195 94Z',gold)+P('M18 92A82 75 0 0 1 182 92Z',cream)+P('M134 26A82 75 0 0 1 182 92H164A64 58 0 0 0 126 43Z',red,'none')+[0,1,2,3,4,5,6].map(i=>{const t=Math.PI+i*Math.PI/6;return L(`M${100+Math.cos(t)*65} ${92+Math.sin(t)*59}L${100+Math.cos(t)*77} ${92+Math.sin(t)*70}`);}).join('')+P('M94 90L155 30L106 95Z',edge)+C(100,91,8,shade));break;
    case 'compass': art=top(C(50,50,45,gold)+C(50,50,36,cream)+P('M50 5L60 39L94 50L60 60L50 95L40 60L6 50L40 39Z',blue)+P('M50 5V50L94 50L60 60L50 95V50L6 50L40 39Z','#426c72','none')+C(50,50,6,red),100);break;
    case 'claw': art=side(P('M37 236L32 172Q7 156 9 115Q6 72 33 37L44 85L62 67L61 10Q96 32 94 77Q108 143 70 170L78 236Z',red)+P('M62 67L61 10Q96 32 94 77Q108 143 70 170L78 236H58L54 160Q84 130 71 89Z','#984836','none')+L('M34 182L73 184M36 204L75 205')+L('M15 115Q27 98 42 102',cream,5));break;
    case 'winged-sandal': art=side(P('M14 173Q24 162 49 173L85 184Q97 190 91 205Q63 222 11 207Z',shade)+P('M15 172L13 204Q51 216 91 200V188L71 186L47 173Z',gold)+L('M28 177L37 147L55 148L61 182M40 151L56 181',cream,8)+P('M43 151Q-5 114 8 24L26 53L30 11L46 51L63 25L62 71L84 54Q85 113 43 151Z',cream)+P('M43 151Q65 108 62 71L84 54Q85 113 43 151Z','#cab18b','none')+L('M43 139L26 53M43 139L46 51M43 139L62 71',shade,2));break;
    case 'beauty-mark': art=side(P('M35 7L48 42L62 7L75 16L62 57L68 94Q72 126 98 197Q56 226 4 197Q26 133 31 94L36 57L23 16Z','#fff9ed')+P('M61 58L68 94Q72 126 98 197L75 207Q52 129 50 94Z','#d9b6af','none')+L('M34 112L20 194M50 118L48 202M63 124L74 193','#c2958e',3)+C(81,49,5,'#692f47'),240);break;
    case 'signpost': art=side(R(45,4,13,222,shade)+P('M9 25H79L96 48L79 68H9Z',blue)+P('M91 87H23L4 109L23 131H91Z',gold)+P('M12 151H78L94 171L78 190H12Z',red)+L('M13 62H78M23 126H87M15 186H77',shade,4)+C(51,47,3,cream)+C(51,108,3,cream)+C(51,172,3,cream));break;
    case 'pulp': art=top(G(P('M27 183L18 225L50 211L81 225L71 183Z',red)+P('M30 172Q9 192 10 208L29 202M70 172Q91 192 90 208L71 202',blue)+P('M50 4Q82 35 79 108L69 182H31L21 108Q18 35 50 4Z',cream)+P('M50 4Q82 35 79 108L69 182H53Q71 80 50 4Z','#c0a486','none')+P('M50 4Q71 23 76 43H24Q28 23 50 4Z',red)+C(50,81,20,blue)+L('M39 76L48 66',cream,4)+L('M30 153H71',edge,4)+P('M37 189Q27 219 50 237Q70 218 63 189L50 218Z',gold),'translate(240 0) rotate(90)'),240);break;
    case 'gold-android': case 'chrome-red-eye': {
      const metal=id==='gold-android'?gold:'#b5b4a5', dark=id==='gold-android'?'#9d713a':'#6e7d7b';
      art=side(P('M19 29Q50 3 81 29L89 72L81 129L67 155L66 182L94 207L95 231H5L6 207L34 182L33 155L19 129L11 72Z',metal)+P('M52 17Q80 23 81 29L89 72L81 129L67 155L66 182L94 207L95 231H65L49 183V151L70 122L77 72Z',dark,'none')+P('M17 61L42 57L46 76L21 79ZM57 57L83 61L79 79L54 76Z',edge)+E(32,69,7,4,id==='gold-android'?'#fff083':'#ef7259')+E(68,69,7,4,id==='gold-android'?'#fff083':'#ef352f')+L('M49 80L42 106H56M33 126H66M36 150H64M36 178H64',edge,3)+L('M21 37L39 30',cream,5));break;
    }
    case 'car-wash': art=side(R(45,1,13,236,shade)+R(15,20,70,187,blue,25)+P('M61 22Q84 24 85 47V183Q83 206 62 207Z','#416c72','none')+Array.from({length:12},(_,i)=>P(`M8 ${29+i*14}Q45 ${37+i*14} 93 ${25+i*14}L89 ${35+i*14}Q41 ${47+i*14} 11 ${39+i*14}Z`,i%2?blue:'#94b5aa',edge,1.4)).join('')+C(18,15,10,cream)+C(83,219,11,cream)+C(16,210,8,cream)+C(76,8,6,cream));break;
    case 'switchboard': art=side(R(3,4,94,231,shade)+R(10,13,80,211,cream)+[35,85,135,185].flatMap(y=>[30,70].map(x=>C(x,y,10,edge)+C(x,y,4,gold))).join('')+L('M30 35C-5 100 99 154 70 185',red,8)+L('M70 35C100 65 0 150 30 185',blue,8)+L('M70 85C4 80 5 140 70 135',shade,6)+R(22,25,16,18,gold)+R(62,175,16,18,gold));break;
    case 'door': art=side(P('M5 7L95 28V218L5 237Z','#b9774a')+P('M81 25L95 28V218L81 222Z','#82513b','none')+P('M20 32L74 43V106L20 109ZM20 128L74 126V198L20 210Z',shade)+L('M24 101L67 100M25 201L67 191',gold,4)+C(81,120,5,gold)+L('M9 16V227',cream,4));break;
    case 'staircase': art=side(P('M4 218H20V178H38V138H56V98H74V58H93V233H4Z',red)+P('M20 178H38V138H56V98H74V58H93V73H83V113H65V153H47V193H29V233H20Z','#a14e36','none')+L('M8 200L84 31M8 200V227M33 143V177M58 88V137M84 31V58',edge,3));break;
    case 'oom-bars': art=side(R(3,195,18,39,gold,1)+R(27,149,18,85,red,1)+R(51,90,18,144,blue,1)+R(75,12,18,222,green,1)+P('M87 12H93V234H87ZM63 90H69V234H63ZM39 149H45V234H39ZM15 195H21V234H15Z',shade,'none')+L('M2 237H97',edge,4));break;
    case 'feathers': art=side(P('M35 232L43 136Q7 110 16 70Q12 39 44 19Q68 8 81 31L90 40L72 54Q90 116 59 142L52 236Z',green)+P('M44 71Q85 63 72 123L59 142L52 236L43 207L50 137Q27 113 44 71Z','#526747','none')+P('M76 28Q99 26 96 52L80 46L73 54Z',gold)+C(65,31,4,edge)+P('M40 100Q43 71 61 79L66 122Z',blue)+L('M26 153H76',shade,8)+L('M40 138V153M53 139V153',edge,4));break;
    case 'grass': art=side(P('M15 233Q17 134 4 63Q36 79 38 168Q35 69 52 6Q70 70 57 173Q71 84 96 57Q93 164 83 233Z',green)+P('M52 6Q70 70 57 173Q71 84 96 57Q78 198 61 233H42Z','#556846','none')+L('M51 221L52 47M27 220L19 105M66 220L83 105',cream,2));break;
    case 'lobster-shell': art=side(P('M34 26L25 3M65 26L78 3','none',edge,4)+P('M29 20Q51 7 72 20Q93 60 75 152L87 206L52 235L16 208L28 153Q8 61 29 20Z',red)+P('M61 16Q93 60 75 152L87 206L52 235L48 209Q77 79 61 16Z','#914932','none')+[64,92,120,149,179,206].map(y=>L(`M24 ${y}Q52 ${y+14} 78 ${y}`,edge,4)).join('')+C(36,32,4,edge)+C(65,32,4,edge));break;
    case 'mask': art=top(P('M57 6Q98 -4 142 7L137 54Q126 88 100 97Q69 85 61 56Z',cream)+P('M109 3L142 7L137 54Q126 88 100 97Q121 48 109 3Z','#c4a588','none')+P('M70 33Q81 24 91 34L88 42L72 41ZM111 34Q124 24 133 34L130 41L113 42Z',edge)+L('M100 39L93 58H105M79 70Q101 86 122 67',shade,3)+G(R(0,0,47,75,cream,1)+[8,20,32].map(x=>R(x,0,7,44,edge,0)).join(''),'translate(5 18) rotate(-9)'));break;
    case 'gills': art=top(P('M51 54Q55 20 101 19Q145 20 150 54Q143 87 101 88Q59 88 51 54Z','#e5a6a3')+P('M58 60Q104 83 146 52Q145 93 99 91Q70 86 58 60Z','#bd747d','none')+L('M52 36L24 9M52 50L11 46M54 65L25 88M148 36L176 9M148 50L189 46M146 65L175 88','#b05d70',9)+[0,1].map(i=>G(L('M23 7L21 21M31 15L39 6M12 44L20 57M27 46L33 32M25 87L25 71M36 76L47 84','#d28998',5),i?'translate(200 0) scale(-1 1)':'')).join('')+C(79,50,4,edge)+C(123,50,4,edge)+L('M90 65Q101 73 114 63',edge,3));break;
    case 'honeycomb': art=top(P('M12 22L38 8L66 23V56L39 73L12 58ZM66 23L94 7L123 23V56L95 73L66 56ZM123 23L151 8L180 23V56L152 73L123 56Z',gold)+P('M39 25L52 32V49L39 58L25 49V32ZM95 25L109 32V49L95 58L81 49V32ZM151 25L166 32V49L151 58L138 49V32Z',shade)+P('M38 73Q43 78 39 96Q29 90 38 73',gold));break;
    case 'gold-scales': art=top(P('M10 45L41 24L42 43Q102 -10 171 42L193 49L171 64Q105 110 42 60L41 81L10 57Z',gold)+P('M45 61Q104 95 171 64L193 49L173 57Q115 80 46 51Z',shade,'none')+[65,86,107,128].map(x=>L(`M${x} 30Q${x+20} 47 ${x} 68`,shade,3)).join('')+C(158,40,4,edge));break;
    case 'paw-prints': art=top(P('M24 81Q10 61 35 48Q48 38 60 47Q91 50 83 81Q68 97 54 88Q35 98 24 81Z',shade)+E(20,31,12,18,gold)+E(43,21,12,18,gold)+E(68,23,12,18,gold)+E(88,40,10,16,gold)+P('M52 48Q90 50 83 81Q68 97 54 88Z','#634a3a','none'),110);break;
    case 'hashchain': art=top([[13,72,blue,-15],[71,72,gold,15],[130,57,red,-15]].map(([x,w,color,angle])=>G(`<rect x="${x}" y="29" width="${w}" height="40" rx="18" fill="none" stroke="${edge}" stroke-width="18"/><rect x="${x}" y="29" width="${w}" height="40" rx="18" fill="none" stroke="${color}" stroke-width="12"/>`,`rotate(${angle} ${Number(x)+Number(w)/2} 49)`)).join(''));break;
    case 'circuit': art=top(R(53,12,94,77,green,8)+R(65,23,68,52,'#536347',4)+[0,1,2,3,4].map(i=>L(`M${64+i*16} 3V12M${64+i*16} 89V97`,gold,6)).join('')+L('M53 29H22V12H5M53 62H15V87H3M147 29H173V10H195M147 65H177V86H198',shade,5));break;
    case 'cube-lattice': art=top(P('M55 4L112 22L165 4L194 25V73L137 97L81 75L25 97L5 75V27Z',green)+L('M5 27L55 47L112 22L137 44L194 25M55 47V95M137 44V97M55 47L81 75M112 22V68L137 97',edge,3)+P('M137 44L194 25V73L137 97Z','#536747','none')+L('M165 4V50L137 66M112 22V68',cream,2));break;
    case 'flame': art=top(P('M28 90Q1 50 44 13Q34 45 58 48Q72 21 86 5Q100 43 126 35L145 8Q164 52 180 58Q195 95 144 97Z',red)+P('M49 93Q39 63 67 47Q63 71 89 67L112 36Q133 69 148 68Q172 86 147 96Z',gold)+P('M86 96Q68 84 96 69Q118 66 129 96Z',cream));break;
    case 'ocean': art=top(P('M3 85Q46 67 63 28Q87 -5 123 11Q159 24 135 51Q140 22 111 31Q94 44 106 68Q142 90 196 65V97H3Z',blue)+P('M3 85Q68 90 84 53Q93 77 106 68Q142 90 196 65V97H3Z','#426c72','none')+P('M63 28Q87 -5 123 11Q159 24 135 51Q140 22 111 31Q94 44 106 68Q83 52 100 25Q85 17 63 28Z',cream));break;
    case 'song-waves': art=top(P('M5 45H29L51 18V82L29 61H5Z',blue)+P('M32 42L51 18V82L32 63Z','#426c72','none')+L('M73 30Q106 50 73 72',gold,11)+L('M105 18Q152 50 105 84',red,11)+L('M140 7Q200 50 140 95',shade,11));break;
    case 'electron-shells': art=top(E(100,50,89,27,cream)+G(E(100,50,76,25,'none'),'rotate(35 100 50)')+G(E(100,50,76,25,'none'),'rotate(-35 100 50)')+C(96,47,13,red)+C(111,53,11,gold)+C(36,24,8,blue)+C(162,76,8,blue)+C(168,32,8,green));break;
    case 'enigma': art=top(C(50,50,46,shade)+C(50,50,37,gold)+C(50,50,24,cream)+C(50,50,12,shade)+Array.from({length:16},(_,i)=>G(R(47,5,6,12,edge,1),`rotate(${i*22.5} 50 50)`)).join(''),100);break;
    case 'tentacles': art=top(P('M6 93Q29 72 24 48Q11 4 40 9Q60 14 43 40Q41 23 33 27Q25 48 56 66Q69 22 100 31Q134 19 150 65Q171 46 165 24Q151 15 153 37Q135 8 164 7Q191 12 180 47Q169 76 198 94Z',green)+P('M56 66Q70 51 82 70Q106 47 120 69Q136 53 150 65L178 96H24Z','#526447','none')+C(100,43,27,cream)+C(90,38,3,edge)+C(110,38,3,edge)+L('M87 51Q100 65 114 50',edge,3));break;
    // Enclosing hero objects: their interior is occluded by the solid QR plate below.
    case 'egg': art=whole(P('M50 2C18 10 1 47 8 77Q15 99 50 98Q85 99 92 77C99 47 82 10 50 2Z',green)+P('M58 5C89 23 99 59 92 77Q85 99 50 98Q77 80 74 49Q73 22 58 5Z','#556947','none')+L('M35 13L48 20L42 30L57 40M15 73Q47 84 86 71',edge,1.7));break;
    case 'mirror': art=whole(E(50,47,46,44,gold)+E(50,47,39,37,'#c6d6cb')+P('M80 18Q104 55 78 79L69 85Q97 42 80 18Z',shade,'none')+P('M34 88H65L76 97H23Z',shade)+L('M21 27L29 15M18 19L31 22',cream,2.5));break;
    case 'tv': art=whole(R(3,14,94,77,shade,10)+R(7,18,81,65,blue,9)+R(12,22,69,58,cream,8)+C(92,39,3,gold)+C(92,52,3,gold)+L('M91 66V76M94 66V76',edge,1.4)+L('M30 2L48 14L67 3',edge,3)+P('M14 92L10 98H22L26 92M72 92L77 98H88L85 92Z',edge));break;
    case 'boxing-ring': art=whole(P('M3 84L15 92H89L98 80L90 7H9Z',blue)+P('M15 85H96L89 94H15Z','#446b70','none')+[12,17,22].map(v=>L(`M8 ${v}L92 ${v}V${100-v}H8Z`,cream,1.8)).join('')+[[7,9],[91,9],[7,78],[91,78]].map(([x,y])=>R(x,y,5,16,red,1)).join(''));break;
    case 'goalposts': art=whole(L('M12 90V9H88V90',edge,8)+L('M12 90V9H88V90',cream,5)+P('M4 87L23 91L19 97H2ZM80 91L97 87L98 97H82Z',green)+L('M22 12L12 24M76 12L88 24',shade,2));break;
    case 'calendar': art=whole(R(5,7,90,89,shade)+R(3,5,88,87,cream)+R(3,5,88,15,red)+[18,38,58,78].map(x=>R(x,1,4,14,shade,2)).join('')+[28,43,58,73,88].map(y=>L(`M9 ${y}H86`,shade,1)).join('')+[10,25,40,55,70,85].map(x=>L(`M${x} 23V88`,shade,1)).join('')+P('M70 92H91V72Q79 76 70 92Z','#d3b996'));break;
    case 'blueprint': art=whole(P('M9 5H90L96 94H4Z',blue)+P('M80 5H90L96 94H86Z','#426c72','none')+L('M8 15H87M13 8V91M8 86H89M84 11V91','#e3dfc7',1.1)+P('M2 62L20 90H2Z',gold)+P('M6 74L13 87H6Z',blue)+L('M22 8H76M22 5V11M76 5V11',cream,1.3));break;
    case 'field-radio': art=whole(R(3,13,94,80,blue,7)+R(8,18,79,69,'#aec1b1',4)+P('M86 16H94V90H86Z','#45676b','none')+L('M12 14V2L18 1',edge,3)+R(34,4,31,7,shade,3)+[16,26,36,46,56].map(x=>L(`M${x} 85V89`,edge,2)).join('')+C(92,31,3,gold)+C(92,45,3,gold));break;
    case 'filing-drawers': art=whole(R(4,3,92,93,blue,3)+[7,36,66].map(y=>R(8,y,84,26,'#a6b6a5',2)+R(37,y+8,24,6,shade,1)+L(`M42 ${y+9}V${y+15}H56V${y+9}`,cream,1.3)).join('')+P('M87 6H92V91H87Z','#56716c','none'));break;
    case 'rulebook': art=whole(P('M3 9Q27 0 49 10Q73 0 96 9V92Q74 84 49 95Q26 84 3 92Z',shade)+P('M6 6Q27 0 49 9Q73 0 93 6V87Q74 80 49 92Q26 80 6 87Z',cream)+L('M49 10V91',shade,2)+P('M69 3H76V27L72 23L69 27Z',red)+L('M12 10L36 10M61 12H86M12 80L34 81M63 81L86 80','#bc9774',1.2));break;
    case 'maze': art=whole(R(3,3,94,94,gold,3)+R(8,8,84,84,cream,1)+L('M12 3V15H29V8H47V15H66V3M80 8V20H96M97 40H86V57H97M91 72H83V91H66V98M48 92V82H30V95M3 75H15V57H7V38H15V22H3',shade,3));break;
    default: throw new Error(`Unknown film scenery: ${id}`);
  }
  // Explicit exterior-only clipping also protects the plate with transparent exports.
  const clip=`film-band-${id}-${size}`;
  return `<defs><clipPath id="${clip}"><path clip-rule="evenodd" d="M0 0H${size}V${size}H0Z M${box.x} ${box.y}V${box.y+plate}H${box.x+plate}V${box.y}Z"/></clipPath></defs><g data-film-hero="${id}" clip-path="url(#${clip})">${art}</g>`;
}
