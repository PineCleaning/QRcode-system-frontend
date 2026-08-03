import { test, expect } from '@playwright/test';

test.describe('Auth & navigation', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // force logged-out for this file

  test('unauthenticated visitor is redirected to /login', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/);
  });

  test('login rejects wrong password with a visible error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@pinecleaning.com');
    await page.getByLabel('Password').fill('definitely-wrong-password');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|incorrect|error/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authenticated navigation', () => {
  test('sidebar links move between Clients, Feedbacks, Assets', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.getByRole('heading', { name: 'Clients' })).toBeVisible();

    await page.getByRole('link', { name: 'Feedbacks' }).click();
    await expect(page).toHaveURL(/\/feedback/);
    await expect(page.getByRole('heading', { name: 'Feedback' })).toBeVisible();

    await page.getByRole('link', { name: 'Assets' }).click();
    await expect(page).toHaveURL(/\/assets/);
    await expect(page.getByRole('heading', { name: 'Assets' })).toBeVisible();

    await page.getByRole('link', { name: 'Clients' }).click();
    await expect(page).toHaveURL(/\/clients$/);
  });

  test('sign out returns to login and re-protects the dashboard', async ({ browser }) => {
    // Deliberately logs in fresh in its own context instead of reusing the
    // shared storageState (admin.json): Supabase's signOut(), even with
    // { scope: 'local' } (the real app fix made this session - only
    // revokes THIS session, not the admin's other devices), still revokes
    // that one session's refresh token server-side. Every other test's
    // context is cloned from the exact same saved session, so signing out
    // there would silently invalidate the shared session every other test
    // in the run depends on. This is purely a test-isolation concern, not
    // something the app fix needed to solve.
    // Must explicitly override the project's default storageState (an
    // already-authenticated session, e2e/.auth/admin.json) to a logged-out
    // one - browser.newContext() otherwise inherits it too, meaning
    // page.goto('/login') would just redirect straight back to /clients
    // (the app correctly redirecting an authenticated visitor away from
    // /login), and this test would hang waiting for an Email field that
    // never appears.
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await context.newPage();
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel('Password').fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/clients/, { timeout: 15_000 });

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/login/);

    await context.close();
  });
});
