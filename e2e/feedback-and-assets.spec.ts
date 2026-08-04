import { test, expect } from '@playwright/test';
import { apiFetch, createTestClient, createTestSite, deleteTestClient, submitFeedbackWithRealAttachment } from './backend-client';

const RUN_ID = Date.now();
const CLIENT_NAME = `E2E Feedback Client ${RUN_ID}`;
const SITE_NAME = `E2E Feedback Site ${RUN_ID}`;
const FEEDBACK_TEXT = `E2E test feedback with a real attachment ${RUN_ID}`;

let clientCode: string;
let slug: string;

test.describe.serial('Global Feedback + Assets admin pages', () => {
  test.beforeAll(async () => {
    const client = await createTestClient(`e2e-fb-${RUN_ID}`, CLIENT_NAME);
    clientCode = client.id;
    const site = await createTestSite(clientCode, SITE_NAME);
    slug = site.slug;
    // Real end-to-end: signature -> direct Cloudinary upload -> feedback submission with that public_id.
    await submitFeedbackWithRealAttachment(slug, FEEDBACK_TEXT);
  });

  test.afterAll(async () => {
    await deleteTestClient(clientCode); // will deactivate instead of hard-delete since feedback history now exists
  });

  test('feedback appears on the global Feedback page with client/site/attachment', async ({ page }) => {
    await page.goto('/feedback');
    const row = page.locator('tr', { hasText: FEEDBACK_TEXT });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText(CLIENT_NAME)).toBeVisible();
    await expect(row.getByText(SITE_NAME)).toBeVisible();
    await expect(row.getByText(/DELIVERY PENDING|DELIVERY FAILED/)).toBeVisible(); // ClickUp not connected in this environment
  });

  test('client/site filters on the Feedback page narrow the list correctly', async ({ page }) => {
    await page.goto('/feedback');
    await page.getByLabel('Client').selectOption({ label: CLIENT_NAME });
    await expect(page).toHaveURL(new RegExp(`clientCode=${clientCode}`));
    await expect(page.locator('tr', { hasText: FEEDBACK_TEXT })).toBeVisible();

    await page.getByLabel('Site').selectOption({ label: SITE_NAME });
    await expect(page).toHaveURL(/siteId=/);
    await expect(page.locator('tr', { hasText: FEEDBACK_TEXT })).toBeVisible();
  });

  test('per-site Feedback page shows the same submission with a working back link', async ({ page }) => {
    await page.goto(`/clients/${clientCode}`);
    const siteRow = page.locator('tr', { hasText: SITE_NAME });
    await siteRow.getByRole('link', { name: 'Feedback' }).click();

    await expect(page.getByText(FEEDBACK_TEXT)).toBeVisible();
    await expect(page.getByText(SITE_NAME, { exact: true })).toBeVisible();
    await page.getByRole('link', { name: `← ${CLIENT_NAME}` }).click();
    await expect(page).toHaveURL(new RegExp(`/clients/${clientCode}$`));
  });

  test('the real attachment appears on the Assets page and can be reviewed and deleted', async ({ page }) => {
    await page.goto('/assets');
    // Scope to our specific card, not .first() - other real assets may already be in the grid.
    const card = page.getByTestId('asset-card').filter({ hasText: 'e2e-test.png' }).filter({ hasText: CLIENT_NAME });
    await expect(card).toBeVisible({ timeout: 10_000 });

    await expect(card.getByRole('link', { name: 'Review' })).toHaveAttribute('href', /res\.cloudinary\.com|cloudinary/);

    // Delete it - this also exercises the real Cloudinary destroy() call, so it doubles as cleanup for the asset itself.
    // (ConfirmDeleteButton is a React-rendered modal, not a native confirm() dialog - no page.on('dialog') needed.)
    await card.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('heading', { name: 'Delete e2e-test.png?' })).toBeVisible();
    // The confirm modal is NOT a portal - it renders inline inside this same card's
    // subtree (ConfirmDeleteButton renders it as a sibling of its own trigger). Assets
    // are listed newest-first, so our card is likely first in the grid - a page-wide
    // "last Delete button" would click some OTHER card's trigger instead of our
    // modal's confirm button. Scoping to `card` avoids that entirely.
    await card.getByRole('button', { name: 'Delete' }).last().click();
    await expect(card).not.toBeVisible({ timeout: 10_000 });
    // Confirm via the API too - this is the real proof the Cloudinary destroy() call and DB row deletion both happened.
    const remaining = await (await apiFetch('/admin/media')).json();
    expect(remaining.some((m: { originalFilename: string }) => m.originalFilename === 'e2e-test.png')).toBe(false);
  });
});
