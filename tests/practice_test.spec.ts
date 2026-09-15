import { test, expect } from '@playwright/test';


test('Testing 1st application', async ({ page }) => {
  await page.goto('https://rahulshettyacademy.com/client');
  await page.getByPlaceholder('email@example.com').fill('rahulshettyw@gmail.com');
  await page.getByPlaceholder('enter your passsword').fill('Learning@830$3mK3');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');
  await page.click(`[routerlink='/dashboard/myorders']`);
  await page.locator(`tbody`).first().waitFor();

});

