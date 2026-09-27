# Still QR

**A code with character.** An offline TypeScript toolkit and visual playground for distinctive QR codes that remain testable as QR codes.

Ninety presets span **36 module geometries, 10 material modes, 4 finder-eye systems, 5 depth/light effects, and 3 motion modes**. Bamboo, oak, beans, ants, fire, ice, clouds, ripples, and leaves carry recognizable internal structure rather than palette changes. Research-derived additions cover classy joins, symbols, polygons, craft patterns, isometric blocks, embossing, shadows, neon, and animated SVG. A separate image-art mode integrates local photographs and illustrations using protected module centers and scan-guided refinement. Eight general borders plus 47 film scenes, four surround textures, gradients, palettes, and deterministic seeds compose with the other controls. Not every combination or payload is guaranteed to scan: the project includes real decoding checks to measure the result.

## Start the studio

Requires Node.js 22 or newer and npm. Installation needs network access; generation and the studio do not call external services or load external fonts.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Enter a payload, pick a style, remix the controls, and run scan checks. Use **Inspect texture** to magnify surface detail; exports always contain the full code. Export SVG for scalable artwork or PNG at 256–4096 pixels. Save and load JSON recipes to reproduce a design. Recipe files contain procedural settings, not the payload. In image mode, choose a bundled bamboo/ice/fire image or load a local PNG/JPEG/WebP, adjust image freedom, and use **Refine for scanning**. Image SVGs contain embedded raster artwork; they are not infinitely detailed vectors. Image source files are not included in procedural recipe exports.

```sh
npm run build        # library/CLI → dist/; static playground → web-dist/
npm run preview      # serve the built playground locally
npm run gallery      # 90 styles + 3 image compositions + scan reports → examples/generated/
```

## CLI

```sh
npm run qr -- --list
npm run qr -- 'https://example.com/hello' --style botanical -o botanical.svg --check
npm run qr -- 'Hello, world' --style letterpress -o postcard.png --size 1024
npm run qr -- 'https://example.com' --recipe my-recipe.json -o custom.svg --check
```

After building, `node dist/cli.js` runs the same CLI without TypeScript tooling. The package also declares a `still-qr` executable for local installation. This package has not been published to a registry.

Output defaults to SVG on stdout. Diagnostics go to stderr. Existing output files are preserved: choose a new filename to export again. `--check` returns exit code **2** when any scan condition fails; the output remains available for inspection. Invalid input returns **1**. These checks do not claim certification or universal device compatibility.

## Library

```ts
import { generateQR, presets } from 'still-qr-codes-to-me';
import { checkScannability, toPNG } from 'still-qr-codes-to-me/node';

const text = 'https://example.com/hello';
const code = generateQR({
  text,
  style: 'botanical',
  size: 1024,
  recipe: { foreground: '#23452d', border: 'postage', seed: 123 },
});

console.log(code.svg, code.warnings);
const png = await toPNG(code.svg);
const checks = await checkScannability(code.svg, text);
```

The root export is browser-compatible. The `/node` export adds Sharp-based PNG output and scan checks. Locally, build first and import `./dist/core/index.js` and `./dist/core/node.js` directly, or install the local package into another project.

## Film production

The [Frog or Axolotl brief and exports](examples/film/README.md) add 47 themed styles (45 new IDs plus restyled `circuit` and `honeycomb`). Large painted hero props sit outside the quiet zone, with up to 14 modules of frame on each side; scanner-facing ink is flat and at least 7:1 against its paper.

```sh
npm run qr -- --batch examples/film/manifest.json --out-dir examples/film/out --module-px 8 --transparent
npm run qr -- --batch examples/film/manifest.json --out-dir examples/film/out-noframe --module-px 8 --transparent --frame none
npm run qr -- 'https://example.com' --style bat --ecc M --module-px 6 --frame none -o bat.png
```

Batch writes PNGs, geometry sidecars, per-condition reports, and a 47-style contact sheet. It checks all 117 exact manifest payloads at 380px, plus 480px for features, with jsQR and ZXing. `--module-px` gives integral module pitch, with optional per-entry `modulePx` overrides. `--transparent` preserves the opaque cream plate while leaving unpainted surroundings transparent; `--frame none` keeps only the code and its four-module quiet zone. Ordinary procedural PNG exports also get same-stem JSON sidecars. Single exports preserve existing files; batch exports may overwrite them. See the [film output contract](examples/film/README.md) for coordinates, exit codes, and deterministic reproduction.

## Image integration

```sh
npm run qr -- 'https://example.com/hello' --artwork public/artwork/bamboo-grove.png --strength 0.9 --refine -o bamboo-art.png
```

