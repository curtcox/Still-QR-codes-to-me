# Still QR

**A code with character.** An offline TypeScript toolkit and visual playground for distinctive QR codes that remain testable as QR codes.

Twelve starting styles combine **12 module shapes × 8 borders × 4 textures**, independent ink/paper/accent colors, optional gradients, and deterministic seeds. That's 384 structural combinations before palettes and textures vary. Not every combination or payload is guaranteed to scan: the project includes real decoding checks to measure the result.

## Start the studio

Requires Node.js 22 or newer and npm. Installation needs network access; generation and the studio do not call external services or load external fonts.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Enter a payload, pick a style, remix the controls, and run scan checks. Export SVG for scalable artwork or PNG at 256–4096 pixels. Save and load JSON recipes to reproduce a design. Recipe files contain artwork settings, not the payload.

```sh
npm run build        # library/CLI → dist/; static playground → web-dist/
npm run preview      # serve the built playground locally
npm run gallery      # 12 SVGs + PNGs + scan-report.json → examples/generated/
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

## The starting collection

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

These are independently composable techniques, not an assertion of historical novelty. Conservative/experimental labels describe the extent of stylization, not a scan guarantee.

## Reliability by construction, then by measurement

- The encoder is [node-qrcode](https://github.com/soldair/node-qrcode). High (`H`) error correction is the default. This is not permission to erase an arbitrary percentage of the artwork.
- Finder, separator, timing, alignment, format, version, and other reserved modules remain unchanged.
- A solid four-module quiet zone surrounds the encoded matrix. Borders and textures stay outside that zone. Structural modules use solid ink even with a gradient.
- The built-in controls require a light background and at least 4.5:1 ink-to-paper contrast (including both gradient endpoints). This is a project guardrail, not a QR standards compliance test.
- [jsQR](https://github.com/cozmo/jsQR) decodes rasterized output and compares the exact payload. The four checks are native export resolution, reduced resolution (up to 256 px), mild blur, and reduced contrast. Browser Canvas and Sharp use different blur/rasterization implementations, so their results can differ.
- Checks are cleared whenever the current artwork or payload changes. Dense payloads and small export sizes get a warning. Failed checks remain visible; the studio permits exporting experiments.

Before production use, test the actual printed material or screen with several phones, at the intended distance and lighting. Foil, embroidery, reflective substrates, low-resolution printing, perspective, camera motion, and physical wear are not simulated here. The default preview is slightly rotated for presentation; downloaded artwork is upright.

## Extend the collection

See [the extension guide](docs/EXTENDING.md) for the recipe contract, custom module renderers, and the optional future AI asset boundary. See [the roadmap](docs/ROADMAP.md) for the larger collection strategy.

```sh
npm run check        # type checking + core/scan tests + production build
npx playwright install chromium  # one-time browser install, if needed
npm run test:browser # desktop/mobile studio, every preset's browser scan, downloads
```

The core suite covers 48 preset/payload pairs under four scan conditions, additional remixes, dense payloads, XML escaping, invalid recipes, seeded determinism, custom artwork clipping, and structural/quiet-zone preservation. Browser tests exercise real SVG rasterization, scan checks, recipes, downloads, filters, and a mobile viewport. GitHub Actions runs both suites.

## Repository map

- `src/core/` — presets, recipe types, deterministic SVG renderer, decoder, Node image utilities
- `src/web/` — local visual playground and browser rasterization
- `src/cli.ts` — command-line interface
- `tests/` — rendering and decode tests, CLI tests, browser integration tests
- `scripts/gallery.ts` — reproducible example exports and scan reports
- `docs/` — extension contract and roadmap

MIT licensed. No accounts, tracking, hosted redirects, paid APIs, or AI models are required. No prompt-to-image or natural-language generation is implemented yet.
