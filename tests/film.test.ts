import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import QRCode from 'qrcode';
import sharp from 'sharp';
import { generateQR, getPreset, filmStyles, contrastRatio } from '../src/core/index.js';
import { validateManifest } from '../src/core/batch.js';
import { checkScannability } from '../src/core/node.js';
import { compareDecoders } from '../src/core/independent-scan.js';

const manifest = validateManifest(JSON.parse(await readFile(new URL('../examples/film/manifest.json', import.meta.url), 'utf8')));
test('film manifest has all 117 exact payloads and 47 unique styles', () => {
  assert.equal(manifest.length,117);
  assert.deepEqual([...new Set(manifest.map(e=>e.style))].sort(), [...filmStyles].sort());
  for (const id of filmStyles) {
    const recipe=getPreset(id).recipe;
    assert.ok(contrastRatio(recipe.foreground,recipe.background)>=7,id);
    assert.equal(recipe.gradient,false); assert.equal(recipe.effect,'none'); assert.equal(recipe.texture,'none');
  }
});
for (const entry of manifest) test(`film ${entry.id}: exact payload at required ECC and film sizes`, async () => {
  const variants = [...(entry.mode === 'feature' ? [380,480] : [380]).map(size=>({size})), {modulePx:entry.modulePx ?? 8,transparent:true}, {modulePx:entry.modulePx ?? 8,transparent:true,frame:'none' as const}];
  for (const variant of variants) {
    const code=generateQR({text:entry.text,style:entry.style,errorCorrection:entry.ecc,...variant});
    const size=code.size;
    const existing=await checkScannability(code.svg,entry.text), independent=await compareDecoders(code.svg,entry.text);
    assert.ok(existing.every(c=>c.passed), `${size}: ${JSON.stringify(existing)}`);
    assert.ok(independent.every(c=>c.jsQR && c.zxing),`${size}: ${JSON.stringify(independent)}`);
  }
});
test('every film scene preserves the quiet zone and reserved non-finder cells exactly', async () => {
  const text='https://example.com/film';
  const matrix=QRCode.create(text,{errorCorrectionLevel:'M'}).modules;
  for (const style of filmStyles) {
    const result=generateQR({text,style,errorCorrection:'M',modulePx:4});
    assert.ok(!result.svg.includes('<text'));
    const {data,info}=await sharp(Buffer.from(result.svg)).removeAlpha().raw().toBuffer({resolveWithObject:true});
    const rgb=(color:string)=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
    const paper=rgb(result.recipe.background), ink=rgb(result.recipe.foreground);
    const pixel=(x:number,y:number)=>[...data.subarray((y*info.width+x)*3,(y*info.width+x)*3+3)];
    const b=result.geometry.codeBox;
    assert.ok(Object.values(result.geometry.frame).every(value=>Number.isInteger(value) && value<=56)); assert.equal(b.width,(matrix.size+8)*4);
    for(let y=b.y;y<b.y+b.height;y++) for(let x: number=b.x;x<b.x+b.width;x++) {
      if(x<b.x+16 || x>=b.x+b.width-16 || y<b.y+16 || y>=b.y+b.height-16) assert.deepEqual(pixel(x,y),paper,`${style}: quiet zone ${x},${y}`);
    }
    for(let row=0;row<matrix.size;row++)for(let col=0;col<matrix.size;col++) {
      const finder=(row<7&&col<7)||(row<7&&col>=matrix.size-7)||(row>=matrix.size-7&&col<7);
      if(matrix.isReserved(row,col)&&!finder) assert.deepEqual(pixel(b.x+16+col*4+2,b.y+16+row*4+2),matrix.get(row,col)?ink:paper,style);
    }
    const bare=generateQR({text,style,errorCorrection:'M',modulePx:4,frame:'none'});
    assert.equal(bare.size,(matrix.size+8)*4); assert.equal(bare.geometry.codeBox.x,0);
    assert.equal(bare.recipe.foreground,result.recipe.foreground); assert.equal(bare.recipe.shape,result.recipe.shape);
    assert.ok(!bare.svg.includes('film-band'));
  }
});
test('whole-pixel metadata, determinism and film guardrails', () => {
  const options={text:'pixel grid',style:'bat',modulePx:7,errorCorrection:'Q' as const};
  const a=generateQR(options),b=generateQR(options);
  assert.equal(a.svg,b.svg); assert.equal(a.geometry.modulePx,7);
  assert.equal(a.geometry.ecc,'Q'); assert.equal(a.size,(a.moduleCount+24)*7);
  assert.throws(()=>generateQR({...options,size:380}));
  assert.throws(()=>generateQR({...options,modulePx:1.5}));
  assert.throws(()=>generateQR({...options,recipe:{gradient:true}}));
  assert.throws(()=>generateQR({...options,recipe:{foreground:'#777777'}}));
  for (const id of ['../escape','report','sheet']) assert.throws(()=>validateManifest([{...manifest[0],id}]));
  assert.throws(()=>validateManifest([manifest[0],manifest[0]]));
});

test('hero props preserve opaque cream plates and transparent empty surrounds', async () => {
  for (const style of filmStyles) {
    const result=generateQR({text:'Transparent hero',style,modulePx:4,transparent:true});
    assert.equal(result.geometry.transparentSurround,true);
    assert.equal((result.svg.match(/data-film-hero=/g)??[]).length,1);
    const {data,info}=await sharp(Buffer.from(result.svg)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    const b=result.geometry.codeBox;
    const alpha=(x:number,y:number)=>data[(y*info.width+x)*4+3];
    assert.equal(alpha(0,0),0,style);
    for(let y=b.y;y<b.y+b.height;y++)for(let x:number=b.x;x<b.x+b.width;x++) assert.equal(alpha(x,y),255,`${style}: opaque plate`);
    const outer=[];
    for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(x<b.x||x>=b.x+b.width||y<b.y||y>=b.y+b.height)outer.push(alpha(x,y));
    assert.ok(outer.some(a=>a===255),`${style}: visible hero`);
    assert.ok(outer.some(a=>a===0),`${style}: empty transparent surround`);
  }
  assert.equal(getPreset('mic').recipe.background,'#F3EBDC');
  assert.throws(()=>validateManifest([{...manifest[0],modulePx:2.5}]));
  assert.throws(()=>validateManifest([{...manifest[0],modulePx:0}]));
});
