import { test } from '@playwright/test';

test('create a booking for testing', async ({ page }) => {
  const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
  const USERNAME = 'rajat.mahadik@nec.com';
  const PASSWORD = 'Test@1212#1';

  await page.goto(BASE_URL);
  await page.getByPlaceholder('you@email.com').fill(USERNAME);
  await page.getByPlaceholder('••••••').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForLoadState('networkidle');

  // Go to events
  await page.goto(`${BASE_URL}/events`);
  await page.waitForLoadState('networkidle');

  console.log('=== Events Page ===');
  const buttons = await page.locator('button').all();
  for (const button of buttons) {
    const text = await button.textContent();
    console.log(`Button: "${text?.trim()}"`);
  }

  // Find first "Book Now" or similar button
  const bookButtons = page.getByRole('button', { name: /book/i });
  const count = await bookButtons.count();
  console.log(`Found ${count} book buttons`);

  if (count > 0) {
    await bookButtons.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there's a confirmation dialog
    const confirmBtn = page.getByRole('button', { name: /confirm|yes|book/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      await confirmBtn.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('Booking created, URL:', page.url());
  }
});