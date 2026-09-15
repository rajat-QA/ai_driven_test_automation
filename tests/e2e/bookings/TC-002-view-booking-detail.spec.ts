import { test, expect, BASE_URL } from '../../fixtures/auth';

test.describe('TC-002: View booking detail', () => {
  test('should display booking detail when clicking View Details', async ({ loggedInPage: page }) => {
    // -- Step 1: Navigate to bookings list --
    await page.getByTestId('nav-bookings').click();
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    // -- Step 2: Find first booking and click View Details --
    const viewDetailsLink = page.getByRole('link', { name: 'View Details' }).first();
    await expect(viewDetailsLink).toBeVisible();
    await viewDetailsLink.click();

    // -- Step 3: Verify booking detail page renders --
    await expect(page).toHaveURL(/\/bookings\/\d+$/);

    // -- Step 4: Assert booking detail content is visible --
    // Booking reference should be displayed
    const bookingRef = page.locator('span.font-mono.font-bold');
    await expect(bookingRef).toBeVisible();
    // Validate booking ref format: [LETTER]-[6 alphanumeric] (Business Rule §7)
    await expect(bookingRef).toHaveText(/^[A-Z]-[A-Z0-9]{6}$/);

    // Event title should be visible
    const eventTitle = page.getByRole('heading', { level: 1 });
    await expect(eventTitle).toBeVisible();
  });
});
