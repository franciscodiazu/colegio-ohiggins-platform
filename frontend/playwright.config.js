import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import os from 'os';

const chromiumPath = path.join(
  os.homedir(),
  'AppData', 'Local', 'ms-playwright',
  'chromium-1223', 'chrome-win64', 'chrome.exe'  // ← chrome-win64, no chrome-win
);

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    headless: true,
    launchOptions: {
      executablePath: chromiumPath,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});