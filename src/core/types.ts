export const filmStyles = ['bat', 'beauty-mark', 'blueprint', 'boxing-ring', 'butterfly', 'calendar', 'car-wash', 'chrome-red-eye', 'circuit', 'claw', 'compass', 'cube-lattice', 'dial', 'door', 'egg', 'electron-shells', 'enigma', 'feathers', 'field-radio', 'filing-drawers', 'flame', 'gills', 'goalposts', 'gold-android', 'gold-scales', 'grass', 'hashchain', 'honeycomb', 'lobster-shell', 'mask', 'maze', 'mic', 'mirror', 'ocean', 'oom-bars', 'paw-prints', 'pulp', 'rulebook', 'signpost', 'song-waves', 'staircase', 'switchboard', 'tentacles', 'thermometer', 'tv', 'two-mics', 'winged-sandal'] as const;
export const shapes = ['square', 'rounded', 'dots', 'diamond', 'squircle', 'horizontal', 'vertical', 'weave', 'mosaic', 'circuit', 'petal', 'halftone', 'classy', 'fluid', 'star', 'heart', 'cross', 'hexagon', 'stitch', 'bead', 'cube', 'gapped', 'contour', 'horizontal-pill', 'vertical-pill', 'diagonal', 'scribble', 'flower', 'gridlet', 'arrow', 'wave', 'feather', 'grass-blade', 'fish-scale', 'paw', 'shell'] as const;
export const borders = ['none', 'frame', 'botanical', 'postage', 'orbit', 'deco', 'grid', 'ticket', ...filmStyles.map(id => `film-${id}` as const)] as const;
export const textures = ['none', 'paper', 'speckle', 'lines'] as const;
export const materials = ['none', 'bamboo', 'oak', 'beans', 'ants', 'fire', 'ice', 'clouds', 'ripples', 'leaves'] as const;
export const eyes = ['square', 'rounded', 'dots', 'diamond'] as const;
export const effects = ['none', 'shadow', 'emboss', 'extrude', 'neon'] as const;
export const animations = ['none', 'sweep', 'pulse'] as const;
export type Material = typeof materials[number];
export type Shape = typeof shapes[number];
export type Border = typeof borders[number];
export type Texture = typeof textures[number];
export type Eye = typeof eyes[number];
export type Effect = typeof effects[number];
export type Animation = typeof animations[number];
export type Safety = 'conservative' | 'experimental';
export interface Recipe {
  material: Material;
  detail: number;
  shape: Shape;
  border: Border;
  texture: Texture;
  eye: Eye;
  effect: Effect;
  animation: Animation;
  foreground: string;
  background: string;
  accent: string;
  gradient: boolean;
  seed: number;
}
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  inspiration: string;
  safety: Safety;
  credit?: {
    name: string;
    url: string;
    technique: string;
  };
  recipe: Recipe;
}
export interface GenerateOptions {
  text: string;
  style?: string;
  recipe?: Partial<Recipe>;
  size?: number;
  modulePx?: number;
  frame?: 'none' | 'preset';
  /** Keep the QR plate opaque; omit only the surrounding canvas background. */
  transparent?: boolean;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  /** Trusted code hook. Replaces data-module artwork only; structural modules remain intact. */
  moduleRenderer?: ModuleRenderer;
}
export interface ModuleContext {
  x: number;
  y: number;
  row: number;
  column: number;
  random: number;
  darkAt: (row: number, column: number) => boolean;
}
/** Return SVG in the current dark fill. Coordinates and dimensions are in module units. */
export type ModuleRenderer = (context: ModuleContext) => string;
export interface GeneratedQR {
  svg: string;
  recipe: Recipe;
  style: StylePreset;
  moduleCount: number;
  version: number;
  size: number;
  contrast: number;
  warnings: string[];
  geometry: {
    transparentSurround: boolean;
    codeBox: { x: number; y: number; width: number; height: number };
    moduleCount: number; modulePx: number; version: number; ecc: 'L' | 'M' | 'Q' | 'H';
    frame: { top: number; right: number; bottom: number; left: number };
    image: { width: number; height: number };
  };
}
