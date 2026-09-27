# Research: from decorated squares to integrated materials

Reviewed September 27, 2026. These primary sources informed the second milestone; this is a focused survey, not an exhaustive benchmark or a claim of parity with the best diffusion systems.

## What existing work can do

**QRBTF / Latent Cat.** The project's examples integrate QR structure into illustrated and rendered scenes using QR-conditioned ControlNet. Their progression from geometric beautification to scene generation is directly relevant: changing a module's outline is only the first rung. [Project documentation](https://docs.qrbtf.com/), [technical showcase and examples](https://latentcat.com/en/blog/qrcode-controlnet).

**Text2QR (CVPR 2024).** Uses an aesthetic blueprint to guide image generation, followed by latent refinement for scanning robustness. The useful principle here is to plan visual content and QR structure together, then improve readability through refinement. We did not reproduce their latent optimizer or run their experiments. [Paper and abstract](https://openaccess.thecvf.com/content/CVPR2024/html/Wu_Text2QR_Harmonizing_Aesthetic_Customization_and_Scanning_Robustness_for_Text-Guided_QR_CVPR_2024_paper.html), [authors' repository](https://github.com/mulns/Text2QR).

**DiffQRCoder (WACV 2025).** Couples diffusion-based generation with scan-robust guidance and iterative refinement. The authors report improving a ControlNet-only scanning success rate from 60% to 99% in their evaluation. That is their result under their setup, not a universal guarantee or a result measured for this repository. It reinforces the need to decode rendered results and refine unsuccessful ones. [Paper](https://arxiv.org/abs/2409.06355), [full text](https://arxiv.org/html/2409.06355v2).

**Artistic QR Code Embellishment (2013).** Earlier work already investigated stylizing modules and embedding imagery while retaining scanability. Material-shaped modules are a useful mechanism, not a new invention merely because we add them to this repository. [Original publication](https://onlinelibrary.wiley.com/doi/10.1111/cgf.12221).

## Implemented response

| Capability | This repository's implementation | Remaining gap |
| --- | --- | --- |
| Recognizable materials | Bamboo fibers and nodes; oak grain/knots; creased beans; segmented ants; flames; fractured ice; cloud lobes; ripples; leaf veins | Procedural vector illustration, not photoreal synthesis |
| Texture inside the code | Motif geometry and continuous fields clipped into data modules | Visible standard structural patterns remain |
| Arbitrary image integration | Local PNG/JPEG/WebP artwork, content-aware selection among eight legal QR masks, smooth module-center tone projection | Original scene is remapped, not regenerated to follow QR geometry |
| Adjustable art/readability balance | Image-freedom control with protected structure and clear margin | High settings may fail for a given payload or source |
| Scan-guided repair | Test exact payload; reduce freedom through a finite schedule until all four checks pass, or report failure | Deterministic parameter search, not learned or latent-space refinement |
| Reproducible examples | Generated bamboo, ice and fire source artwork; exact prompts; deterministic transforms; JSON scan reports | No claim of broad real-device/print validation |

The image compositor is inspired by the importance of module-center information and iterative checking. It is **not an implementation of Text2QR, DiffQRCoder, or ControlNet**. It works on CPU in a browser or Node and requires no model, credentials, or network at generation time. Source images can come from a camera, illustration tool, local model, or any provider the user chooses.

## Evidence and limits

`npm run gallery` exports all presets and three image compositions with exact-payload scan reports. The automated suites include short text, URLs, Unicode, Wi-Fi payloads, raster output, structural preservation, and recipe composition. Browser and Sharp renderers are tested independently, but both use jsQR as their decoder.

A local failure was instructive: allowing source texture inside finder patterns passed reduced-size checks yet failed native resolution. Making all reserved cells solid restored detection for the bamboo sample. A pale crease through a bean's center also failed one browser-native check; a dark groove preserved the material feature and the module signal.

Next research work should include an independent decoder, physical printing/camera measurements, broader source/payload corpora, and optionally a local QR-conditioned diffusion backend. Photorealistic scene restructuring remains the largest gap between this implementation and the showcased research systems.
