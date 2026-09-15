### TC-001: View My Bookings list
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in and has one or more confirmed bookings.
**Steps**:
1. Log in with a valid account.
2. Navigate to the bookings area from the global navigation or by opening `/bookings` directly.
3. Review the list of bookings.
**Expected Results**:
- The bookings page loads successfully.
- Each booking card displays booking reference, event title, customer name, email, phone, quantity, total price, and a “View Details” action.
- The “Clear All Bookings” action is visible when the user has bookings.
**Business Rule**: Users can view their own bookings after completing a booking.
**Suggested Layer**: E2E

### TC-002: Open a booking detail page
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in and has at least one booking.
**Steps**:
1. Open the bookings list.
2. Click the “View Details” action for the first booking.
**Expected Results**:
- The booking detail page opens successfully.
- Booking reference, quantity, total price, linked event information, and personal customer details are shown.
- “Check Refund Eligibility” and “Cancel Booking” actions are visible.
**Business Rule**: Booking details are accessible for confirmed user-owned bookings.
**Suggested Layer**: E2E

### TC-003: Create a booking from event detail
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in and an event with available seats is visible.
**Steps**:
1. Open an event detail page.
2. Select a quantity between 1 and 10.
3. Enter valid customer name, email, and phone number.
4. Click “Confirm Booking”.
**Expected Results**:
- A booking confirmation card appears.
- The booking reference matches the format `[FIRST_LETTER]-[6_RANDOM_ALPHANUMERIC]` and the first letter matches the event title’s first character.
- The displayed total price equals `event.price x quantity`.
- The user can continue to “View My Bookings” or “Browse Events”.
**Business Rule**: Booking creation adds a confirmed booking and generates a valid booking reference.
**Suggested Layer**: E2E

### TC-004: Cancel a single booking
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User owns a booking that is currently active.
**Steps**:
1. Open the booking detail page.
2. Click “Cancel Booking”.
3. Confirm the cancellation if prompted.
**Expected Results**:
- The booking is removed from the user’s bookings list.
- The booking is no longer accessible from the detail page.
- The event’s available seat count increases immediately.
**Business Rule**: Booking deletion immediately frees seats and removes the booking from the account.
**Suggested Layer**: E2E

### TC-005: Clear all bookings for the current user
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User has at least one booking.
**Steps**:
1. Open `/bookings`.
2. Click “Clear All Bookings”.
3. Confirm the action.
**Expected Results**:
- All bookings belonging to the user are removed.
- The empty-state view is displayed.
- Seat counts for any affected events are restored.
**Business Rule**: User can clear all bookings in one action; all related seats are released.
**Suggested Layer**: E2E

### TC-006: Check refund eligibility for a single-ticket booking
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has a booking with quantity equal to 1.
**Steps**:
1. Open the booking detail page.
2. Click “Check Refund Eligibility”.
3. Wait for the refund result to display.
**Expected Results**:
- A loader or spinner appears for approximately 4 seconds.
- The result states: “Single-ticket bookings qualify for a full refund”.
**Business Rule**: Frontend-only refund logic marks a single-ticket booking as refundable.
**Suggested Layer**: E2E

### TC-007: Check refund eligibility for a multi-ticket booking
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has a booking with quantity greater than 1.
**Steps**:
1. Open the booking detail page.
2. Click “Check Refund Eligibility”.
3. Wait for the refund result to display.
**Expected Results**:
- A loader is shown briefly.
- The result states that group bookings are non-refundable and includes the quantity-specific message.
**Business Rule**: Multi-ticket bookings are not eligible for refund.
**Suggested Layer**: E2E

### TC-008: Booking reference matches the event title’s leading letter
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has created at least one booking from an event whose title has a known first character.
**Steps**:
1. Create or open a booking.
2. Capture the booking reference from the confirmation screen or booking list.
**Expected Results**:
- The first character of the booking reference is uppercase and matches the event title’s first letter.
- The rest of the reference is 6 random alphanumeric characters.
**Business Rule**: Booking references use the event title’s first letter as the prefix.
**Suggested Layer**: E2E

