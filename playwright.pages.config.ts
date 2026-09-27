import { defineConfig, devices } from '@playwright/test';

const basePath = process.env.PAGES_BASE_PATH || '/';
const url = `http://127.0.0.1:4173${basePath}`;

export default defineConfig({
  testDir: './tests/deployment',
  use: { baseURL: url, ...devices['Desktop Chrome'] },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url,
    reuseExistingServer: false,
  },
});
