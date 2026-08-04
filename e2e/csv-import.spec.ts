import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { deleteTestClient, apiFetch } from './backend-client';

const RUN_ID = Date.now();
const GOOD_CODE = `e2e-csv-good-${RUN_ID}`;
const BAD_CODE = `e2e-csv-bad-${RUN_ID}`;

let goodClientCode: string | null = null;
let badClientCode: string | null = null;

test.describe('CSV bulk import', () => {
  test.afterAll(async () => {
    if (goodClientCode) await deleteTestClient(goodClientCode);
    if (badClientCode) await deleteTestClient(badClientCode);
  });

  test('valid row succeeds, invalid-phone row fails, both reported per-row', async ({ page }) => {
    const csvPath = path.join(os.tmpdir(), `e2e-import-${RUN_ID}.csv`);
    const csv = [
      'Client Name,Client Code,Contact Email,Contact Phone,Business Name,Address',
      `E2E CSV Good ${RUN_ID},${GOOD_CODE},good@example.com,+61-2-9111222,Main Branch,1 Good St`,
      `E2E CSV Bad ${RUN_ID},${BAD_CODE},bad@example.com,not-a-phone,Main Branch,1 Bad St`,
    ].join('\n');
    fs.writeFileSync(csvPath, csv, 'utf8');

    await page.goto('/clients/import');
    await expect(page.getByRole('heading', { name: 'Bulk Import Clients' })).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(csvPath);
    await expect(page.getByText(/3\. Preview/)).toBeVisible();
    await expect(page.getByText(GOOD_CODE)).toBeVisible();
    await expect(page.getByText(BAD_CODE)).toBeVisible();

    await page.getByRole('button', { name: 'Confirm Upload' }).click();

    await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText('1 succeeded')).toBeVisible();
    await expect(page.getByText('1 failed')).toBeVisible();
    await expect(page.getByText(/only digits, \+ and - are allowed/i)).toBeVisible();

    fs.unlinkSync(csvPath);

    const res = await apiFetch('/clients');
    const clients = await res.json();
    const good = clients.find((c: { clientId: string }) => c.clientId === GOOD_CODE);
    const bad = clients.find((c: { clientId: string }) => c.clientId === BAD_CODE);
    expect(good, 'valid row should have created a real client').toBeTruthy();
    expect(bad, 'invalid-phone row should NOT have created a client').toBeFalsy();
    goodClientCode = good?.id ?? null;
  });

  test('template download link is present and points at the real template file', async ({ page }) => {
    await page.goto('/clients/import');
    const link = page.getByRole('link', { name: 'Download Template' });
    await expect(link).toHaveAttribute('href', '/client-import-template.csv');
    const res = await page.request.get('/client-import-template.csv');
    expect(res.ok()).toBeTruthy();
  });
});
