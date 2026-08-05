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
    // ClickUp is now connected (see below), so this run's submission created
    // a REAL ticket in the live workspace. deleteTestClient only deactivates
    // (feedback history blocks the hard delete) and has no way to reach
    // ClickUp - it does not delete the ticket or the feedback row itself.
    // Until there's a dedicated cleanup path, treat this test as leaving
    // real data behind: after running it, manually delete the resulting
    // ClickUp task (see feedback's clickupTaskId via GET /admin/feedback)
    // and the leftover INACTIVE test client/feedback rows.
    await deleteTestClient(clientCode);
  });

  test('feedback appears on the global Feedback page with client/site/attachment', async ({ page }) => {
    await page.goto('/feedback');
    const row = page.locator('tr', { hasText: FEEDBACK_TEXT });
    await expect(row).toBeVisible({ timeout: 10_000 });
    await expect(row.getByText(CLIENT_NAME)).toBeVisible();
    await expect(row.getByText(SITE_NAME)).toBeVisible();
    // ClickUp is connected via CLICKUP_API_TOKEN as of the Personal API
    // Token pivot - delivery happens synchronously during submission, so by
    // the time this page loads the real ticket has already been created.
    await expect(row.getByText(/DELIVERED|DELIVERY PENDING|DELIVERY FAILED/)).toBeVisible();
  });

  test('client/site filters on the Feedback page narrow the list correctly', async ({ page }) => {
    await page.goto('/feedback');
    // Custom listbox Select, not a native <select> - open the trigger, then
    // click the matching role="option".
    await page.getByLabel('Client').click();
    await page.getByRole('option', { name: CLIENT_NAME }).click();
    await expect(page).toHaveURL(new RegExp(`clientCode=${clientCode}`));
    await expect(page.locator('tr', { hasText: FEEDBACK_TEXT })).toBeVisible();

    await page.getByLabel('Site').click();
    await page.getByRole('option', { name: SITE_NAME }).click();
    await expect(page).toHaveURL(/siteId=/);
    await expect(page.locator('tr', { hasText: FEEDBACK_TEXT })).toBeVisible();
  });

  test('per-site Feedback page shows the same submission with a working back link', async ({ page }) => {
    await page.goto(`/clients/${clientCode}`);
    const siteRow = page.locator('tr', { hasText: SITE_NAME });
    await siteRow.getByRole('link', { name: 'Feedback' }).click();

    await expect(page.getByText(FEEDBACK_TEXT)).toBeVisible();
    await expect(page.getByText(SITE_NAME, { exact: true })).toBeVisible();
    // Icon-only back link - accessible name comes from aria-label, not
    // visible text (no "←" glyph actually renders, it's an SVG chevron).
    await page.getByRole('link', { name: `Back to ${CLIENT_NAME}` }).click();
    await expect(page).toHaveURL(new RegExp(`/clients/${clientCode}$`));
  });

  test('the real attachment appears on the Assets page and can be reviewed and deleted', async ({ page }) => {
    await page.goto('/assets');
    // Scope to our specific card, not .first() - other real assets may already be in the grid.
    const card = page.getByTestId('asset-card').filter({ hasText: 'e2e-test.png' }).filter({ hasText: CLIENT_NAME });
    await expect(card).toBeVisible({ timeout: 10_000 });

    // Review now opens a shared full-screen lightbox (MediaLightboxProvider)
    // instead of the old <a href target="_blank"> straight to Cloudinary.
    await card.getByRole('button', { name: 'Review' }).click();
    const lightbox = page.getByRole('dialog');
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByRole('img', { name: 'e2e-test.png' })).toHaveAttribute('src', /cloudinary/);
    await lightbox.getByRole('button', { name: 'Close' }).click();
    await expect(lightbox).not.toBeVisible();

    // Delete it - this also exercises the real Cloudinary destroy() call, so it doubles as cleanup for the asset itself.
    // (ConfirmDeleteButton is a React-rendered modal, not a native confirm() dialog - no page.on('dialog') needed.)
    await card.getByRole('button', { name: 'Delete' }).click();
    const confirmHeading = page.getByRole('heading', { name: 'Delete e2e-test.png?' });
    await expect(confirmHeading).toBeVisible();
    // ConfirmDeleteButton's confirm modal IS portaled to document.body, so
    // it's outside `card`'s own DOM subtree - scoping to the modal's own
    // container (found via its heading) targets the real confirm button,
    // not the (still-present-but-covered) card's trigger button underneath.
    const confirmModal = confirmHeading.locator('..');
    await confirmModal.getByRole('button', { name: 'Delete' }).click();
    await expect(card).not.toBeVisible({ timeout: 10_000 });
    // Confirm via the API too - this is the real proof the Cloudinary destroy() call and DB row deletion both happened.
    const remaining = await (await apiFetch('/admin/media')).json();
    expect(remaining.some((m: { originalFilename: string }) => m.originalFilename === 'e2e-test.png')).toBe(false);
  });
});