### TC-101: Total price is calculated correctly
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User is logged in and can see an event’s price.
**Steps**:
1. Open an event detail page.
2. Choose quantity `N`.
3. Create a booking.
**Expected Results**:
- The total price displayed for the booking equals `event.price x N`.
- The stored booking total matches the same value.
**Business Rule**: `totalPrice = event.price x quantity`.
**Suggested Layer**: API

### TC-102: Booking reduces available seats immediately
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User is logged in and sees an event with a known available seat count.
**Steps**:
1. Record the event’s available seats before booking.
2. Create a booking with quantity `Q`.
3. Refresh the event detail or return to the event list.
**Expected Results**:
- Available seats are reduced by the booked quantity.
- The seat count change is immediately reflected in the event availability information.
**Business Rule**: Booking immediately reduces available seats for the user’s booking.
**Suggested Layer**: E2E

### TC-103: Cancelling a booking restores seats
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has a recently created booking.
**Steps**:
1. Record the event’s available seat total.
2. Cancel the booking.
3. Re-open the event detail.
**Expected Results**:
- The available seat count is restored by the quantity that was canceled.
- The event is once again available for booking with the released seats.
**Business Rule**: Booking cancellation immediately frees seats.
**Suggested Layer**: E2E

### TC-104: Booking list enforces the 9-booking limit using FIFO pruning
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has already reached 9 active bookings.
**Steps**:
1. Create a new booking.
2. Open the bookings list.
**Expected Results**:
- The count of bookings remains at no more than 9.
- The oldest booking is removed to make space for the newest one.
**Business Rule**: Max 9 bookings per user; oldest bookings are pruned first in FIFO order.
**Suggested Layer**: API

### TC-105: Cross-user booking access is blocked
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User A has an existing booking and User B is logged in.
**Steps**:
1. User A captures a booking ID or reference.
2. User B logs in and attempts to open User A’s booking detail.
**Expected Results**:
- Access is denied with a clear access-denied or forbidden state.
- User B cannot view or manipulate User A’s booking.
**Business Rule**: Users can only access their own bookings; cross-user access returns 403/Access Denied.
**Suggested Layer**: E2E

### TC-200: Unauthenticated user cannot access bookings API or page
**Category**: Security
**Priority**: P0
**Preconditions**: No active session or token.
**Steps**:
1. Request the bookings list endpoint directly without credentials.
2. Try to open the bookings page in an unauthenticated browser session.
**Expected Results**:
- The API responds with unauthorized status.
- The UI redirects to login or shows an access requirement.
**Business Rule**: Booking actions and listing require a valid bearer token.
**Suggested Layer**: API

### TC-201: User cannot view another user’s booking by ID
**Category**: Security
**Priority**: P0
**Preconditions**: User A has a booking and User B is logged in.
**Steps**:
1. User B enters a URL that matches User A’s booking detail path.
2. User B submits the request.
**Expected Results**:
- The booking detail is not displayed.
- The UI shows an “Access Denied” or equivalent unauthorized state.
**Business Rule**: Cross-user access is forbidden.
**Suggested Layer**: E2E

### TC-300: Reject invalid booking quantity
**Category**: Negative
**Priority**: P0
**Preconditions**: User is logged in and on the booking form.
**Steps**:
1. Attempt to create a booking with quantity `0`.
2. Attempt to create a booking with quantity greater than 10.
3. Attempt to submit without a valid quantity value.
**Expected Results**:
- The booking is not created.
- A validation error or disabled button prevents submission.
**Business Rule**: Quantity must be within 1–10 for a valid booking.
**Suggested Layer**: E2E

### TC-301: Reject invalid customer contact data
**Category**: Negative
**Priority**: P0
**Preconditions**: User is on the booking form.
**Steps**:
1. Submit with a customer name shorter than 2 characters.
2. Submit with an invalid email format.
3. Submit with a phone number below 10 digits.
**Expected Results**:
- Validation errors appear for invalid data.
- The booking is not submitted.
**Business Rule**: Customer name, email, and phone fields are required and must match expected format.
**Suggested Layer**: E2E

