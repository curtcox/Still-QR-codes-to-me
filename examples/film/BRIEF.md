# Film styles: a brief

Curt's film *Frog or Axolotl* (a painted, voiced video) shows 117 QR codes that still wear a plain style. This brief asks
Still QR to generate them. `manifest.json` here lists every one: `id`, `style`, `text` (the exact payload), `ecc`, `mode`
(feature = large, about 480 px on a 1920×1080 frame; shelf and card = about 380 px) and `caption` (for context only).

## 1. Styles (47 new presets, ids exactly as below)

Each code dresses as what it points to. It should be recognisable at a glance, still a QR code first. No logos, no real
marks and **no lettering of any kind** (the film paints its own captions).

| id | subjects | look |
|---|---|---|
| bat | *What Is It Like to Be a Bat?* | bat-wing scallops on the frame, sonar arcs, dusk palette |
| beauty-mark | Marilyn Monroe | pink, a beauty-mark emblem, a white halter-dress swirl frame |
| blueprint | recursive self-improvement papers | white-line drafting on blueprint blue (keep dark-on-light: use pale paper with blueprint-blue modules, or prove an inverted version scans), dimension lines on the frame |
| boxing-ring | TESCREAL, Hubris | ropes and corner posts as the frame |
| butterfly | Lyapunov time, chaos theory | a butterfly (Lorenz) attractor loop behind or around the code |
| calendar | AI 2027, AI Futures Project | a calendar page: ring binding on top, a grid frame |
| car-wash | the car wash test | spinning brush rollers at the sides, suds |
| chrome-red-eye | the T-800 | chrome (grey-gradient) modules, a red-eye emblem |
| circuit | Miles Dyson, Skynet | circuit traces between modules, a chip emblem |
| claw | OpenClaw | a lobster claw gripping a corner of the frame |
| compass | Connor Leahy, alignment charts | a compass rose frame, N/E/S/W points (no letters) |
| cube-lattice | the Borg Queen | a green-grey cube lattice |
| dial | Metaculus | a probability dial (gauge arc and needle) |
| door | Pascal's mugging, x-risk, orthogonality | a painted door frame with panels |
| egg | the Alien Queen | an egg emblem, a ribbed frame (kept high contrast) |
| electron-shells | gadolinium, electron configuration | concentric shell orbits with electrons around the code |
| enigma | Alan Turing | Enigma-rotor finder eyes (the 1:1:3:1:1 ratios must hold) |
| feathers | stochastic parrots | feathered modules, a parrot perched on the frame |
| field-radio | Navajo code talkers | turquoise and silver on sand, a field-radio frame |
| filing-drawers | Blockhead, GAZP vs GLUT | a filing-drawer grid |
| flame | the Foom debate, intelligence explosion | a flame frame |
| gills | axolotl | feathery axolotl gills on the frame, pink |
| goalposts | moving the goalposts, OpenAI Charter | goalposts framing the code |
| gold-android | Lt. Commander Data | gold modules, a yellow-eye emblem |
| gold-scales | SolidGoldMagikarp, glitch tokens | gold fish-scale modules |
| grass | Whitman, *Song of Myself* | modules as grass blades |
| hashchain | 256t.org, hashbin.org, content addressing | hash-chain links between modules |
| honeycomb | the Formics, *Ender's Game* | hexagonal honeycomb (an existing `honeycomb` preset may be reused or restyled; keep the id) |
| lobster-shell | Crustafarianism, Moltbook | segmented lobster shell |
| mask | *The Stranger* | a mask hung on the frame's corner, a piano-key border |
| maze | P vs NP | a maze border |
| mic | podcasts (Dwarkesh, *Intelligent Machines*) | a painted microphone |
| mirror | the mirror test | a mirror frame, a glint |
| ocean | Solaris, Stanisław Lem | rippling-ocean blues |
| oom-bars | *Situational Awareness*, OOMs | stacked order-of-magnitude bars |
| paw-prints | the Tines, Vernor Vinge | paw-print modules |
| pulp | John W. Campbell, *Astounding* | a pulp-magazine look: yellowed stock, a rocket or ray-gun frame |
| rulebook | the Chinese Room | a rule-book page |
| signpost | *Life 3.0* | a futures signpost (blank arms) |
| song-waves | the Rachni Queen | song waves (sound ripples) |
| staircase | scaling laws | a rising staircase |
| switchboard | Constitutional Classifiers | a switchboard with patch cords |
| tentacles | the shoggoth meme | a tentacle frame, a smiley-mask emblem |
| thermometer | Landauer's principle | a thermometer |
| tv | debate videos | an old TV set around the code |
| two-mics | *Hard Fork*, Roose & Newton | two microphones |
| winged-sandal | Hermes Agent | a winged sandal |

## 2. What must hold for every code (the film's scan rules)

- Dark modules on a light ground, luminance contrast at least 7:1, flat fills in the scanner-facing area (no texture,
  gradient or shadow that drops contrast inside modules).
- A 4-module quiet zone. Frames, props and scenery go only **outside** the quiet zone.
- Finder eyes keep their 1:1:3:1:1 proportions along every line through their centre (they may round, not break).
- A centre emblem only at ECC H, clearing at most about 7% of the modules.
- Every entry in `manifest.json` must decode to its exact `text`, with the preset, at its `ecc`, at 380 px (and 480 px
  for `feature`), with the repo's existing checks and its independent decoder.

## 3. Tooling the film needs

1. `--ecc L|M|Q|H` on the CLI (the library already takes `errorCorrection`).
2. **Whole-pixel modules:** `--module-px N` so each module is exactly N px and the grid sits on whole pixels.
3. **No frame** option (`--frame none` or similar): the code alone with its quiet zone, keeping the preset's colours and
   module shapes, for small shelf codes.
4. A **sidecar JSON** per PNG: the code's box inside the image (x, y, width, height, quiet zone included), module count,
   module px, version, ECC, and how far the frame extends beyond the code on each side.
5. **Batch mode:** `npm run qr -- --batch examples/film/manifest.json --out-dir examples/film/out` renders every entry
   (PNG + sidecar), runs the scan checks, and writes `examples/film/out/report.json` and a short `report.md`
   (pass/fail per entry and condition). Output files may be overwritten in batch mode.
6. A contact sheet `examples/film/out/sheet.png` of all 47 styles (one code each) for a quick visual review.

Keep everything offline and deterministic (the same input gives the same bytes). Add tests for the new CLI options and
batch mode. Update the README's counts. Commit locally when it all passes; do not push.
