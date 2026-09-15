import { test, expect, BASE_URL } from '../../fixtures/auth';

test.describe('TC-001: View bookings list', () => {
  test('should display bookings list after login', async ({ loggedInPage: page }) => {
    // -- Step 1: Navigate to My Bookings --
    await page.getByTestId('nav-bookings').click();

    // -- Step 2: Verify bookings page renders --
    await expect(page).toHaveURL(`${BASE_URL}/bookings`);

    // -- Step 3: Assert at least one booking card or empty state is visible --
    const bookingCards = page.locator('#booking-card');
    const emptyState = page.getByText(/no bookings/i);

    // Either the booking list or empty state should be present
    //comment
    await expect(
      bookingCards.first().or(emptyState).first()
    ).toBeVisible();
  });
});
