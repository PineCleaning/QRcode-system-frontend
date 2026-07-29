import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

// Loads e2e/.env (gitignored - real admin credentials, never committed)
loadEnv({ path: './e2e/.env' });

/**
 * Targets the already-running dev servers (frontend :3001, backend :3000)
 * rather than spawning its own via webServer - this is a pre-handoff
 * end-to-end pass against the real running app, not a CI unit-test setup.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // tests create/mutate real data against a shared dev DB - parallel runs would race each other
  workers: 1, // same reason across files too - a single shared admin session + real DB, not isolated fixtures
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e-report' }]],
  timeout: 60_000, // generous for local dev-mode Next.js, which compiles routes on-demand on first hit
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup'],
    },
  ],
});