### TC-302: Reject booking when seats are insufficient
**Category**: Negative
**Priority**: P0
**Preconditions**: Event has limited available seats and the user attempts a quantity beyond that limit.
**Steps**:
1. Open the booking form for the event.
2. Attempt to book more seats than are available.
3. Submit the form.
**Expected Results**:
- The submission is rejected.
- An “Insufficient seats available” error is displayed.
**Business Rule**: A booking cannot exceed available seats.
**Suggested Layer**: API

### TC-303: Reject booking for a past event date
**Category**: Negative
**Priority**: P1
**Preconditions**: User is creating a booking for a date in the past or a request sent through the API attempts this.
**Steps**:
1. Submit a booking for a past event date.
2. Alternatively, attempt to create an event with a date earlier than today.
**Expected Results**:
- The request is rejected with a validation error.
- No booking is created.
**Business Rule**: Event dates must be in the future.
**Suggested Layer**: API

### TC-400: Booking limit boundary at exactly 9
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User has exactly 8 active bookings.
**Steps**:
1. Create one more booking.
2. Inspect the booking count after creation.
**Expected Results**:
- The total becomes 9, not 10.
- No old booking is pruned because the limit was not yet exceeded.
**Business Rule**: The booking limit is 9 active bookings; the oldest booking is removed only when the limit is exceeded.
**Suggested Layer**: API

### TC-401: Booking limit boundary when exceeding 9 by one
**Category**: Edge Case
**Priority**: P1
**Preconditions**: User has exactly 9 active bookings.
**Steps**:
1. Create a 10th booking.
2. Inspect the list and the oldest booking.
**Expected Results**:
- The oldest booking is removed automatically.
- The new booking is displayed and the total count returns to 9.
**Business Rule**: FIFO pruning occurs when the count crosses the maximum.
**Suggested Layer**: API

### TC-402: Booking reference generation with repeated collisions
**Category**: Edge Case
**Priority**: P2
**Preconditions**: The app is in a state where the same booking prefix or random suffix collision possibility exists.
**Steps**:
1. Trigger rapid repeated booking creation requests.
2. Inspect generated references.
**Expected Results**:
- Unique references are created despite collision risk.
- The system retries until a unique identifier is generated.
**Business Rule**: Booking references must be unique; collision retries are used.
**Suggested Layer**: API

### TC-500: Empty bookings state
**Category**: UI State
**Priority**: P1
**Preconditions**: User has no bookings.
**Steps**:
1. Log in and navigate to `/bookings`.
**Expected Results**:
- Empty-state messaging is visible.
- No booking cards are displayed.
- The user is told how to create a booking or browse events.
**Business Rule**: The bookings page must handle a zero-booking state gracefully.
**Suggested Layer**: E2E

### TC-501: Refund eligibility spinner and state transitions
**Category**: UI State
**Priority**: P2
**Preconditions**: User is on a booking detail page with a quantity-based refund decision.
**Steps**:
1. Click “Check Refund Eligibility”.
2. Observe the user-visible loading state.
3. Wait until the final result is displayed.
**Expected Results**:
- The spinner is visible while the calculation is in progress.
- The final result replaces the loading state after approximately 4 seconds.
- The same booking detail remains stable while the result is shown.
**Business Rule**: Refund eligibility is a frontend-only, asynchronous result with a loader before final output.
**Suggested Layer**: Component

### TC-502: Booking page banner and limit warning state
**Category**: UI State
**Priority**: P2
**Preconditions**: User is close to or beyond the booking sandbox warning threshold.
**Steps**:
1. Navigate to the bookings page with several existing bookings.
2. Observe the warning banners.
**Expected Results**:
- A warning appears when the user holds near or above the sandbox warning threshold.
- The banner is hidden when the bookings count is low enough.
**Business Rule**: Booking-page warning banners signal sandbox limits when counts approach the threshold.
**Suggested Layer**: E2E
