import type { Recipe, StylePreset } from './types.js';
const base: Recipe = { shape: 'square', border: 'frame', texture: 'none', foreground: '#172f2a', background: '#fffdf5', accent: '#385b47', gradient: false, seed: 42 };
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
];
export function getPreset(id = 'editorial'): StylePreset {
  const value = presets.find(p => p.id === id);
  if (!value) throw new Error(`Unknown style "${id}". Choose: ${presets.map(p => p.id).join(', ')}.`);
  return value;
}
