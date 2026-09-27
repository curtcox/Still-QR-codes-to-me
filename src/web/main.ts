import { generateQR, presets, getPreset, shapes, borders, textures, type Recipe, type GeneratedQR } from '../core/index.js';
import { download, rasterize, scan } from './browser.js';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;
const options = (values: readonly string[]) => values.map(v => `<option value="${v}">${v[0].toUpperCase() + v.slice(1)}</option>`).join('');
app.innerHTML = `
<header class="topbar"><a href="#" class="brand" aria-label="Still QR home"><span class="brand-mark">▦</span> STILL QR</a><div class="header-note">A little less ordinary. Still a QR code.</div><a href="#collection" class="nav-link">Explore the collection <span>↗</span></a></header>
<main>
<section class="intro"><div><p class="eyebrow">THE QR CODE, RECONSIDERED</p><h1>A code with<br><em>character.</em></h1><p class="intro-copy">For the things you make, the places you build,<br class="desktop-break"> and the stories waiting on the other side.</p></div><div class="intro-aside"><span class="small-star">✳</span><p>12 starting points.<br>Thousands of combinations.<br>Entirely yours.</p><span class="local-tag"><i></i> MADE LOCALLY. NO UPLOADS.</span></div></section>
<section class="studio" aria-label="QR code studio">
<div class="controls"><div class="section-label"><span>01 / MAKE IT YOURS</span><button id="reset" class="text-button">Reset ↺</button></div>
<label class="field-label" for="payload">Where should it lead?</label><textarea id="payload" rows="2" spellcheck="false">https://example.com/hello</textarea><p class="field-hint">A link, a note, a Wi-Fi string. Whatever opens a door.</p>
<div class="control-heading">The essentials</div>
<div class="field-grid"><label>Module shape<select id="shape">${options(shapes)}</select></label><label>Border<select id="border">${options(borders)}</select></label></div>
<div class="field-grid"><label>Texture<select id="texture">${options(textures)}</select></label><label>Export size<select id="size"><option value="256">256 × 256 px</option><option value="512">512 × 512 px</option><option value="1024" selected>1024 × 1024 px</option><option value="2048">2048 × 2048 px</option><option value="4096">4096 × 4096 px</option></select></label></div>
<div class="control-heading">Set the mood</div><div class="colors"><label><input id="foreground" type="color">Ink</label><label><input id="background" type="color">Paper</label><label><input id="accent" type="color">Accent</label></div>
<label class="checkbox"><input id="gradient" type="checkbox">Blend ink into accent</label>
<div class="seed-row"><label for="seed">Texture seed</label><input id="seed" type="number" min="0" max="4294967295" step="1"><button id="shuffle" class="icon-button" aria-label="Randomize texture seed">↻</button></div>
<div class="recipe-actions"><button id="save-recipe" class="text-button">Save recipe ↓</button><button id="load-recipe" class="text-button">Load recipe ↑</button><input id="recipe-file" type="file" accept="application/json,.json" hidden></div>
<p id="error" class="error" role="alert" hidden></p>
</div>
<div class="preview-panel"><div class="preview-heading"><span>LIVE PREVIEW</span><span id="style-index">01 — 12</span></div><div class="preview-stage"><div id="preview" class="preview-art"></div></div><div class="preview-caption"><div><h2 id="style-name">Editorial</h2><p id="style-description"></p></div><span id="safety-badge" class="badge"></span></div><div class="export-row"><button id="download-svg" class="primary-button">Download SVG <span>↓</span></button><button id="download-png" class="secondary-button">PNG <span>↓</span></button></div><p class="export-note">Vector for print. Pixels for everything else.</p></div>
<div class="scan-panel"><div class="section-label">02 / KEEP IT READABLE</div><h3>Good looks. <br>Working links.</h3><p class="scan-copy">Distinctive on the outside. <br>A real QR code underneath.</p><div class="scan-metrics"><div><span>Correction</span><strong>High · H</strong></div><div><span>Quiet zone</span><strong>4 modules</strong></div><div><span>Ink contrast</span><strong id="contrast">—</strong></div><div><span>QR matrix</span><strong id="matrix">—</strong></div></div><button id="check" class="check-button">Run scan checks <span>↗</span></button><div id="scan-results" aria-live="polite"><p class="muted">Test this design at full size, reduced size, with blur, and with lower contrast.</p></div><p id="warnings" class="warning"></p><p class="scan-footnote">Simulated checks are a starting point. Test with a phone at your intended screen or print size.</p></div>
</section>
<section id="collection" class="collection"><div class="collection-heading"><div><p class="eyebrow">PICK A PERSONALITY</p><h2>The starting collection<span> / 12</span></h2></div><div class="filters" role="group" aria-label="Filter styles"><button data-filter="all" aria-pressed="true">All styles</button><button data-filter="conservative" aria-pressed="false">Conservative</button><button data-filter="experimental" aria-pressed="false">Experimental</button></div></div><div id="gallery" class="gallery"></div><p class="gallery-note">Conservative styles use fuller modules. Experimental styles reshape them more aggressively. Every combination needs its own scan check.</p></section>
<section class="principles"><div><span>01</span><h3>Mix, don’t settle.</h3><p>Every style is a recipe. Swap its shape, change its palette, give it a different frame.</p></div><div><span>02</span><h3>Keep the character.</h3><p>Save the recipe and reuse it. Seeded textures make the same design repeatable.</p></div><div><span>03</span><h3>Take it with you.</h3><p>Your code, your file. No redirects, no accounts, no expiring links added by us.</p></div></section>
</main><footer><a class="brand" href="#">STILL QR</a><span>Distinctive by design. Readable by intention.</span><span>OPEN SOURCE / MIT</span></footer><div id="toast" role="status" hidden></div>`;

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
let styleId = 'editorial';
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
    current = generateQR({ text: payload, style: styleId, recipe, size: Number(input('size').value) });
    el('preview').innerHTML = current.svg;
    el('error').hidden = true;
    el('contrast').textContent = `${current.contrast.toFixed(1)} : 1`;
    el('matrix').textContent = `${current.moduleCount} × ${current.moduleCount}`;
    el('warnings').textContent = current.warnings.join(' ');
    const custom = JSON.stringify(recipe) !== JSON.stringify(getPreset(styleId).recipe);
    el('style-name').textContent = getPreset(styleId).name + (custom ? ' · remixed' : '');
    el('style-description').textContent = getPreset(styleId).description;
    const experimental = current.warnings.some(w => w.startsWith('Experimental'));
    el('safety-badge').textContent = experimental ? 'Experimental' : 'Conservative';
    el('safety-badge').classList.toggle('experimental', experimental);
    el('style-index').textContent = `${String(presets.findIndex(p => p.id === styleId) + 1).padStart(2, '0')} — 12`;
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
  document.querySelectorAll<HTMLButtonElement>('[data-style]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.style === styleId)));
}
function renderGallery() {
  el('gallery').innerHTML = presets.filter(p => filter === 'all' || p.safety === filter).map(p => {
    const thumbnail = generateQR({ text: 'https://example.com/hello', style: p.id, size: 256 }).svg;
    return `<button class="style-card" data-style="${p.id}" aria-pressed="${styleId === p.id}" aria-label="Use ${p.name} style"><div class="card-art">${thumbnail}<span class="card-arrow">↗</span></div><div class="card-title"><h3>${p.name}</h3><span>${String(presets.indexOf(p) + 1).padStart(2, '0')}</span></div><p>${p.inspiration}</p><span class="card-category">${p.safety}</span></button>`;
  }).join('');
  document.querySelectorAll<HTMLButtonElement>('[data-style]').forEach(button => button.addEventListener('click', () => {
    styleId = button.dataset.style!;
    recipe = { ...getPreset(styleId).recipe };
    syncControls(); update();
    if (window.innerWidth < 900) el('preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }));
}
for (const key of Object.keys(recipe) as (keyof Recipe)[]) input(key).addEventListener('input', () => {
  recipe = { ...recipe, [key]: key === 'gradient' ? input(key).checked : key === 'seed' ? Number(input(key).value) : input(key).value };
  update();
});
input('payload').addEventListener('input', update);
input('size').addEventListener('change', update);
el('reset').addEventListener('click', () => { recipe = { ...getPreset(styleId).recipe }; syncControls(); update(); });
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
    const known = Object.fromEntries(Object.entries(parsed).filter(([key]) => key in recipe)) as Partial<Recipe>;
    const candidate = { ...recipe, ...known };
    generateQR({ text: payload || 'Recipe validation', recipe: candidate });
    recipe = candidate; syncControls(); update(); toast('Recipe loaded.');
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
  finally { checking = false; el<HTMLButtonElement>('check').disabled = !current; }
});
document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => button.addEventListener('click', () => {
  filter = button.dataset.filter!;
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  renderGallery();
}));
syncControls(); update(); renderGallery();
