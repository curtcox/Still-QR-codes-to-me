import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('gallery, remix controls, validation, exact-payload scans and downloads work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A code with character.' })).toBeVisible();
  await expect(page.locator('[data-style]')).toHaveCount(12);
  await page.getByRole('button', { name: 'Use Botanical style', exact: true }).click();
  await expect(page.locator('#style-name')).toHaveText('Botanical');
  await page.getByLabel('Where should it lead?').fill('Hello, 世界! Café 🌿');
  await page.getByLabel('Module shape').selectOption('rounded');
  await expect(page.locator('#style-name')).toContainText('remixed');
  await page.getByRole('button', { name: 'Run scan checks' }).click();
  await expect(page.locator('.scan-result.passed')).toHaveCount(4);
  await page.getByLabel('Where should it lead?').fill('');
  await expect(page.getByRole('alert')).toContainText('Enter a URL');
  await expect(page.getByRole('button', { name: 'Download SVG' })).toBeDisabled();
  await expect(page.locator('#preview svg')).toHaveCount(0);
  await page.getByLabel('Where should it lead?').fill('https://example.com/custom');
  await expect(page.locator('.scan-result')).toHaveCount(0);
  await page.getByRole('button', { name: 'Experimental', exact: true }).click();
  await expect(page.locator('[data-style]')).toHaveCount(7);
  for (const kind of ['Download SVG', 'PNG']) {
    const downloading = page.waitForEvent('download');
    await page.getByRole('button', { name: new RegExp(`^${kind}`) }).click();
    const file = await downloading;
    const data = await readFile((await file.path())!);
    if (kind === 'PNG') expect(data.subarray(1, 4).toString()).toBe('PNG');
    else expect(data.toString()).toContain('https://example.com/custom');
  }
  const recipeDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save recipe' }).click();
  const recipe = JSON.parse(await readFile((await (await recipeDownload).path())!, 'utf8'));
  expect(recipe.shape).toBe('rounded');
  await page.locator('#recipe-file').setInputFiles({ name: 'recipe.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ ...recipe, shape: 'square' })) });
  await expect(page.getByLabel('Module shape')).toHaveValue('square');
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/studio-desktop.png', fullPage: true });
});

test('all presets pass browser rendering and scanning', async ({ page }) => {
  await page.goto('/');
  const ids = await page.locator('[data-style]').evaluateAll(elements => elements.map(el => (el as HTMLElement).dataset.style!));
  for (const id of ids) {
    await page.locator(`[data-style="${id}"]`).click();
    await page.getByRole('button', { name: 'Run scan checks' }).click();
    await expect(page.locator('.scan-result.passed'), id).toHaveCount(4);
  }
});

test('mobile layout fits viewport and supports generation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#preview svg')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Use Orbital style', exact: true }).click();
  await page.getByRole('button', { name: 'Run scan checks' }).click();
  await expect(page.locator('.scan-result.passed')).toHaveCount(4);
  await page.screenshot({ path: 'test-results/studio-mobile.png', fullPage: true });
});
