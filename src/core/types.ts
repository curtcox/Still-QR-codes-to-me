export const shapes = ['square', 'rounded', 'dots', 'diamond', 'squircle', 'horizontal', 'vertical', 'weave', 'mosaic', 'circuit', 'petal', 'halftone'] as const;
export const borders = ['none', 'frame', 'botanical', 'postage', 'orbit', 'deco', 'grid', 'ticket'] as const;
export const textures = ['none', 'paper', 'speckle', 'lines'] as const;
export type Shape = typeof shapes[number];
export type Border = typeof borders[number];
export type Texture = typeof textures[number];
export type Safety = 'conservative' | 'experimental';
export interface Recipe {
  shape: Shape;
  border: Border;
  texture: Texture;
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
  recipe: Recipe;
}
export interface GenerateOptions {
  text: string;
  style?: string;
  recipe?: Partial<Recipe>;
  size?: number;
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
}
