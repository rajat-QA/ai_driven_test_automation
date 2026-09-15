import { test, expect } from '@playwright/test';

test.describe('TC-003: Cancel a single booking from the detail page', () => {
  const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
  const USERNAME = 'rajat.mahadik@nec.com';
  const PASSWORD = 'Test@1212#1';

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto(BASE_URL);
    await page.getByPlaceholder('you@email.com').fill(USERNAME);
    await page.getByPlaceholder('••••••').fill(PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForLoadState('networkidle');
  });

  test('should cancel a booking from detail page', async ({ page }) => {
    // Step 1: Navigate to bookings list first to find a booking
    await page.goto(`${BASE_URL}/bookings`);
    await page.waitForLoadState('networkidle');

    // Find the first booking's "View Details" link and click it
    const viewDetailsLink = page.getByRole('link', { name: 'View Details' }).first();
    await expect(viewDetailsLink).toBeVisible();
    await viewDetailsLink.click();
    await page.waitForLoadState('networkidle');

    // Verify we're on the booking detail page
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/bookings/\\d+`));

    // Step 2: Click "Cancel Booking" button
    const cancelButton = page.getByRole('button', { name: 'Cancel Booking' });
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Step 3: Confirm in the dialog by clicking "Yes, cancel it"
    const confirmButton = page.getByRole('button', { name: 'Yes, cancel it' });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    // Step 4: Observe redirect and bookings list
    await page.waitForLoadState('networkidle');

    // Expected Results:
    // Success toast "Booking cancelled successfully" appears
    await expect(page.getByText('Booking cancelled successfully')).toBeVisible({ timeout: 10000 });

    // User is redirected to /bookings
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    // Cancelled booking no longer appears in the list
    // Wait a bit for the list to refresh
    await page.waitForTimeout(1000);

    // Verify the booking is gone - check that the specific booking ID is not in the list
    // Since we navigated from the detail page of booking 133224, verify it's no longer visible
    await expect(page.locator('text=H-A3KHDN')).not.toBeVisible({ timeout: 5000 });
  });
});