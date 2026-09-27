import { generateQR, presets, getPreset, shapes, borders, textures, materials, type RasterArtwork, type Recipe, type GeneratedQR } from '../core/index.js';
import { download, rasterize, scan, readArtwork, renderArtwork } from './browser.js';
import './style.css';

const artworkURL = (name: string) => `${import.meta.env.BASE_URL}artwork/${name}.png`;
const app = document.querySelector<HTMLDivElement>('#app')!;
const options = (values: readonly string[]) => values.map(v => `<option value="${v}">${v[0].toUpperCase() + v.slice(1)}</option>`).join('');
app.innerHTML = `
<header class="topbar"><a href="#" class="brand" aria-label="Still QR home"><span class="brand-mark">▦</span> STILL QR</a><div class="header-note">A little less ordinary. Still a QR code.</div><a href="#collection" class="nav-link">Explore the collection <span>↗</span></a></header>
<main>
<section class="intro"><div><p class="eyebrow">THE QR CODE, RECONSIDERED</p><h1>A code with<br><em>character.</em></h1><p class="intro-copy">For the things you make, the places you build,<br class="desktop-break"> and the stories waiting on the other side.</p></div><div class="intro-aside"><span class="small-star">✳</span><p>${presets.length} starting points.<br>Thousands of combinations.<br>Entirely yours.</p><span class="local-tag"><i></i> MADE LOCALLY. NO UPLOADS.</span></div></section>
<section class="studio" aria-label="QR code studio">
<div class="controls"><div class="section-label"><span>01 / MAKE IT YOURS</span><button id="reset" class="text-button">Reset ↺</button></div>
<label class="field-label" for="payload">Where should it lead?</label><textarea id="payload" rows="2" spellcheck="false">https://example.com/hello</textarea><p class="field-hint">A link, a note, a Wi-Fi string. Whatever opens a door.</p>
<div class="mode-picker"><label>Rendering mode<select id="mode"><option value="material">Shapes & materials</option><option value="image">Image art</option></select></label></div>
<div id="image-controls" hidden><p class="field-hint">Let a photograph or illustration become the code. Source artwork stays on this device.</p><div class="sample-artworks"><button data-art="bamboo-grove" aria-label="Use bamboo artwork"><img src="${artworkURL('bamboo-grove')}" alt="" loading="lazy">Bamboo</button><button data-art="glacial-ice" aria-label="Use ice artwork"><img src="${artworkURL('glacial-ice')}" alt="" loading="lazy">Ice</button><button data-art="embers" aria-label="Use fire artwork"><img src="${artworkURL('embers')}" alt="" loading="lazy">Fire</button></div><label class="upload-label">Choose PNG, JPEG or WebP<input id="art-file" type="file" accept="image/png,image/jpeg,image/webp"></label><p id="art-name" class="field-hint">No artwork selected.</p><label class="slider-label">Image freedom <output id="strength-value">70%</output><input id="strength" type="range" min="0" max="1" step=".05" value=".7"></label><p class="field-hint">More freedom reveals the image between module centers. Refine for scanning to find a tested balance.</p><button id="refine" class="check-button" disabled>Refine for scanning ↗</button></div>
<div id="material-controls"><div class="control-heading">Material & surface</div><label class="field-label">Material<select id="material">${options(materials)}</select></label><label class="slider-label">Surface detail<input id="detail" type="range" min="0" max="1" step=".05"></label><p class="field-hint">Materials replace module shapes with fibers, grain, veins, facets, or organic silhouettes.</p>
<div class="control-heading">The essentials</div>
<div class="field-grid"><label>Module shape<select id="shape">${options(shapes)}</select></label><label>Border<select id="border">${options(borders)}</select></label></div>
<div class="field-grid"><label>Texture<select id="texture">${options(textures)}</select></label></div>
<div class="control-heading">Set the mood</div><div class="colors"><label><input id="foreground" type="color">Ink</label><label><input id="background" type="color">Paper</label><label><input id="accent" type="color">Accent</label></div>
<label class="checkbox"><input id="gradient" type="checkbox">Blend ink into accent</label>
<div class="seed-row"><label for="seed">Texture seed</label><input id="seed" type="number" min="0" max="4294967295" step="1"><button id="shuffle" class="icon-button" aria-label="Randomize texture seed">↻</button></div>
</div><div class="export-size"><label>Export size<select id="size"><option value="256">256 × 256 px</option><option value="512">512 × 512 px</option><option value="1024" selected>1024 × 1024 px</option><option value="2048">2048 × 2048 px</option><option value="4096">4096 × 4096 px</option></select></label></div><div class="recipe-actions"><button id="save-recipe" class="text-button">Save recipe ↓</button><button id="load-recipe" class="text-button">Load recipe ↑</button><input id="recipe-file" type="file" accept="application/json,.json" hidden></div>
<p id="error" class="error" role="alert" hidden></p>
</div>
<div class="preview-panel"><div class="preview-heading"><span>LIVE PREVIEW</span><button id="detail-view" class="text-button" aria-pressed="false">Inspect texture ↗</button><span id="style-index">01 — 12</span></div><div class="preview-stage"><div id="preview" class="preview-art"></div></div><div class="preview-caption"><div><h2 id="style-name">Editorial</h2><p id="style-description"></p></div><span id="safety-badge" class="badge"></span></div><div class="export-row"><button id="download-svg" class="primary-button">Download SVG <span>↓</span></button><button id="download-png" class="secondary-button">PNG <span>↓</span></button></div><p class="export-note">Vector for print. Pixels for everything else.</p></div>
<div class="scan-panel"><div class="section-label">02 / KEEP IT READABLE</div><h3>Good looks. <br>Working links.</h3><p class="scan-copy">Distinctive on the outside. <br>A real QR code underneath.</p><div class="scan-metrics"><div><span>Correction</span><strong>High · H</strong></div><div><span>Quiet zone</span><strong>4 modules</strong></div><div><span>Ink contrast</span><strong id="contrast">—</strong></div><div><span>QR matrix</span><strong id="matrix">—</strong></div></div><button id="check" class="check-button">Run scan checks <span>↗</span></button><div id="scan-results" aria-live="polite"><p class="muted">Test this design at full size, reduced size, with blur, and with lower contrast.</p></div><p id="warnings" class="warning"></p><p class="scan-footnote">Simulated checks are a starting point. Test with a phone at your intended screen or print size.</p></div>
</section>
<section id="collection" class="collection"><div class="collection-heading"><div><p class="eyebrow">PICK A PERSONALITY</p><h2>The growing collection<span> / ${presets.length}</span></h2></div><div class="filters" role="group" aria-label="Filter styles"><button data-filter="all" aria-pressed="true">All styles</button><button data-filter="materials" aria-pressed="false">Materials</button><button data-filter="conservative" aria-pressed="false">Conservative</button><button data-filter="experimental" aria-pressed="false">Experimental</button></div></div><div id="gallery" class="gallery"></div><p class="gallery-note">Conservative styles use fuller modules. Experimental styles reshape them more aggressively. Every combination needs its own scan check.</p></section>
<section class="principles"><div><span>01</span><h3>Mix, don’t settle.</h3><p>Every style is a recipe. Swap its shape, change its palette, give it a different frame.</p></div><div><span>02</span><h3>Keep the character.</h3><p>Save the recipe and reuse it. Seeded textures make the same design repeatable.</p></div><div><span>03</span><h3>Take it with you.</h3><p>Your code, your file. No redirects, no accounts, no expiring links added by us.</p></div></section>
</main><footer><a class="brand" href="#">STILL QR</a><span>Distinctive by design. Readable by intention.</span><span>OPEN SOURCE / MIT</span></footer><div id="toast" role="status" hidden></div>`;

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
let styleId = 'bamboo';
let artwork: RasterArtwork | undefined;
let artworkLoad = 0;
let recipe: Recipe = { ...getPreset(styleId).recipe };
let current: GeneratedQR | undefined;
let revision = 0;
let checking = false;
let filter = 'all';
let payload = input('payload').value;
function toast(message: string) { el('toast').textContent = message; el('toast').hidden = false; setTimeout(() => { el('toast').hidden = true; }, 3500); }
function syncControls() {
  for (const [key, value] of Object.entries(recipe)) {
    if (key === 'gradient') input(key).checked = Boolean(value);
    else input(key).value = String(value);
  }
}
function update() {
  revision++;
  payload = input('payload').value;
  el('scan-results').innerHTML = '<p class="muted">Design changed. Run scan checks for this version.</p>';
  try {
    const imageMode = input('mode').value === 'image';
    el('image-controls').hidden = !imageMode;
    el('material-controls').hidden = imageMode;
    input('shape').disabled = recipe.material !== 'none';
    current = generateQR({ text: payload, style: styleId, recipe, size: Number(input('size').value) });
    if (imageMode) {
      if (!artwork) throw new Error('Choose local artwork or use the bamboo sample.');
      const rendered = renderArtwork({ text: payload, artwork, size: current.size, strength: Number(input('strength').value) });
      current = { ...current, svg: rendered.svg, moduleCount: rendered.moduleCount, warnings: ['Experimental image integration: run scan checks or refine before exporting. SVG contains embedded raster artwork.'] };
    }
    el('preview').innerHTML = current.svg;
    el('error').hidden = true;
    el('contrast').textContent = imageMode ? 'Tone mapped' : `${current.contrast.toFixed(1)} : 1`;
    el('matrix').textContent = `${current.moduleCount} × ${current.moduleCount}`;
    el('warnings').textContent = current.warnings.join(' ');
    const custom = JSON.stringify(recipe) !== JSON.stringify(getPreset(styleId).recipe);
    el('style-name').textContent = imageMode ? 'Image art' : getPreset(styleId).name + (custom ? ' · remixed' : '');
    el('style-description').textContent = imageMode ? 'Image detail preserved between protected QR module centers.' : getPreset(styleId).description;
    const experimental = current.warnings.some(w => w.startsWith('Experimental'));
    el('safety-badge').textContent = experimental ? 'Experimental' : 'Conservative';
    el('safety-badge').classList.toggle('experimental', experimental);
    el('style-index').textContent = `${String(presets.findIndex(p => p.id === styleId) + 1).padStart(2, '0')} — ${presets.length}`;
  } catch (error) {
    current = undefined;
    el('preview').innerHTML = '<div class="empty-preview">A little adjustment needed.<br><small>Check the message beside your controls.</small></div>';
    el('error').textContent = error instanceof Error ? error.message : String(error);
    el('error').hidden = false;
    el('contrast').textContent = el('matrix').textContent = '—';
    el('warnings').textContent = '';
  }
  for (const id of ['download-svg', 'download-png', 'save-recipe']) el<HTMLButtonElement>(id).disabled = !current;
  el<HTMLButtonElement>('check').disabled = !current || checking;
  el<HTMLButtonElement>('refine').disabled = !current || checking || !artwork;
  el<HTMLButtonElement>('save-recipe').disabled = !current || input('mode').value === 'image';
  document.querySelectorAll<HTMLButtonElement>('[data-style]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.style === styleId)));
}
function renderGallery() {
  el('gallery').innerHTML = [...presets].sort((a, b) => Number(b.recipe.material !== 'none') - Number(a.recipe.material !== 'none')).filter(p => filter === 'all' || (filter === 'materials' ? p.recipe.material !== 'none' : p.safety === filter)).map(p => {
    const thumbnail = generateQR({ text: 'https://example.com/hello', style: p.id, size: 256 }).svg;
    return `<button class="style-card" data-style="${p.id}" aria-pressed="${styleId === p.id}" aria-label="Use ${p.name} style"><div class="card-art">${thumbnail}<span class="card-arrow">↗</span></div><div class="card-title"><h3>${p.name}</h3><span>${String(presets.indexOf(p) + 1).padStart(2, '0')}</span></div><p>${p.inspiration}</p><span class="card-category">${p.safety}</span></button>`;
  }).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-style]').forEach(button => button.addEventListener('click', () => {
    styleId = button.dataset.style!;
    input('mode').value = 'material';
    recipe = { ...getPreset(styleId).recipe };
    syncControls(); update();
    if (window.innerWidth < 900) el('preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}
for (const key of Object.keys(recipe) as (keyof Recipe)[]) input(key).addEventListener('input', () => {
  recipe = { ...recipe, [key]: key === 'gradient' ? input(key).checked : ['seed', 'detail'].includes(key) ? Number(input(key).value) : input(key).value };
  update();
});
input('payload').addEventListener('input', update);
input('size').addEventListener('change', update);
el('reset').addEventListener('click', () => { recipe = { ...getPreset(styleId).recipe }; input('strength').value = '.7'; el('strength-value').textContent = '70%'; syncControls(); update(); });
el('detail-view').addEventListener('click', () => { const zoomed = el('preview').classList.toggle('detail-view'); el('detail-view').setAttribute('aria-pressed', String(zoomed)); el('detail-view').textContent = zoomed ? 'View full code ↙' : 'Inspect texture ↗'; });
el('shuffle').addEventListener('click', () => { recipe.seed = crypto.getRandomValues(new Uint32Array(1))[0]; syncControls(); update(); });
el('download-svg').addEventListener('click', () => { if (current) download(new Blob([current.svg], { type: 'image/svg+xml' }), `still-qr-${styleId}.svg`); });
el('download-png').addEventListener('click', async () => {
  if (!current) return;
  const snapshot = current, name = styleId;
  try {
    const canvas = await rasterize(snapshot.svg, snapshot.size);
    canvas.toBlob(blob => { if (blob) download(blob, `still-qr-${name}.png`); else toast('PNG export failed. Please try SVG.'); }, 'image/png');
  } catch (error) { toast(`Export failed: ${String(error)}`); }
});
el('save-recipe').addEventListener('click', () => { download(new Blob([JSON.stringify(recipe, null, 2) + '\n'], { type: 'application/json' }), `still-qr-${styleId}.json`); });
el('load-recipe').addEventListener('click', () => input('recipe-file').click());
input('recipe-file').addEventListener('change', async () => {
  const file = input('recipe-file').files?.[0];
  if (!file) return;
  try {
    if (file.size > 16384) throw new Error('Recipe files must be smaller than 16 KB.');
    const parsed: unknown = JSON.parse(await file.text());
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected a JSON recipe object.');
    const known = Object.fromEntries(Object.entries(parsed).filter(([key]) => Object.hasOwn(recipe, key))) as Partial<Recipe>;
    const candidate = { ...getPreset().recipe, ...known };
    generateQR({ text: payload || 'Recipe validation', recipe: candidate });
    recipe = candidate; input('mode').value = 'material'; syncControls(); update(); toast('Recipe loaded.');
  } catch (error) { toast(`Could not load recipe: ${error instanceof Error ? error.message : String(error)}`); }
  input('recipe-file').value = '';
});
el('check').addEventListener('click', async () => {
  if (!current || checking) return;
  const snapshot = current, text = payload, startedAt = revision;
  checking = true;
  el<HTMLButtonElement>('check').disabled = true;
  el('scan-results').innerHTML = '<p class="muted">Decoding four simulated conditions…</p>';
  try {
    const results = await scan(snapshot.svg, text, snapshot.size);
    if (startedAt !== revision) return;
    el('scan-results').innerHTML = results.map(result => `<div class="scan-result ${result.passed ? 'passed' : 'failed'}"><span>${result.name}</span><strong>${result.passed ? 'PASS' : 'FAIL'}</strong></div>`).join('') + `<p class="muted">${results.every(r => r.passed) ? 'Decoded the exact payload in all four checks.' : 'Try fuller modules, darker ink, a larger export, or a shorter payload.'}</p>`;
  } catch (error) { if (startedAt === revision) el('scan-results').textContent = `Check failed: ${String(error)}`; }
  finally { checking = false; el<HTMLButtonElement>('check').disabled = !current; el<HTMLButtonElement>('refine').disabled = !current || !artwork; }
});
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter!;
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  renderGallery();
}));
input('mode').addEventListener('change', update);
input('strength').addEventListener('input', () => { el('strength-value').textContent = `${Math.round(Number(input('strength').value) * 100)}%`; update(); });
async function useArtwork(file: Blob, name: string, ticket = ++artworkLoad) {
  try {
    const decoded = await readArtwork(file);
    if (ticket !== artworkLoad) return;
    artwork = decoded; el('art-name').textContent = name;
    input('mode').value = 'image'; update();
  } catch (error) { toast(`Artwork failed: ${error instanceof Error ? error.message : String(error)}`); }
}
input('art-file').addEventListener('change', () => { const file = input('art-file').files?.[0]; if (file) void useArtwork(file, file.name); });
document.querySelectorAll<HTMLButtonElement>('[data-art]').forEach(button => button.addEventListener('click', async () => {
  const ticket = ++artworkLoad;
  try { const response = await fetch(artworkURL(button.dataset.art!)); if (!response.ok) throw new Error('Sample unavailable'); await useArtwork(await response.blob(), `${button.textContent} · generated reference artwork`, ticket); }
  catch (error) { toast(String(error)); }
}));
el('refine').addEventListener('click', async () => {
  if (!artwork || checking || !current) return;
  const startedAt = revision, source = artwork, text = payload, size = current.size;
  const initial = Number(input('strength').value);
  checking = true; el<HTMLButtonElement>('refine').disabled = true; el<HTMLButtonElement>('check').disabled = true;
  try {
    for (const strength of [...new Set([initial, Math.max(0, initial - .2), Math.max(0, initial - .4), 0])]) {
      if (revision !== startedAt) return;
      el('scan-results').textContent = `Testing image freedom ${Math.round(strength * 100)}%…`;
      const rendered = renderArtwork({ text, artwork: source, size, strength });
      const checks = await scan(rendered.svg, text, size);
      if (revision !== startedAt) return;
      if (checks.every(c => c.passed) || strength === 0) {
        input('strength').value = String(strength); el('strength-value').textContent = `${Math.round(strength * 100)}%`;
        update();
        el('scan-results').innerHTML = checks.map(c => `<div class="scan-result ${c.passed ? 'passed' : 'failed'}"><span>${c.name}</span><strong>${c.passed ? 'PASS' : 'FAIL'}</strong></div>`).join('');
        toast(checks.every(c => c.passed) ? `Refined to ${Math.round(strength * 100)}% image freedom. All four checks passed.` : 'No tested setting passed. Try a shorter payload or larger export.');
        break;
      }
    }
  } catch (error) { if (revision === startedAt) toast(String(error)); }
  finally { checking = false; el<HTMLButtonElement>('refine').disabled = !current || !artwork; el<HTMLButtonElement>('check').disabled = !current; }
});
syncControls(); update(); renderGallery();
