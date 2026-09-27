# Frog or Axolotl exports

The [brief](BRIEF.md) defines 47 film styles and the [manifest](manifest.json) contains 117 exact payloads. All 47 IDs are available in the studio, library, and CLI. `circuit` and `honeycomb` replace existing presets of the same IDs; 45 other IDs are added, yielding 90 presets overall.

```sh
npm run qr -- --batch examples/film/manifest.json --out-dir examples/film/out --module-px 8 --transparent
npm run qr -- --batch examples/film/manifest.json --out-dir examples/film/out-noframe --module-px 8 --transparent --frame none
npm run qr -- 'https://example.com' --style bat --ecc M --module-px 6 --frame none -o bat.png
```

Each committed export folder, `out/` and `out-noframe/`, includes 117 PNGs, 117 same-stem sidecars, [JSON results](out/report.json), [readable results](out/report.md), and the [47-style contact sheet](out/sheet.png). The [frameless sheet](out-noframe/sheet.png) provides the matching code-only set. The sheets include review labels; individual PNGs contain no lettering. Batch output overwrites only its named artifacts. Repeating a batch produces identical bytes in this environment; no timestamps or randomness enter the files. Renderer/library version changes or different font/rasterizer versions may change bytes across environments.

The committed exports use eight whole pixels per module. Without a module-pitch option, output is 380×380 for shelf/card and 480×480 for feature. Every entry is checked at 380; features are additionally checked at 480. Both the existing checks and ZXing receive the exact payload and the manifest ECC. Each size is tested at export resolution, 256px, 256px with σ 0.6 blur, and 256px with contrast reduced to 55%. An entry passes only when all its checks pass; batch exits 2 on a scan failure and keeps the evidence.

Use `--module-px N` for whole-pixel production artwork. A manifest entry may set `"modulePx": 10` (an integer from 1 through 128); that entry overrides the CLI batch default. Image width is `(moduleCount + 8 + frame.left + frame.right) * N`, using module extents before conversion to pixels. Height uses top and bottom. Film frames may extend up to 14 modules per side, with asymmetric plate placement for side and top props. Exports remain square.

`--frame none` removes scenery but retains four quiet-zone modules on each side, colours, and module shapes. Batch accepts these options too, still validates required 380/480px versions, and additionally checks the actual whole-pixel output. `--size` and `--module-px` are mutually exclusive. No-frame output has no hidden padding beyond the quiet zone.

`--transparent` leaves unpainted space around the frame transparent in SVG and PNG, while keeping the entire quiet-zone plate opaque. Its default film colour is warm paper cream (`#F3EBDC`); gills and beauty-mark use pale pink. Without this option the canvas uses the recipe background. A frameless image is entirely the opaque plate. Scan checks composite transparency onto white before testing, including in the browser; their results describe that backing.

Sidecars use pixels, with origin at the image's top left:

- `codeBox`: x, y, width and height including the quiet zone, excluding scenery.
- `moduleCount`, `modulePx`, `version`, `ecc`: matrix dimensions, pixel pitch, QR version and correction level.
- `frame`: top/right/bottom/left distance from image edge to codeBox.
- `image`: full output width and height.
- `transparentSurround`: whether transparent surround output was requested (the plate stays opaque).
- `text`, `style`, and (for batch) `id` and `mode`: traceability to the manifest.

At fixed 380/480px sizes, `modulePx` can be fractional. With `--module-px`, pitch, codeBox edges, matrix origin and image dimensions are integers. The metadata describes the actual exported PNG, not a hypothetical resize.

Each style has one large hero composition, with warm flat painted fills, dark outlines and shade planes. All scenery is independently drawn SVG from this brief; there are no logos, external assets, embedded fonts, model calls, or network requests. Film presets require ≥7:1 flat ink/paper contrast, no texture/gradient/shadow in the QR, and square finders except the Enigma preset's concentric circular rings. Those rings retain the 1:1:3:1:1 radial cross-section. Emblems sit in the outside band, so none of the QR modules are cleared, at any ECC. Chrome is expressed through grey bands in the outer frame and flat grey data ink; using gradient-filled modules would conflict with the brief's flat-fill scan requirement.

The visible designs are original interpretations of the requested motifs. Generic subject cues—parrot and feathers, a claw, radio, microphones, dress swirl, dial, wings, etc.—are not reproductions of real marks. The previous honeycomb technique credit remains attached to that preset. All frames are hard-clipped outside the quiet zone.

## Verification of these exports

Both saved reports pass **117/117 entries across 47 styles**: each set includes 127 required size renders (117 at 380px and ten features also at 480px) plus 117 actual eight-pixel-pitch renders, each checked under four conditions with both decoders. Browser Canvas regression independently covers the required manifest sizes, actual transparent framed and frameless exports, and all film presets at 1024px. The core suite also checks alpha pixels, opaque quiet zones, per-entry pitch precedence, asymmetric geometry, and batch determinism.

The full verification run passes 236 core tests, five browser tests, one production-site smoke test, all 90 gallery presets, and 1,440 assessment conditions in each decoder (90 presets × four payloads × four conditions).
