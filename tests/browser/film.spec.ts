import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('film manifest also scans through browser Canvas at every required size', async ({ page }) => {
  test.setTimeout(180000);
  const entries = JSON.parse(await readFile(new URL('../../examples/film/manifest.json', import.meta.url), 'utf8'));
  await page.goto('/');
  const failures = await page.evaluate(async (entries) => {
    const corePath = '/src/core/index.ts', browserPath = '/src/web/browser.ts';
    const { generateQR, filmStyles } = await import(corePath);
    const { scan } = await import(browserPath);
    const failures = [];
    for (const entry of entries) for (const size of entry.mode === 'feature' ? [380,480] : [380]) {
      const code = generateQR({ text: entry.text, style: entry.style, errorCorrection: entry.ecc, size });
      const checks = await scan(code.svg, entry.text, size);
      if (checks.some((c: {passed:boolean}) => !c.passed)) failures.push({id:entry.id,size,checks});
    }
    for (const style of filmStyles) {
      const text = 'https://example.com/hello', size=1024;
      const checks = await scan(generateQR({text,style,size}).svg,text,size);
      if(checks.some((c: {passed:boolean}) => !c.passed)) failures.push({id:style,size,checks});
    }
    return failures;
  }, entries);
  expect(failures).toEqual([]);
});