```ts
import { loadArtwork, refineImageQR } from 'still-qr-codes-to-me/node';
import { readFile } from 'node:fs/promises';

const artwork = await loadArtwork(await readFile('photo.png'));
const result = await refineImageQR({ text: 'https://example.com', artwork, strength: 0.9, size: 1024 });
console.log(result.passed, result.attempts, result.svg);
```

The compositor center-crops the image, selects a legal QR mask that reduces tonal conflict, and changes local brightness around data-module centers. Structural cells remain solid. Greater image freedom retains more original detail between centers. Refinement tests a finite sequence of decreasing freedom values, stopping at the first setting that passes all four conditions, or reporting failure. Even a failed result is available for inspection. Source artwork stays local; SVG output is self-contained.

This is CPU-based image projection, **not a diffusion model**. Read the [research comparison](docs/RESEARCH.md) for QRBTF, Text2QR, DiffQRCoder, what we implemented, and the remaining gap. The broader [style atlas and source credits](docs/STYLE-ATLAS.md) records the vector, image, motion, depth, and craft systems surveyed and maps them to independent local implementations. The three bundled source images were made with the built-in imagegen tool; [exact prompts and provenance](public/artwork/PROVENANCE.md) are included.

## More styles and an independent decoder

The [second research survey](docs/STYLE-RESEARCH-2.md) reviews 15 additional or revisited tools and sources. Ten new credited presets reproduce gapped tiles, neighbor-aware contours, connected capsules, diagonal hatching, sketched curves, flowers, segmented grids, arrows, and waves. That milestone brought the collection to 45 presets and 31 shapes; the film collection now expands it to 90 presets and 36 shapes.

![New styles and source credits](docs/style-expansion.png)

Run `npm run assess` to compare jsQR and ZXing-C++ on all presets under four render conditions and four payloads. Results go to `examples/generated/decoder-report.json`; either decoder failing returns status 2. ZXing loads its installed WASM locally for assessment, film batch generation, and tests; it is not included in the browser bundle. Run `npm run style-sheet` to regenerate the comparison image.

## The collection

| Style | Distinctive technique | Starting use cases | Class |
| --- | --- | --- | --- |
| Editorial | Square modules, double-rule frame | Book jackets, menus | Conservative |
| Soft stone | Rounded blocks, subtle paper surround | Wellness, ceramics | Conservative |
| Orbital | Circular modules, orbit arcs | Science, music | Experimental |
| Prism | Diamonds, jewel gradient, deco frame | Jewelry, fashion | Experimental |
| Candy | Squircles and ticket border | Bakeries, celebrations | Conservative |
| Signal | Horizontal ribbons and technical grid | Wayfinding, technology | Conservative |
| Reeds | Vertical strokes and botanical border | Gardens, farm shops | Conservative |
| Woven | Alternating horizontal/vertical threads | Textiles, crafts | Experimental |
| Terrazzo | Seeded irregular tiles and speckles | Interiors, architecture | Experimental |
| Circuit | Neighbor-aware traces and contact points | Electronics, workshops | Experimental |
| Botanical | Leaf-like modules and growing stems | Florists, tea | Experimental |
| Letterpress | Variable ink dots and postage border | Postcards, zines | Experimental |

The nine additional experimental material presets use these mechanisms:

| Material | Surface and geometry |
| --- | --- |
| Bamboo | Connected cane segments, transverse nodes, longitudinal fibers |
| Oak | Grain curves, elongated knots, continuous carved lines |
| Beans | Rotated bean silhouettes, dark center grooves, side highlights |
| Ants | Six legs, antennae, head/thorax/abdomen silhouettes |
| Fire | Curling flame tongues and ember highlights |
| Ice | Crystal facets and continuous branching fractures |
| Clouds | Billowing overlapping lobes and rounded highlights |
| Ripples | Local wavelets and continuous overlapping wave fronts |
| Leaves | Alternating leaves, central ribs, branching veins |

Fourteen additional source-credited presets demonstrate the expanded tools:

| Family | Presets | New controls |
| --- | --- | --- |
| Joined and symbolic geometry | Classy noir, Honeycomb, Constellation, Love letter, Waypoint, Liquid ink | Classy, hexagon, star, heart, cross, and fluid modules; rounded, circular, and diamond eyes |
| Physical craft | Cross stitch, Perler beads | Thread crosses, glossy beads, fabric/paper texture, grid surround |
| Depth and lighting | Isometric blocks, Debossed paper, Floating sticker, Neon beacon | Cube faces, extrusion, bevel layers, shadows, glow |
| Motion | Gradient sweep, Slow pulse | Self-contained SVG animation with a stable initial frame |

