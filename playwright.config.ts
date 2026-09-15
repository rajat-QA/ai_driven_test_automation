import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: 'html',
  expect: {
    timeout: 5000
  },
  use: {
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
    }]
});
