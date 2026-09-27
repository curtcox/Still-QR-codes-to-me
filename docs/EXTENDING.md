# Adding a technique

A useful new style should add an independently controllable visual technique or serve a specific use case. Palette variations alone belong in recipes, not new renderer implementations.

## Recipes

`src/core/types.ts` defines the serializable contract. All fields have defaults through a preset:

```json
{
  "shape": "petal",
  "border": "botanical",
  "texture": "paper",
  "foreground": "#304524",
  "background": "#fbf9ed",
  "accent": "#4d5427",
  "gradient": false,
  "seed": 42
}
```

Colors use six-digit hex notation. The seed is an unsigned 32-bit integer. Invalid geometry names, low contrast, dark backgrounds, and out-of-range sizes are rejected. Rendering the same payload, preset, recipe, and size with the same package version produces the same SVG. Reproducibility across future renderer or encoder changes requires pinning the package/lockfile version too.

To add a preset, register it in `src/core/presets.ts`: give it a stable ID, a description of its actual mechanism, likely applications, and an honest classification. Add a new module shape in `types.ts` and `moduleSVG` in `render.ts` when it needs new geometry. The controls discover shape/border/texture names from those arrays. The UI's introductory counts and collection copy currently describe the twelve-style milestone; update them when adding presets.

## Custom module renderers

For experiments without editing the built-in switch, supply a code hook:

```ts
const result = generateQR({
  text: 'https://example.com',
  moduleRenderer: ({ x, y, random, row, column, darkAt }) => {
    const radius = 0.15 + random * 0.1;
    return `<rect x="${x + 0.02}" y="${y + 0.02}" width="0.96" height="0.96" rx="${radius}"/>`;
  },
});
```

Coordinates are in QR module units, already offset by the border and quiet zone. The renderer is called only for dark, non-reserved cells. A per-cell SVG clip keeps ordinary geometry within its own cell. `darkAt(row, column)` provides neighboring state, with out-of-bounds coordinates returning false. The parent group supplies the ink or gradient fill. A seeded `random` value is stable per cell.

**Hooks are trusted code, not an SVG sanitizer.** Do not run remote/user-provided JavaScript or inject untrusted SVG through this API. SVG scripts, external resources, filters, and other active constructs are not sandboxed. The studio imports only data recipes, never hooks or raw SVG. The core renderer escapes payload metadata and validates built-in color/shape inputs.

New border and texture implementations must remain outside the solid QR plate. Its quiet zone must stay four modules wide. Built-in module geometry must remain within its cell. Do not alter the encoder's reserved-module mask or apply global distortions to it.

## Validation checklist for a contribution

1. Add the technique and a representative preset, including safety classification and a real use case.
2. Run `npm run check`; the preset loop automatically includes new presets. Test URL, short, Unicode, Wi-Fi, and long payloads.
3. Run `npm run test:browser` and `npm run gallery`; inspect the exported SVG and PNG at full and reduced sizes.
4. Test actual device scans and print samples where possible. Record failures and material limitations. Never relabel experimental artwork solely because one payload passes.
5. Document reproducibility, supported controls, and whether a future change would alter existing recipes.

## Optional natural language and AI assets

The core deliberately has no model or API dependency. A future natural-language adapter can return a validated `Partial<Recipe>` and call `generateQR` just like the CLI or studio. This keeps prompt interpretation outside encoding and rendering.

A future asset provider can generate local textures or illustrations for a border compositor, with an explicit seed/model provenance record. Artwork must remain outside the quiet zone unless a separately validated experimental renderer is used. The current version does not accept arbitrary images, place logos over the matrix, call models, or implement an AI provider. Do not present that roadmap as a working feature.
