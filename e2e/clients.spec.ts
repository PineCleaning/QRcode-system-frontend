import { test, expect } from '@playwright/test';
import { deleteTestClient, apiFetch } from './backend-client';

const RUN_ID = Date.now();
const CLIENT_CODE = `e2e-client-${RUN_ID}`;
const CLIENT_NAME = `E2E Test Client ${RUN_ID}`;
const CLIENT_NAME_EDITED = `E2E Test Client ${RUN_ID} Edited`;

let createdClientId: string | null = null;

test.describe.serial('Client CRUD + deactivate', () => {
  test.afterAll(async () => {
    if (createdClientId) await deleteTestClient(createdClientId);
  });

  test('create a client via the form, verify it appears in the list', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('link', { name: '+ Add client' }).click();
    await expect(page).toHaveURL(/\/clients\/new/);

    await page.getByLabel('Client code').fill(CLIENT_CODE);
    await page.getByLabel('Name').fill(CLIENT_NAME);
    await page.getByLabel('Contact email').fill('e2e-test@example.com');
    await page.getByLabel('Contact phone').fill('+61-2-9111222');
    await page.getByRole('button', { name: 'Create client' }).click();

    await expect(page).toHaveURL(/\/clients$/);
    await expect(page.getByRole('link', { name: CLIENT_NAME })).toBeVisible();
    await expect(page.getByText(CLIENT_CODE)).toBeVisible();
  });

  test('reject a duplicate client code with a visible inline error', async ({ page }) => {
    await page.goto('/clients/new');
    await page.getByLabel('Client code').fill(CLIENT_CODE);
    await page.getByLabel('Name').fill('Duplicate Code Attempt');
    await page.getByRole('button', { name: 'Create client' }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/clients\/new/); // stayed on the form, did not navigate away
  });

  test('view client detail page and capture its id', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('link', { name: CLIENT_NAME }).click();
    await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
    await expect(page.getByRole('heading', { name: CLIENT_NAME })).toBeVisible();

    createdClientId = page.url().split('/clients/')[1];
    await expect(page.getByText(/no sites yet/i)).toBeVisible();
  });

  test('edit the client and confirm redirect goes to the Clients list, not the detail page', async ({ page }) => {
    await page.goto('/clients');
    const row = page.locator('tr', { hasText: CLIENT_NAME });
    await row.getByRole('link', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/edit$/);

    await page.getByLabel('Name').fill(CLIENT_NAME_EDITED);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page).toHaveURL(/\/clients$/);
    await expect(page.getByRole('link', { name: CLIENT_NAME_EDITED })).toBeVisible();
  });

  test('deactivate: cancel leaves status untouched, confirming flips it without deleting', async ({ page }) => {
    await page.goto('/clients');
    const row = page.locator('tr', { hasText: CLIENT_NAME_EDITED });
    await expect(row.getByText('ACTIVE', { exact: true })).toBeVisible();

    await row.getByRole('button', { name: 'Deactivate' }).click();
    const modal = page.getByText(/nothing is deleted/i).locator('..');
    await expect(modal.getByRole('heading')).toContainText('Deactivate');
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
    await expect(row.getByText('ACTIVE', { exact: true })).toBeVisible();

    await row.getByRole('button', { name: 'Deactivate' }).click();
    await page.getByText(/nothing is deleted/i).locator('..').getByRole('button', { name: 'Deactivate' }).click();
    await expect(row.getByText('INACTIVE', { exact: true })).toBeVisible({ timeout: 10_000 });

    const res = await apiFetch(`/clients/${createdClientId}`);
    const body = await res.json();
    expect(body.status).toBe('INACTIVE');
    expect(body.name).toBe(CLIENT_NAME_EDITED); // proves the partial update didn't clobber other fields
  });
});
