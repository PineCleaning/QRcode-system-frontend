import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createTestClient, createTestSite, deleteTestClient, apiFetch } from './backend-client';

const RUN_ID = Date.now();
let clientId: string;
let activeSlug: string;
let inactiveSlug: string;

// The public form is unauthenticated - deliberately don't reuse the admin storage state.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Public feedback form (anonymous, no login)', () => {
  test.beforeAll(async () => {
    const client = await createTestClient(`e2e-public-${RUN_ID}`, `E2E Public Form Client ${RUN_ID}`);
    clientId = client.id;
    const activeSite = await createTestSite(clientId, 'Active Site');
    activeSlug = activeSite.slug;
    const inactiveSite = await createTestSite(clientId, 'Inactive Site');
    inactiveSlug = inactiveSite.slug;
    await apiFetch(`/sites/${inactiveSite.id}`, { method: 'PUT', body: JSON.stringify({ status: 'INACTIVE' }) });
  });

  test.afterAll(async () => {
    await deleteTestClient(clientId);
  });

  test('active slug pre-fills client/site name and submits successfully with no attachment', async ({ page }) => {
    await page.goto(`/qrfeedback/${activeSlug}`);
    await expect(page.getByLabel('Client')).toHaveValue(/E2E Public Form Client/);
    await expect(page.getByLabel('Site')).toHaveValue('Active Site');

    await page.getByLabel(/^Feedback/).fill('E2E test: great service, very clean facility.');
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you!' })).toBeVisible({ timeout: 15_000 });
  });

  test('mobile number field strips non-numeric characters as typed', async ({ page }) => {
    await page.goto(`/qrfeedback/${activeSlug}`);
    const mobileInput = page.getByLabel(/mobile number/i);
    await mobileInput.fill('abc0412-345 678xyz');
    await expect(mobileInput).toHaveValue('0412-345 678');
  });

  test('character counter updates as feedback is typed', async ({ page }) => {
    await page.goto(`/qrfeedback/${activeSlug}`);
    await page.getByLabel(/^Feedback/).fill('Hello');
    await expect(page.getByText('5 / 5000 characters')).toBeVisible();
  });

  test('submitting with a real uploaded image attaches it and is reported VERIFIED', async ({ page }) => {
    const imgPath = path.join(os.tmpdir(), `e2e-attachment-${RUN_ID}.png`);
    // 1x1 transparent PNG
    const pngBase64 =
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
    fs.writeFileSync(imgPath, Buffer.from(pngBase64, 'base64'));

    await page.goto(`/qrfeedback/${activeSlug}`);
    await page.getByLabel(/^Feedback/).fill('E2E test: submitting with a real photo attached.');
    await page.getByRole('button', { name: 'Browse Files' }).click();
    // The native chooser is triggered by a hidden <input type=file>; setInputFiles targets it directly.
    await page.locator('input[type="file"]').setInputFiles(imgPath);
    await expect(page.getByText('1 file chosen')).toBeVisible();

    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you!' })).toBeVisible({ timeout: 30_000 });
    // No "not every attachment could be included" warning - the real upload should VERIFY cleanly.
    await expect(page.getByText(/could not be included/i)).not.toBeVisible();

    fs.unlinkSync(imgPath);
  });

  test('inactive site shows the generic fallback, not the form', async ({ page }) => {
    await page.goto(`/qrfeedback/${inactiveSlug}`);
    await expect(page.getByText(/this page isn.t available/i)).toBeVisible();
    await expect(page.getByLabel(/^Feedback/)).not.toBeVisible();
  });

  test('nonexistent slug shows the identical fallback (no way to distinguish from deactivated)', async ({ page }) => {
    await page.goto('/qrfeedback/this-slug-does-not-exist-e2e');
    await expect(page.getByText(/this page isn.t available/i)).toBeVisible();
  });
});
