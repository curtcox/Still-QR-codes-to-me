# Growing a useful collection

The first milestone established a local engine, studio, CLI, twelve geometric styles, and scan feedback. The second added nine procedural materials, local image integration, content-aware QR mask selection, and automatic scan-guided refinement. The third added 14 source-credited styles across symbols, finder eyes, craft patterns, depth, light, and motion. The long-term goal is a broad vocabulary of useful QR treatments with measured limitations, not a large list of cosmetic aliases.

See [the research comparison](RESEARCH.md) for image-generation reference points and remaining gaps, and the [style atlas](STYLE-ATLAS.md) for the broader source survey and implementation map.

## Next: coverage and composition

- Expand rendering primitives: continuous contours, tiles with cut corners, calligraphic strokes, stippling, engraving, pixel sprites, and two-tone print patterns.
- Add border compositors for labels, captions, brand marks, cut lines, product tags, and accessible scan instructions, preserving the clear margin.
- Expand palette collections: one-color print, high-contrast screen, seasonal packaging, risograph-inspired separations, metallic-look screen art.
- Add structured payload builders for Wi-Fi, contacts, calendar events, email, SMS, and location, with correct escaping and length feedback.
- Version recipe schemas, add migration support, and create a searchable local gallery with saved favorites and batch exports.

## Then: stronger evidence

- Add a second independent decoder and a device/print test matrix.
- Measure perspective, noise, JPEG compression, lighting gradients, occlusion, dot gain, and physical size at a specified DPI.
- Offer worker-based browser scanning for dense codes and maximum-size exports.
- Keep reproducible scan reports alongside style contributions, and report the exact tested payloads and conditions.

## Then: guided exploration

- Natural-language descriptions mapped to constrained recipes, with understandable control choices.
- Optional generated textures and illustrations through local models or explicitly configured providers.
- Search combinations for visual objectives subject to scan checks, with exact recipe provenance.
- Extend existing image integration with QR-conditioned scene generation, negative-space motifs, and controlled distortion, with honest failure rates.

No finite first milestone can support every describable treatment. Each new family should bring an extensible mechanism, useful examples, and evidence about when it works.
