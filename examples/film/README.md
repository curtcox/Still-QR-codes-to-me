# Frog or Axolotl exports

The [brief](BRIEF.md) defines 47 film styles and the [manifest](manifest.json) contains 117 exact payloads. All 47 IDs are available in the studio, library, and CLI. `circuit` and `honeycomb` replace existing presets of the same IDs; 45 other IDs are added, yielding 90 presets overall.

```sh
npm run qr -- --batch examples/film/manifest.json --out-dir examples/film/out
npm run qr -- 'https://example.com' --style bat --ecc M --module-px 6 --frame none -o bat.png
```

The committed `out/` folder includes 117 PNGs, 117 same-stem sidecars, [JSON results](out/report.json), [readable results](out/report.md), and the [47-style contact sheet](out/sheet.png). The sheet includes review labels; individual PNGs contain no lettering. Batch output overwrites only its named artifacts. Repeating a batch produces identical bytes in this environment; no timestamps or randomness enter the files. Renderer/library version changes or different font/rasterizer versions may change bytes across environments.

Default output is 380×380 for shelf/card and 480×480 for feature. Every entry is checked at 380; features are additionally checked at 480. Both the existing checks and ZXing receive the exact payload and the manifest ECC. Each size is tested at export resolution, 256px, 256px with σ 0.6 blur, and 256px with contrast reduced to 55%. An entry passes only when all its checks pass; batch exits 2 on a scan failure and keeps the evidence.

Use `--module-px N` for whole-pixel production artwork. Image size becomes `(moduleCount + 8 + frameModules * 2) * N`, where film frames have eight modules on every side. `--frame none` removes scenery but retains four quiet-zone modules on each side, colours, and module shapes. Batch accepts these options too, still validates required 380/480px versions, and additionally checks the actual whole-pixel output. `--size` and `--module-px` are mutually exclusive. No-frame output has no hidden padding beyond the quiet zone.

Sidecars use pixels, with origin at the image's top left:

- `codeBox`: x, y, width and height including the quiet zone, excluding scenery.
- `moduleCount`, `modulePx`, `version`, `ecc`: matrix dimensions, pixel pitch, QR version and correction level.
- `frame`: top/right/bottom/left distance from image edge to codeBox.
- `image`: full output width and height.
- `text`, `style`, and (for batch) `id` and `mode`: traceability to the manifest.

At fixed 380/480px sizes, `modulePx` can be fractional. With `--module-px`, pitch, codeBox edges, matrix origin and image dimensions are integers. The metadata describes the actual exported PNG, not a hypothetical resize.

All scenery is independently drawn SVG from this brief; there are no logos, external assets, embedded fonts, model calls, or network requests. Film presets require ≥7:1 flat ink/paper contrast, no texture/gradient/shadow in the QR, and square finders except the Enigma preset's concentric circular rings. Those rings retain the 1:1:3:1:1 radial cross-section. Emblems sit in the outside band, so none of the QR modules are cleared, at any ECC. Chrome is expressed through grey bands in the outer frame and flat grey data ink; using gradient-filled modules would conflict with the brief's flat-fill scan requirement.

The visible designs are original interpretations of the requested motifs. Generic subject cues—parrot and feathers, a claw, radio, microphones, dress swirl, dial, wings, etc.—are not reproductions of real marks. The previous honeycomb technique credit remains attached to that preset. All frames are hard-clipped outside the quiet zone.

## Verification of these exports

The saved report passes **117/117 entries across 47 styles**: 127 required size renders (117 at 380px and ten features also at 480px), each checked under four conditions with both decoders. The browser Canvas regression independently covers the same manifest sizes and all film presets at 1024px. The full core suite passes 234 tests, the browser suite passes five tests, and the production-site smoke test passes. All 90 collection gallery presets pass as well.