Choose a material independently of the preset palette. Material geometry replaces the module shape control; detail controls highlights, and the seed varies supported features such as bean rotation, grain, and fracture placement. Built-in material illustrations remain vector SVGs.

These are independently composable techniques, not an assertion of historical novelty. Each research-derived preset carries a clickable source in the studio and structured credit in the library data. Conservative/experimental labels describe the extent of stylization, not a scan guarantee.

## Reliability by construction, then by measurement

- The encoder is [node-qrcode](https://github.com/soldair/node-qrcode). High (`H`) error correction is the default. This is not permission to erase an arbitrary percentage of the artwork.
- Separator, timing, alignment, format, version, and other reserved modules remain exact. Finder eyes can use square, rounded, circular, or diamond outer/inner symbols while keeping a high-contrast 7×7 footprint.
- A solid four-module quiet zone surrounds the encoded matrix. Borders and surround textures stay outside that zone; material detail is also drawn inside data cells. Structural modules use solid ink even with a gradient.
- The built-in controls require a light background and at least 4.5:1 ink-to-paper contrast (including both gradient endpoints). This is a base-palette guardrail, not a measurement of every highlight or a QR standards compliance test. Image mode instead uses local tone projection and requires its own scan checks.
- [jsQR](https://github.com/cozmo/jsQR) decodes rasterized output and compares the exact payload. The four checks are native export resolution, reduced resolution (up to 256 px), mild blur, and reduced contrast. Browser Canvas and Sharp use different blur/rasterization implementations, so their results can differ.
- Checks are cleared whenever the current artwork or payload changes. Dense payloads and small export sizes get a warning. Failed checks remain visible; the studio permits exporting experiments.

Before production use, test the actual printed material or screen with several phones, at the intended distance and lighting. Foil, embroidery, reflective substrates, low-resolution printing, perspective, camera motion, and physical wear are not simulated here. Preview and downloaded artwork are upright.

## Extend the collection

See [the extension guide](docs/EXTENDING.md) for the recipe contract, custom module renderers, and the optional future AI asset boundary. See [the roadmap](docs/ROADMAP.md) for the larger collection strategy.

```sh
npm run check        # type checking + core/scan tests + production build
npx playwright install chromium  # one-time browser install, if needed
npm run test:browser # desktop/mobile studio, every preset's browser scan, downloads
```

The film suite additionally checks all 117 manifest entries at their required ECC and sizes with both decoders, quiet-zone pixels, geometry, and batch determinism. The core suite covers 360 preset/payload pairs under four scan conditions, every module shape in a mixed recipe, additional remixes, dense payloads, XML escaping, invalid recipes, seeded determinism, custom artwork clipping, structural/quiet-zone preservation, and image composition/refinement. Browser tests exercise real SVG rasterization, scan checks, recipes, downloads, filters, and a mobile viewport. GitHub Actions runs both suites.

## Repository map

- `src/core/` — presets, recipe types, deterministic SVG renderer, decoder, Node image utilities
- `src/web/` — local visual playground and browser rasterization
- `src/cli.ts` — command-line interface
- `tests/` — rendering and decode tests, CLI tests, browser integration tests
- `scripts/gallery.ts` — reproducible example exports and scan reports
- `docs/` — extension contract and roadmap

MIT licensed. No accounts, tracking, hosted redirects, paid APIs, or AI models are required. Runtime prompt-to-image generation and natural-language interpretation are not implemented; existing images can be imported and integrated.

## GitHub Pages deployment

The `Deploy GitHub Pages` workflow in `.github/workflows/pages.yml` checks the project, builds `web-dist/`, tests the production site in Chromium, and deploys it on pushes to `main`. It can also be run manually from the Actions tab. Deployment runs only from `main`.

One-time setup: in the repository's **Settings → Pages → Build and deployment**, select **GitHub Actions** as the source. See [GitHub's publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). No personal access token or deployment secret is needed; the deployment job uses the built-in GitHub token and OIDC permissions.

For this repository, the default Pages URL is `https://curtcox.github.io/Still-QR-codes-to-me/`. The workflow reads the actual base path from `configure-pages`, supporting both repository paths and configured custom domains. Artwork thumbnails and image loading use Vite's base URL. Local development continues to use `/`.

Reproduce the repository-path build and deployment smoke test locally:

```sh
PAGES_BASE_PATH=/Still-QR-codes-to-me/ npm run build
PAGES_BASE_PATH=/Still-QR-codes-to-me/ npm run test:pages
```

Run `npm run build` again to return the local production output to the root path.
