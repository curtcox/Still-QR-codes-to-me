# Style atlas and source credits

Reviewed September 27, 2026. This survey tracks techniques worth reproducing as local, composable tools. “After” means the named project or paper is the direct design reference for this repository's independent implementation. It does not claim that source was the first to invent a generic shape such as a circle or star. No third-party renderer code or trained model is copied into this repository.

## Parametric vector systems

| Source | Useful techniques observed | Local response |
| --- | --- | --- |
| [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) | Rounded, dots, classy and extra-rounded modules; independently styled finder corners and centers; linear/radial gradients; logos; circular compositions | `classy`, `rounded`, `dots`, `squircle`; four finder-eye choices; gradients; the **Classy noir** preset |
| [liquid-js QR Code Styling](https://liquid-js.github.io/qr-code-styling/enums/index.DotType.html) | Wave, heart, star, weave, polygon, circuit, zebra, block-stripe, blob and soft dot families | `heart`, `star`, `weave`, `hexagon`, `circuit`, `fluid`, horizontal and vertical modules; **Honeycomb**, **Constellation**, **Love letter**, **Waypoint**, and **Liquid ink** |
| [qr-platform/qr-code.js](https://github.com/qr-platform/qr-code.js/blob/main/docs/usage-guide.md) | Random dots, lines, tiny squares, stars, plus signs, diamonds, custom eyes, and call-to-action borders | Randomized halftone/mosaic modules, line modules, stars, crosses, diamonds, independent eyes, and eight border systems |
| [Awesome QR](https://github.com/picksell-engineering/awesome-picksell-qr) | Background images, automatic color sampling, margin and dot-scale controls | Local image-art mode, content-aware mask selection, local tone correction, and an explicit image-freedom control |
| [Segno artistic QR documentation](https://segno.readthedocs.io/en/1.4.1/artistic-qrcodes.html) | Static and animated background images with configurable scale and placement | Self-contained image SVG export and animated SVG treatments; raster export preserves a stable resting frame |
| [QRBTF](https://github.com/latentcat/qrbtf) and [react-qrbtf](https://github.com/CPunisher/react-qrbtf) | Parametric beautification plus QR-conditioned generative scenes | Procedural vector materials plus a separate image compositor; no claim of matching its diffusion backend |

## Image integration and optimization research

| Source | Core idea | Local response and limit |
| --- | --- | --- |
| [QArt Codes](https://research.swtch.com/qart) | Uses encoding degrees of freedom to make the QR bitmap agree with a target picture | Image mode evaluates all eight legal masks against source luminance. It does not reproduce QArt's coding-level pixel optimization |
| [Halftone QR Codes](https://arxiv.org/abs/1211.1572) | Constrained coding embeds grayscale halftone imagery while preserving decodability | `halftone` modules and image tone projection reproduce the visual vocabulary, without the paper's correction-tree encoder |
| [Artistic QR Code Embellishment](https://onlinelibrary.wiley.com/doi/10.1111/cgf.12221) | Error-aware module stylization and image embedding | Cell-clipped module art, protected structure, high error correction, and decoder checks |
| [ART-UP](https://arxiv.org/abs/1803.02280) | Models module scan probability and optimizes binary, grayscale, and color layers | Local luminance bounds around module centers and a color-preserving image transform; no learned scan-probability model |
| [SEE / Stylize Aesthetic QR](https://arxiv.org/abs/1803.01146) | Reduces baseline contrast before neural style transfer | Adjustable image freedom and locally corrected contrast; no style-transfer network |
| [ArtCoder](https://arxiv.org/abs/2011.07815) | Combines neural style transfer with simulated-code loss | Scan checks after rendering and deterministic refinement over image freedom; no neural loss optimization |
| [Text2QR](https://openaccess.thecvf.com/content/CVPR2024/html/Wu_Text2QR_Harmonizing_Aesthetic_Customization_and_Scanning_Robustness_for_Text-Guided_QR_CVPR_2024_paper.html) | Builds an aesthetic blueprint and refines it in latent space | Source art and QR structure are composed together, then tested and refined. The local algorithm is CPU tone projection, not diffusion |
| [DiffQRCoder](https://arxiv.org/abs/2409.06355) | Adds scan-robust guidance and iterative refinement to diffusion generation | Exact-payload decode checks and finite repair steps express the same generate/test/refine workflow without a model |
| [GladCoder](https://www.ijcai.org/proceedings/2024/0861.pdf) | Uses grayscale-aware denoising to improve visual quality and scanning | Grayscale-aware local remapping in image mode; no diffusion denoiser |
| [Face2QR](https://arxiv.org/abs/2411.19246) | Specializes aesthetic QR synthesis for faces | Local portraits can be imported, but there is no identity-aware model or face-specific claim |
| [AnimateQR](https://openreview.net/pdf/e49b2c2a17aafc94e363837c5d5f96b1f06e2e6e.pdf) | Optimizes animated QR codes for visual quality and temporal robustness | **Slow pulse** provides a conservative animated SVG analogue; the static/resting frame is what automated checks verify |

## Current products and craft tools

| Source | Useful result | Local response |
| --- | --- | --- |
| [artistic_qr](https://github.com/deaa-jahjah/artistic_qr) | Custom modules/eyes, photo modes, isometric extrusion, shadows, embossing, gradient sweep, reveal, and pulse | `cube`, `extrude`, `shadow`, `emboss`, `sweep`, and `pulse`; **Isometric blocks**, **Debossed paper**, **Floating sticker**, and **Gradient sweep** |
| [ANQR](https://anqr.link/) | Photo/GIF blending, mosaics, dithering, animation, and frames | Image-art composition, mosaic/halftone vector modules, motion, and borders |
| [ArtQR](https://artqr.art/) | Dot, rounded, classic, diamond, blob and cross shape families with image blending | Matching composable module vocabulary plus local image integration |
| [CuteQRCode](https://www.cuteqrcode.com/) | Gradients, mosaics, hearts, stars, diamonds, and logo-oriented layouts | Gradient, mosaic, heart, star, and diamond controls. Arbitrary logo overlays remain intentionally absent because they can cover structure |
| [aesthetic-qr-codes](https://github.com/ava-avant-iconic/aesthetic-qr-codes) | Neon circles, glow dots, crystal diamonds, organic hexagons, cyber stars, and soft hearts | **Neon beacon** plus the polygon and symbol families |
| [XStitchify QR Generator](https://xstitchify.com/qr/) | Cross-stitch patterns with sizing, error correction, and a preserved quiet zone | **Cross stitch** uses thread-like X modules and a fabric surface while preserving the same four-module quiet zone |
| [MakeBead QR Pattern Maker](https://makebead.com/qr-code-pattern-maker/) | Perler/mini-bead, cross-stitch, LEGO, tile, painted-grid, and physical-size workflows | **Perler beads** renders glossy bead cells; square and grid recipes serve brick, tile, and painted patterns |
| [Scanvas](https://scanvas.studio/) | QR mosaics built as visual artwork | `mosaic`, `terrazzo`, image art, and seeded repeatable layouts |

## Implemented technique inventory

The core now provides 36 module geometries, 10 recognizable materials, four finder-eye systems, five depth/light treatments, three motion modes, eight general borders plus 47 film scenes, four surround textures, gradients, seeded variation, and local image integration. These controls compose freely rather than being locked to their showcase presets.

The 14 research-derived presets added in this milestone store a source name, URL, and technique note in `StylePreset.credit`. The studio shows the source on each card and a clickable link beside the active preview. Existing presets without a research credit are original combinations built for this repository; generic components still have their lineage documented above.

| Preset | Replicated result | Direct reference |
| --- | --- | --- |
| Classy noir | Joined rounded modules and rounded finder symbols | qr-code-styling |
| Honeycomb | Hexagonal cells and diamond finders | liquid-js QR Code Styling |
| Constellation | Star modules and circular finders | liquid-js QR Code Styling |
| Love letter | Heart modules and postage treatment | liquid-js QR Code Styling |
| Waypoint | Plus modules and diamond finders | liquid-js QR Code Styling |
| Liquid ink | Seeded blob cells | liquid-js QR Code Styling |
| Cross stitch | Thread-cross modules on a paper/fabric surface | XStitchify |
| Perler beads | Round glossy bead cells | MakeBead |
| Isometric blocks | Faceted cubes with colored extrusion | artistic_qr |
| Debossed paper | Offset light/dark bevel layers | artistic_qr |
| Floating sticker | Rounded modules with a soft colored shadow | artistic_qr |
| Neon beacon | Glowing dot field | aesthetic-qr-codes |
| Gradient sweep | Animated SVG gradient over joined modules | artistic_qr |
| Slow pulse | Resting-frame-safe opacity animation | AnimateQR |

## Tools used by this repository

- [node-qrcode](https://github.com/soldair/node-qrcode) creates the standards-compliant matrix and reserved-module map.
- [jsQR](https://github.com/cozmo/jsQR) independently decodes exact payloads from four simulated render conditions.
- [Sharp](https://sharp.pixelplumbing.com/) rasterizes SVG, creates PNG output, and applies the Node-side blur/contrast tests.
- Browser Canvas supplies a separate raster path for the interactive studio and browser tests.
- SVG is the common rendering layer. That keeps procedural geometry inspectable, editable, printable, and animatable without a proprietary service.

The second expansion uses [ZXing-C++ through zxing-wasm](https://github.com/Sec-ant/zxing-wasm) in an offline assessment tool. Useful future validation tools include [OpenCV's QRCodeDetector](https://docs.opencv.org/4.x/de/dc3/classcv_1_1QRCodeDetector.html) as independent decoders, plus a printed test corpus measured across phones, distances, glare, curvature, and physical craft media.


## Second expansion

The [second survey and implementation map](STYLE-RESEARCH-2.md) adds ten shapes and ten credited presets, bringing the collection to 45 presets. It also implements the previously proposed independent ZXing decoder assessment. See that report for source links, deliberate adaptations, tool choices, and reproducible commands.

The [film collection](../examples/film/README.md) now brings the total to 90 presets and 36 shapes, with 117 exact-payload manifest exports and production geometry sidecars.
