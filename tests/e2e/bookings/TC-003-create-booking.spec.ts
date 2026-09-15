import { test, expect, BASE_URL } from '../../fixtures/auth';

test.describe('TC-003: Create a booking', () => {
  test('should create a booking for an event', async ({ loggedInPage: page }) => {
    // -- Step 1: Navigate to Browse Events --
    await page.getByRole('link', { name: 'Browse Events →' }).click();
    await expect(page).toHaveURL(`${BASE_URL}/events`);

    // -- Step 2: Click Book Now on the first bookable event --
    // Select by accessible name so sold-out events (aria-disabled, "Sold Out") are skipped.
    const bookNowBtn = page.getByRole('link', { name: 'Book Now' });
    await expect(bookNowBtn.first()).toBeVisible();
    await bookNowBtn.first().click();

    // -- Step 3: Verify event detail page --
    await expect(page).toHaveURL(/\/events\/\d+$/);

    // -- Step 4: Select quantity and fill customer form --
    const incrementBtn = page.getByRole('button', { name: '+' });
    await expect(incrementBtn).toBeVisible();
    await incrementBtn.click();

    await page.getByLabel('Full Name').fill('Test Customer');
    await page.locator('#customer-email').fill('test@example.com');
    await page.getByPlaceholder('+91 98765 43210').fill('9876543210');

    // -- Step 5: Click Confirm Booking --
    const confirmBtn = page.locator('.confirm-booking-btn');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // -- Step 6: Verify confirmation card with booking reference --
    const bookingRef = page.locator('.booking-ref');
    await expect(bookingRef).toBeVisible();
    // Booking ref format: [FIRST_LETTER]-[6_RANDOM] (Business Rule §7)
    await expect(bookingRef).toHaveText(/^[A-Z]-[A-Z0-9]{6}$/);
  });
});
