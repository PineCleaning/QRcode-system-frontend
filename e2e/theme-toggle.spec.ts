import { test, expect } from '@playwright/test';

test.describe('Dark/light theme toggle', () => {
  test('defaults to light regardless of OS preference, toggles to dark, persists across reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' }); // OS says dark - app must still default to light
    await page.goto('/clients');
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: /switch to dark mode/i }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/); // persisted via localStorage

    await page.getByRole('button', { name: /switch to light mode/i }).click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });
});
