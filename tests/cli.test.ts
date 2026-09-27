import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const exec = promisify(execFile);
const cli = (...args: string[]) => exec(process.execPath, ['--import', 'tsx', 'src/cli.ts', ...args], { maxBuffer: 16 * 1024 * 1024 });
test('CLI exports a checked PNG from a saved recipe and preserves existing files', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'still-qr-'));
  try {
    const output = join(dir, 'code.png'), recipe = join(dir, 'recipe.json');
    await writeFile(recipe, JSON.stringify({ shape: 'rounded', border: 'postage' }));
    const result = await cli('https://example.com', '--recipe', recipe, '-o', output, '--check');
    assert.equal(result.stdout, '');
    assert.equal(result.stderr.match(/PASS /g)?.length, 4);
    const bytes = await readFile(output);
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG');
    await assert.rejects(cli('Another payload', '-o', output), (error: any) => error.code === 1);
    assert.deepEqual(await readFile(output), bytes);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
test('CLI emits valid SVG on stdout, escapes metadata and rejects invalid options', async () => {
  const result = await cli('<script>hello</script>', '--style', 'prism');
  assert.ok(result.stdout.startsWith('<svg'));
  assert.ok(!result.stdout.includes('<script>'));
  await assert.rejects(cli('x', '--style', 'missing'), (error: any) => error.code === 1 && error.stderr.includes('Unknown style'));
  await assert.rejects(cli('x', '-o', 'nope.jpeg'), (error: any) => error.code === 1);
});
test('CLI reports a nonzero scan result without discarding the experimental output', async () => {
  const text = 'https://example.com/?data=' + '0123456789abc'.repeat(45);
  await assert.rejects(cli(text, '--size', '128', '--check'), (error: any) => error.code === 2 && error.stderr.includes('FAIL') && error.stdout.startsWith('<svg'));
});

test('CLI creates a self-contained image SVG and reports refinement outcome', async () => {
  const result = await cli('https://example.com/hello', '--artwork', 'public/artwork/bamboo-grove.png', '--strength', '0.9', '--refine');
  assert.ok(result.stdout.includes('data:image/png;base64,'));
  assert.ok(result.stderr.includes('all checks passed'));
  await assert.rejects(cli('x', '--refine'), (error: any) => error.code === 1 && error.stderr.includes('--artwork'));
});

test('CLI supports ECC, whole-pixel modules, no frame, and deterministic PNG sidecars', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'film-cli-'));
  try {
    for (const ecc of ['L','M','Q','H']) {
      const file=join(dir,`${ecc}.png`);
      await cli('https://example.com/film','--style','bat','--ecc',ecc,'--module-px','6','--frame','none','-o',file,'--check');
      const meta=JSON.parse(await readFile(join(dir,`${ecc}.json`),'utf8'));
      assert.equal(meta.ecc,ecc); assert.equal(meta.modulePx,6); assert.equal(meta.codeBox.x,0);
      assert.equal(meta.image.width,(meta.moduleCount+8)*6);
      assert.deepEqual(meta.frame,{top:0,right:0,bottom:0,left:0});
      const copy=join(dir,`${ecc}-copy.png`);
      await cli('https://example.com/film','--style','bat','--ecc',ecc,'--module-px','6','--frame','none','-o',copy);
      assert.deepEqual(await readFile(file),await readFile(copy));
    }
    for (const args of [['--ecc','X'],['--module-px','0'],['--module-px','1.5'],['--module-px','6','--size','380'],['--frame','bad']]) await assert.rejects(cli('x',...args));
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('CLI batch writes exact-payload reports, overwritable sidecars, and a contact sheet', async () => {
  const dir=await mkdtemp(join(tmpdir(),'film-batch-'));
  try {
    const entries=[{id:'sample',style:'gills',text:'Exact café 🌿',ecc:'M',mode:'shelf',caption:'Not painted'}, {id:'large',style:'bat',text:'https://example.com/feature',ecc:'H',mode:'feature',caption:'Feature'}];
    const manifest=join(dir,'manifest.json'),out=join(dir,'out');
    await writeFile(manifest,JSON.stringify(entries));
    await cli('--batch',manifest,'--out-dir',out);
    const reportBytes=await readFile(join(out,'report.json'));
    const report=JSON.parse(reportBytes.toString());
    assert.deepEqual(report.summary,{entries:2,styles:2,passed:2,failed:0});
    assert.deepEqual(report.entries[1].checks.map((c:any)=>c.size),[380,480]);
    assert.equal(JSON.parse(await readFile(join(out,'sample.json'),'utf8')).text,entries[0].text);
    assert.equal((await readFile(join(out,'sheet.png'))).subarray(1,4).toString(),'PNG');
    const png=await readFile(join(out,'sample.png'));
    await cli('--batch',manifest,'--out-dir',out);
    assert.deepEqual(await readFile(join(out,'report.json')),reportBytes);
    assert.deepEqual(await readFile(join(out,'sample.png')),png);
    await assert.rejects(cli('--batch',manifest));
    await writeFile(manifest,JSON.stringify([{...entries[0],text:'https://example.com/'+ 'abcdef0123456789'.repeat(70)}]));
    await assert.rejects(cli('--batch',manifest,'--out-dir',out,'--module-px','1'), (error:any)=>error.code===2);
    assert.equal(JSON.parse(await readFile(join(out,'report.json'),'utf8')).summary.failed,1);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
