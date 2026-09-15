import { test } from '@playwright/test';

test('check current bookings', async ({ page }) => {
  const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
  const USERNAME = 'rajat.mahadik@nec.com';
  const PASSWORD = 'Test@1212#1';

  await page.goto(BASE_URL);
  await page.getByPlaceholder('you@email.com').fill(USERNAME);
  await page.getByPlaceholder('••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');

  await page.goto(`${BASE_URL}/bookings`);
  await page.waitForLoadState('networkidle');

  // Print all buttons and links
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const text = await button.textContent();
    console.log(`Button: "${text?.trim()}"`);
  }

  const links = await page.locator('a').all();
  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    if (href) console.log(`Link: "${text?.trim()}" -> ${href}`);
  }

  const bodyText = await page.locator('body').textContent();
  console.log('Body:', bodyText?.substring(0, 3000));
});