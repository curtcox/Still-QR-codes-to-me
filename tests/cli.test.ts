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
