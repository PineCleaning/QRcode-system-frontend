import { test, expect } from '@playwright/test';
import { deleteTestClient, apiFetch } from './backend-client';

const RUN_ID = Date.now();
const CLIENT_CODE = `e2e-client-${RUN_ID}`;
const CLIENT_NAME = `E2E Test Client ${RUN_ID}`;
const CLIENT_NAME_EDITED = `E2E Test Client ${RUN_ID} Edited`;

let createdClientCode: string | null = null;

test.describe.serial('Client CRUD + deactivate', () => {
  test.afterAll(async () => {
    if (createdClientCode) await deleteTestClient(createdClientCode);
  });

  test('create a client via the Add client modal, verify it appears in the list', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('button', { name: '+ Add client' }).click();
    await expect(page.getByRole('heading', { name: 'Add client' })).toBeVisible();

    await page.getByLabel('Client ID').fill(CLIENT_CODE);
    await page.getByLabel('Client Name').fill(CLIENT_NAME);
    await page.getByRole('button', { name: 'Create client' }).click();

    await expect(page.getByRole('heading', { name: 'Add client' })).not.toBeVisible();
    await expect(page).toHaveURL(/\/clients$/);
    // The client name cell is plain text, not a link - the whole <tr> is
    // clickable via ClickableRow's onClick, not an <a> wrapping the name.
    await expect(page.locator('tr', { hasText: CLIENT_NAME })).toBeVisible();
    await expect(page.getByText(CLIENT_CODE)).toBeVisible();
  });

  test('reject a duplicate client code with a visible inline error', async ({ page }) => {
    await page.goto('/clients');
    await page.getByRole('button', { name: '+ Add client' }).click();
    await page.getByLabel('Client ID').fill(CLIENT_CODE);
    await page.getByLabel('Client Name').fill('Duplicate Code Attempt');
    await page.getByRole('button', { name: 'Create client' }).click();
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10_000 });
    // Modal stays open on error, doesn't silently close/navigate away.
    await expect(page.getByRole('heading', { name: 'Add client' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });

  test('view client detail page and capture its id', async ({ page }) => {
    await page.goto('/clients');
    // Row click navigates (ClickableRow) - click the name cell itself, not
    // a button/link inside the row, which ClickableRow deliberately ignores.
    await page.locator('tr', { hasText: CLIENT_NAME }).getByText(CLIENT_NAME).click();
    await expect(page).toHaveURL(/\/clients\/[a-f0-9-]+$/);
    await expect(page.getByRole('heading', { name: CLIENT_NAME })).toBeVisible();

    createdClientCode = page.url().split('/clients/')[1];
    await expect(page.getByText('No sites yet.')).toBeVisible();
  });

  test('edit the client via the Edit modal, confirm the list reflects the new name', async ({ page }) => {
    await page.goto('/clients');
    const row = page.locator('tr', { hasText: CLIENT_NAME });
    await row.getByRole('button', { name: 'Edit' }).click();
    await expect(page.getByRole('heading', { name: 'Edit client' })).toBeVisible();

    await page.getByLabel('Client Name').fill(CLIENT_NAME_EDITED);
    await page.getByRole('button', { name: 'Save changes' }).click();

    await expect(page.getByRole('heading', { name: 'Edit client' })).not.toBeVisible();
    await expect(page).toHaveURL(/\/clients$/);
    await expect(page.locator('tr', { hasText: CLIENT_NAME_EDITED })).toBeVisible();
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

    const res = await apiFetch(`/clients/${createdClientCode}`);
    const body = await res.json();
    expect(body.status).toBe('INACTIVE');
    expect(body.clientName).toBe(CLIENT_NAME_EDITED); // proves the partial update didn't clobber other fields
  });
});
