import type { Recipe, StylePreset } from './types.js';
const base: Recipe = { material: 'none', detail: .65, shape: 'square', border: 'frame', texture: 'none', foreground: '#172f2a', background: '#fffdf5', accent: '#385b47', gradient: false, seed: 42 };
const preset = (id: string, name: string, description: string, inspiration: string, recipe: Partial<Recipe>, safety: StylePreset['safety'] = 'conservative'): StylePreset => ({ id, name, description, inspiration, safety, recipe: { ...base, ...recipe } });
export const presets: readonly StylePreset[] = [
  preset('editorial', 'Editorial', 'Crisp ink, warm stock, and a double-rule frame.', 'Book jackets · menus · invitations', {}),
  preset('soft-stone', 'Soft stone', 'Rounded blocks in quiet slate with a paper finish.', 'Wellness · ceramics · hospitality', { shape: 'rounded', foreground: '#343b48', accent: '#4c5767', texture: 'paper' }),
  preset('orbital', 'Orbital', 'An array of dots surrounded by planetary arcs.', 'Science · music · exhibitions', { shape: 'dots', border: 'orbit', foreground: '#242050', accent: '#42357d', background: '#f6f3ff' }, 'experimental'),
  preset('prism', 'Prism', 'Faceted diamond modules with a deep jewel gradient.', 'Jewelry · packaging · fashion', { shape: 'diamond', border: 'deco', foreground: '#38224c', accent: '#173e64', gradient: true }, 'experimental'),
  preset('candy', 'Candy', 'Plump squircles, berry ink, and a ticket-shaped surround.', 'Bakeries · celebrations · pop-ups', { shape: 'squircle', border: 'ticket', foreground: '#761f43', accent: '#5c234d', background: '#fff2f5' }),
  preset('signal', 'Signal', 'Horizontal ribbons flow through a technical grid.', 'Technology · wayfinding · conferences', { shape: 'horizontal', border: 'grid', foreground: '#153d5c', accent: '#245778', background: '#f2faff' }),
  preset('reeds', 'Reeds', 'Vertical strokes with a botanical border in forest ink.', 'Gardens · outdoor spaces · farm shops', { shape: 'vertical', border: 'botanical', foreground: '#214937', accent: '#375b35', texture: 'paper' }),
  preset('woven', 'Woven', 'Alternating threads suggest a woven indigo textile.', 'Textiles · craft markets · makers', { shape: 'weave', border: 'frame', foreground: '#252f58', accent: '#374267', texture: 'lines' }, 'experimental'),
  preset('terrazzo', 'Terrazzo', 'Seeded, gently irregular tiles with a speckled surround.', 'Architecture · interiors · ceramics', { shape: 'mosaic', border: 'frame', texture: 'speckle', foreground: '#533829', accent: '#654129', background: '#fff6e8' }, 'experimental'),
  preset('circuit', 'Circuit', 'Connected traces and contact points in deep teal.', 'Electronics · workshops · hardware', { shape: 'circuit', border: 'grid', foreground: '#123d3f', accent: '#13534c', background: '#effcf8' }, 'experimental'),
  preset('botanical', 'Botanical', 'Leaf-like modules framed by delicate growing stems.', 'Florists · tea · natural products', { shape: 'petal', border: 'botanical', foreground: '#304524', accent: '#4d5427', background: '#fbf9ed', texture: 'paper' }, 'experimental'),
  preset('letterpress', 'Letterpress', 'Variable ink dots and a perforated postage border.', 'Postcards · zines · heritage brands', { shape: 'halftone', border: 'postage', foreground: '#512d29', accent: '#65382e', background: '#fff5e6', texture: 'speckle' }, 'experimental'),
  preset('bamboo', 'Bamboo', 'Segmented canes with joints, longitudinal fibers, and a woven bamboo surround.', 'Tea houses · gardens · natural packaging', { material: 'bamboo', border: 'none', foreground: '#23451c', accent: '#56742d', background: '#fafbe9' }, 'experimental'),
  preset('oak', 'Oak', 'Carved end grain, elongated fibers, and knots flow across the code.', 'Woodworkers · furniture · distilleries', { material: 'oak', border: 'none', foreground: '#4d2c16', accent: '#85602e', background: '#fff4df' }, 'experimental'),
  preset('beans', 'Beans', 'Roasted beans with curved center creases, rounded volume, and seeded rotation.', 'Coffee roasters · cafés · food labels', { material: 'beans', border: 'none', foreground: '#3d221a', accent: '#79543b', background: '#fff5e8' }, 'experimental'),
  preset('ants', 'Ants', 'Six-legged silhouettes with antennae and segmented bodies form a busy colony.', 'Ecology · museums · field guides', { material: 'ants', border: 'none', foreground: '#2b2521', accent: '#766050', background: '#faf7ec' }, 'experimental'),
  preset('fire', 'Fire', 'Curling flame tongues, ember highlights, and a flickering flame surround.', 'Hot sauce · festivals · kitchens', { material: 'fire', border: 'none', foreground: '#7a2412', accent: '#d05d17', background: '#fff5e5' }, 'experimental'),
  preset('ice', 'Ice', 'Fractured crystal facets with branching cracks and reflective edges.', 'Winter events · cold drinks · science', { material: 'ice', border: 'none', foreground: '#184362', accent: '#438ba8', background: '#f1fcff' }, 'experimental'),
  preset('clouds', 'Clouds', 'Billowing storm-cloud silhouettes, overlapping lobes, and soft highlights.', 'Weather · travel · dream journals', { material: 'clouds', border: 'none', foreground: '#364358', accent: '#7185a0', background: '#f7fbff' }, 'experimental'),
  preset('ripples', 'Ripples', 'Overlapping wave fronts travel through a continuous watery surface.', 'Spas · pools · conservation', { material: 'ripples', border: 'none', foreground: '#164957', accent: '#3b8492', background: '#effdff' }, 'experimental'),
  preset('leaves', 'Leaves', 'Interleaved leaf silhouettes with central ribs and branching veins.', 'Nurseries · botanical collections · tea', { material: 'leaves', border: 'none', foreground: '#28451d', accent: '#638139', background: '#f7fbe9' }, 'experimental'),
];
export function getPreset(id = 'editorial'): StylePreset {
  const value = presets.find(p => p.id === id);
  if (!value) throw new Error(`Unknown style "${id}". Choose: ${presets.map(p => p.id).join(', ')}.`);
  return value;
}
