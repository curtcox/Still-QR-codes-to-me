import { test, expect } from '@playwright/test';

test('production assets and image generation work at the deployment base path', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  page.on('requestfailed', request => errors.push(`${request.url()}: ${request.failure()?.errorText}`));

  await page.goto('./');
  await expect(page.getByRole('heading', { name: 'A code with character.' })).toBeVisible();
  await page.getByLabel('Rendering mode').selectOption('image');
  for (const sample of ['bamboo', 'ice', 'fire']) {
    const button = page.getByRole('button', { name: `Use ${sample} artwork` });
    await expect(button.locator('img')).toBeVisible();
    await expect.poll(() => button.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    await button.click();
    await expect(page.locator('#art-name')).toContainText(new RegExp(sample, 'i'));
    await expect(page.locator('#preview svg image')).toHaveCount(1);
  }
  await page.getByRole('button', { name: 'Refine for scanning' }).click();
  await expect(page.locator('.scan-result.passed')).toHaveCount(4, { timeout: 30000 });
  expect(errors).toEqual([]);
});
