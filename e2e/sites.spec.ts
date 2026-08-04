import { test, expect } from '@playwright/test';
import { createTestClient, deleteTestClient, apiFetch } from './backend-client';

const RUN_ID = Date.now();
const SITE_NAME = `E2E Test Site ${RUN_ID}`;
const SITE_NAME_EDITED = `E2E Test Site ${RUN_ID} Edited`;

let clientCode: string;

test.describe.serial('Site CRUD, QR modal, deactivate', () => {
  test.beforeAll(async () => {
    const client = await createTestClient(`e2e-sites-${RUN_ID}`, `E2E Sites Parent ${RUN_ID}`);
    clientCode = client.id;
  });

  test.afterAll(async () => {
    await deleteTestClient(clientCode);
  });

  test('add a site from the client detail page', async ({ page }) => {
    await page.goto(`/clients/${clientCode}`);
    await page.getByRole('link', { name: '+ Add site' }).click();
    await expect(page).toHaveURL(/\/sites\/new/);

    await page.getByLabel('Business Name').fill(SITE_NAME);
    await page.getByLabel('Address').fill('1 E2E Test St');
    await page.getByRole('button', { name: 'Add site' }).click();

    await expect(page).toHaveURL(new RegExp(`/clients/${clientCode}$`));
    const row = page.locator('tr', { hasText: SITE_NAME });
    await expect(row).toBeVisible();
    await expect(row.getByText('1 E2E Test St')).toBeVisible();
    // Slug is a standalone random UUID, unrelated to clientId/siteCode -
    // not guessable/enumerable from another known slug.
    await expect(row.getByText(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)).toBeVisible();
  });

  test('QR modal shows the code and PNG/PDF download links', async ({ page }) => {
    await page.goto(`/clients/${clientCode}`);
    const row = page.locator('tr', { hasText: SITE_NAME });
    await row.getByRole('button', { name: 'View' }).click();

    await expect(page.getByRole('heading', { name: SITE_NAME })).toBeVisible();
    await expect(page.getByRole('img', { name: `QR code for ${SITE_NAME}` })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PNG' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PDF A4' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'PDF A5' })).toBeVisible();

    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: SITE_NAME })).not.toBeVisible();
  });

  test('edit the site and confirm redirect back to the client page', async ({ page }) => {
    await page.goto(`/clients/${clientCode}`);
    const row = page.locator('tr', { hasText: SITE_NAME });
    await row.getByRole('link', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/edit$/);

    await page.getByLabel('Business Name').fill(SITE_NAME_EDITED);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL(new RegExp(`/clients/${clientCode}$`));
    await expect(page.locator('tr', { hasText: SITE_NAME_EDITED })).toBeVisible();
  });

  test('deactivate a site: confirmation modal, status flips, slug/address untouched', async ({ page }) => {
    await page.goto(`/clients/${clientCode}`);
    const row = page.locator('tr', { hasText: SITE_NAME_EDITED });
    await expect(row.getByText('ACTIVE', { exact: true })).toBeVisible();

    await row.getByRole('button', { name: 'Deactivate' }).click();
    await expect(page.getByText(/stop accepting new feedback/i)).toBeVisible();
    await page.getByText(/stop accepting new feedback/i).locator('..').getByRole('button', { name: 'Deactivate' }).click();

    await expect(row.getByText('INACTIVE', { exact: true })).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText('1 E2E Test St')).toBeVisible(); // address survived the partial update
  });

  test('deactivated site is confirmed inactive via the API too', async () => {
    const res = await apiFetch(`/clients/${clientCode}/sites`);
    const sites = await res.json();
    const site = sites.find((s: { businessName: string }) => s.businessName === SITE_NAME_EDITED);
    expect(site).toBeTruthy();
    expect(site.status).toBe('INACTIVE');
  });
});
