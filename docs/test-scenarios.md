# EventHub — Booking Management Test Scenarios

Scope: End-to-end coverage of the booking management feature (`/bookings`, `/bookings/:id`, booking creation, cancellation, refund eligibility, and cross-user access).

Numbering: TC-001–099 Happy Path, TC-100–199 Business Rules, TC-200–299 Security, TC-300–399 Negative, TC-400–499 Edge Cases, TC-500–599 UI State.

---

## Happy Path

### TC-001: View My Bookings list
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in and has at least one confirmed booking.
**Steps**:
1. Log in as `rahulshetty1@gmail.com / Magiclife1!`.
2. Navigate to `/bookings` (or click "View My Bookings" link in nav).
**Expected Results**:
- Bookings list page renders.
- Each booking card shows booking reference, event title, customer name, email, phone, quantity, total price, and a "View Details" link.
- "Clear All Bookings" link is visible at the top of the list.
**Suggested Layer**: E2E

### TC-002: View booking detail
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User has a confirmed booking.
**Steps**:
1. Log in.
2. Navigate to `/bookings`.
3. Click "View Details" on the first booking card.
**Expected Results**:
- URL changes to `/bookings/:id`.
- Booking reference, customer info, quantity, total price, and linked event details (title, date, venue, city) are all displayed.
- "Check Refund Eligibility" and "Cancel Booking" controls are visible.
**Suggested Layer**: E2E

### TC-003: Create a new booking from event detail
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in. At least one event exists with available seats.
**Steps**:
1. Log in.
2. Navigate to `/events`.
3. Click "Book Now" on any event with available seats.
4. Set quantity to 2 using `+` button (start from 1).
5. Fill Full Name, Email (`customer@test.com`), Phone (`9876543210`).
6. Click "Confirm Booking" (`.confirm-booking-btn`).
**Expected Results**:
- Confirmation card appears with a generated booking reference of form `[FIRST_LETTER]-[6_RANDOM]` where the first letter matches the uppercase first letter of the event title.
- Total price equals `event.price * quantity`.
- "View My Bookings" and "Browse Events" links are present after confirmation.
**Suggested Layer**: E2E

### TC-004: Cancel a single booking
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User has a confirmed booking.
**Steps**:
1. Log in.
2. Navigate to `/bookings/:id` for an existing booking.
3. Click "Cancel Booking" (or equivalent).
4. Confirm cancellation if prompted.
**Expected Results**:
- Booking is removed.
- Available seat count for the linked event is restored immediately.
- User is redirected back to `/bookings` (or list no longer shows the booking).
**Suggested Layer**: E2E

### TC-005: Clear all bookings
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User has at least one confirmed booking.
**Steps**:
1. Log in.
2. Navigate to `/bookings`.
3. Click "Clear All Bookings".
4. Confirm the action.
**Expected Results**:
- All bookings belonging to the user are deleted.
- Empty-state message is shown (e.g., "No bookings yet").
- Available seats for the affected events are restored.
**Suggested Layer**: E2E

### TC-006: Booking reference format is correct
**Category**: Happy Path
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. Create a booking for an event whose title starts with "T" (e.g., "Tech Summit").
2. Capture the displayed booking reference.
**Expected Results**:
- Reference matches regex `^[A-Z]-[A-Z0-9]{6}$`.
- First character is `T` (uppercase first letter of the event title).
- Reference is unique across the bookings list.
**Suggested Layer**: E2E

### TC-007: Pagination on bookings list
**Category**: Happy Path
**Priority**: P2
**Preconditions**: User has more than 9 bookings.
**Steps**:
1. Log in.
2. Create 10+ bookings (across multiple events).
3. Navigate to `/bookings`.
4. Use pagination controls.
**Expected Results**:
- At most 9 bookings per page.
- Pagination links/buttons navigate to subsequent pages.
- All bookings remain accessible via the UI across pages.
**Suggested Layer**: E2E

### TC-008: View booking by reference lookup
**Category**: Happy Path
**Priority**: P2
**Preconditions**: User has a confirmed booking.
**Steps**:
1. Note a booking reference from `/bookings`.
2. Use API `GET /api/bookings/ref/:ref` with the user's Bearer token.
**Expected Results**:
- Returns `{ data: Booking }` with the matching booking.
- Response status is 200.
**Suggested Layer**: API

---

## Business Rules

### TC-101: Total price equals price × quantity
**Category**: Business Rule
**Priority**: P0
**Preconditions**: Logged-in user. Event has known `price`.
**Steps**:
1. Create a booking with quantity = N (1 ≤ N ≤ 10).
2. Read `totalPrice` from confirmation / booking detail.
**Expected Results**:
- `totalPrice` equals `event.price * N` exactly (no rounding drift beyond backend precision).
- `totalPrice` is non-negative.
**Business Rule**: Rule 9 — `totalPrice = event.price x quantity`.
**Suggested Layer**: API

### TC-102: Booking reference first letter matches event title first letter
**Category**: Business Rule
**Priority**: P0
**Preconditions**: Logged-in user. Event titles start with distinct letters.
**Steps**:
1. Create one booking per event whose titles start with different first letters (e.g., "Tech Summit" → T, "Bollywood Night" → B).
2. Capture each `bookingRef`.
**Expected Results**:
- Each `bookingRef` first character matches the uppercase first letter of the event title.
- Pattern: `[FIRST_LETTER]-[6_RANDOM]`.
**Business Rule**: Rule 7 — First letter of booking reference comes from the event title.
**Suggested Layer**: E2E

### TC-103: Booking status is always "confirmed"
**Category**: Business Rule
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. Create a booking.
2. Inspect the booking record via detail page or `GET /api/bookings/:id`.
**Expected Results**:
- `status` field equals the literal string `"confirmed"`.
- No other status values are exposed via the create flow.
**Business Rule**: Data model — Booking.status is always "confirmed".
**Suggested Layer**: API

### TC-104: Seat count reduces immediately on booking
**Category**: Business Rule
**Priority**: P0
**Preconditions**: Logged-in user. Event with `availableSeats = S`.
**Steps**:
1. Note `availableSeats` for the event on `/events/:id`.
2. Create a booking for `quantity = Q`.
3. Re-open `/events/:id` (or `GET /api/events/:id`).
**Expected Results**:
- `availableSeats` is now `S - Q` (for dynamic events: based on sum of this user's booking quantities; for static events: based on DB field).
- Reduction is visible immediately after confirmation.
**Business Rule**: Rule 6 — Seat count reduces immediately on booking.
**Suggested Layer**: E2E

### TC-105: Cancellation frees seats immediately
**Category**: Business Rule
**Priority**: P0
**Preconditions**: User has a booking for an event.
**Steps**:
1. Note `availableSeats` on the event detail page.
2. Cancel the booking via detail page.
3. Re-open the event detail page.
**Expected Results**:
- `availableSeats` has increased by the booking's `quantity` (capped at `totalSeats`).
- The change is visible without a manual refresh after the cancel returns.
**Business Rule**: Rule 4 — Booking deletion immediately frees seats.
**Suggested Layer**: E2E

### TC-106: Max 9 bookings enforced via FIFO pruning
**Category**: Business Rule
**Priority**: P0
**Preconditions**: Logged-in user with 9 existing bookings.
**Steps**:
1. Create a 10th booking.
2. Inspect bookings list and DB state.
**Expected Results**:
- The OLDEST existing booking is automatically removed.
- The new booking appears in the list.
- Total count remains at most 9.
**Business Rule**: Rule 4 — Max 9 bookings; oldest is deleted FIFO.
**Suggested Layer**: API

### TC-107: Single-ticket booking is refund-eligible
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has a booking with `quantity = 1`.
**Steps**:
1. Open `/bookings/:id` for a single-ticket booking.
2. Click "Check Refund Eligibility" (`#check-refund-btn`).
3. Wait for `#refund-spinner` to finish (4s animation).
4. Read `#refund-result`.
**Expected Results**:
- Spinner is shown for ~4 seconds.
- Result text contains: "Single-ticket bookings qualify for a full refund".
**Business Rule**: Rule 8 — `quantity = 1` → eligible for full refund; 4s spinner.
**Suggested Layer**: E2E

### TC-108: Multi-ticket booking is non-refundable
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has a booking with `quantity > 1` (e.g., 3).
**Steps**:
1. Open `/bookings/:id` for a group booking.
2. Click "Check Refund Eligibility" (`#check-refund-btn`).
3. Wait for `#refund-spinner` to finish.
4. Read `#refund-result`.
**Expected Results**:
- Spinner is shown for ~4 seconds.
- Result text contains: "Group bookings (N tickets) are non-refundable", where N equals the booking's quantity.
**Business Rule**: Rule 8 — `quantity > 1` → not eligible for refund.
**Suggested Layer**: E2E

### TC-109: Sandbox warning banner on bookings page
**Category**: Business Rule
**Priority**: P2
**Preconditions**: Logged-in user.
**Steps**:
1. With < 5 bookings, navigate to `/bookings`.
2. Create bookings up to >= 5 displayed, then reload `/bookings`.
**Expected Results**:
- When count is low: no sandbox banner.
- When count is high (close to or at 9): banner appears with text matching `/sandbox holds up to/i` (or similar warning about 6 events / 9 bookings limit).
**Business Rule**: Rule 5 — Conditional sandbox warning banners.
**Suggested Layer**: E2E

### TC-110: Per-user seat availability for dynamic events
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has booked quantity X of a user-created (dynamic) event.
**Steps**:
1. Create one dynamic event with `totalSeats = T`.
2. Book quantity X.
3. Re-open the event detail page.
**Expected Results**:
- `availableSeats` shown is `T - X` (computed per-user, not the static DB field).
- A second booking for the same event by the SAME user further reduces per-user availability.
**Business Rule**: Rule 6 — For dynamic events, `availableSeats = totalSeats - sum(user's booking quantities)`.
**Suggested Layer**: E2E

---

## Security

### TC-201: Cross-user booking access returns 403
**Category**: Security
**Priority**: P0
**Preconditions**: User A has at least one booking.
**Steps**:
1. As User A, note a booking ID.
2. Log out, log in as User B.
3. Navigate to `/bookings/:userA_booking_id`.
4. Repeat via API: `GET /api/bookings/:userA_booking_id` with User B's Bearer token.
**Expected Results**:
- UI: shows "Access Denied" / 403 message; no booking details leaked.
- API: response status 403 with body containing "Forbidden" or "Access Denied".
- User B's own bookings list does NOT include User A's booking.
**Business Rule**: Rule 2 — Cross-user booking access returns 403.
**Suggested Layer**: E2E + API

### TC-202: Cross-user booking cancellation rejected
**Category**: Security
**Priority**: P0
**Preconditions**: User A has a booking.
**Steps**:
1. As User A, capture booking ID.
2. Log in as User B.
3. Send `DELETE /api/bookings/:userA_booking_id` with User B's token.
**Expected Results**:
- Response status 403 (or 404). No state change.
- User A's booking remains intact and viewable from User A's session.
**Business Rule**: Rule 2 — Sandbox isolation; cross-user access forbidden.
**Suggested Layer**: API

### TC-203: Unauthenticated booking access rejected
**Category**: Security
**Priority**: P0
**Preconditions**: No auth token.
**Steps**:
1. `GET /api/bookings` (no Authorization header).
2. `POST /api/bookings` (no token, valid body).
3. `DELETE /api/bookings/:id` (no token).
**Expected Results**:
- All return HTTP 401 with message "Unauthorized".
- No booking is created or deleted.
**Business Rule**: Auth required for all booking endpoints.
**Suggested Layer**: API

### TC-204: Clear All Bookings only affects the current user
**Category**: Security
**Priority**: P0
**Preconditions**: Both User A and User B have bookings.
**Steps**:
1. Create bookings for User A and User B in different sessions.
2. As User A, click "Clear All Bookings".
**Expected Results**:
- Only User A's bookings are deleted.
- User B's bookings are untouched and still visible in their session.
**Business Rule**: Rule 2 — Per-user sandbox isolation.
**Suggested Layer**: E2E

### TC-205: Booking ownership cannot be spoofed via request body
**Category**: Security
**Priority**: P0
**Preconditions**: Logged in as User A.
**Steps**:
1. Send `POST /api/bookings` with body including `userId` set to User B's id.
2. Send `POST /api/bookings` with body including `bookingRef` set to a forged value.
**Expected Results**:
- Server ignores/forbids `userId` in the body; the booking is created under User A.
- Server generates `bookingRef` itself; client-supplied value is ignored.
- No 500/internal error.
**Business Rule**: Server-side authorization — owner and reference must be server-assigned.
**Suggested Layer**: API

### TC-206: User deletion cascades to bookings
**Category**: Security
**Priority**: P1
**Preconditions**: Logged-in user with bookings (test in isolated env).
**Steps**:
1. Note the user's `id`.
2. DELETE the user via admin/internal path (or DB-level in a test env).
3. Query bookings for the deleted user.
**Expected Results**:
- All bookings belonging to that user are also deleted (cascade).
- No orphaned booking records remain referencing the deleted user.
**Business Rule**: Rule 2 — Deleting a user cascades to their events and bookings.
**Suggested Layer**: API / DB

### TC-207: JWT tampering rejected
**Category**: Security
**Priority**: P0
**Preconditions**: Logged-in user with a valid token.
**Steps**:
1. Capture a valid Bearer token.
2. Mutate a single character in the token (or the signature).
3. Send `GET /api/bookings` with the tampered token.
**Expected Results**:
- Response is HTTP 401.
- No booking data is returned.
**Business Rule**: JWT (7-day expiry) — integrity must be enforced.
**Suggested Layer**: API

---

## Negative / Error

### TC-301: Booking with missing required fields
**Category**: Negative
**Priority**: P0
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with body omitting `eventId`, `customerName`, `customerEmail`, `customerPhone`, or `quantity`.
**Expected Results**:
- HTTP 400 with validation error details.
- No booking is created.
- No seat decrement.
**Suggested Layer**: API

### TC-302: Booking with invalid email format
**Category**: Negative
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with `customerEmail = "not-an-email"`.
**Expected Results**:
- HTTP 400 with field-level validation error for email.
- No booking created.
**Business Rule**: Data model — `customerEmail` must be a valid email.
**Suggested Layer**: API

### TC-303: Booking with phone number too short
**Category**: Negative
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with `customerPhone = "12345"` (fewer than 10 digits).
2. Try UI submission with phone `99999`.
**Expected Results**:
- API: HTTP 400 with validation error mentioning phone length.
- UI: form shows an inline error and prevents submission.
**Business Rule**: Data model — `customerPhone` min 10 digits.
**Suggested Layer**: API + E2E

### TC-304: Booking with name shorter than 2 chars
**Category**: Negative
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with `customerName = "A"`.
**Expected Results**:
- HTTP 400 with validation error for name length.
**Business Rule**: Data model — `customerName` min 2 chars.
**Suggested Layer**: API

### TC-305: Booking with quantity below 1
**Category**: Negative
**Priority**: P0
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with `quantity = 0`.
2. `POST /api/bookings` with `quantity = -3`.
**Expected Results**:
- HTTP 400 with validation error.
- UI: `−` button disabled when count is 1 (cannot go below 1).
**Business Rule**: Data model — `quantity` 1–10.
**Suggested Layer**: API + E2E

### TC-306: Booking with quantity above 10
**Category**: Negative
**Priority**: P0
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with `quantity = 11`.
2. In UI, click `+` from 10; verify it is disabled or capped.
**Expected Results**:
- API: HTTP 400 with validation error.
- UI: `+` button is disabled at quantity 10; max 10 tickets enforced.
**Business Rule**: Data model — `quantity` 1–10.
**Suggested Layer**: API + E2E

### TC-307: Insufficient seats
**Category**: Negative
**Priority**: P0
**Preconditions**: Event with `availableSeats < requested quantity`.
**Steps**:
1. Pick an event with N seats left.
2. `POST /api/bookings` with `quantity = N + 1` (or UI attempt with `quantity = N + 1`).
**Expected Results**:
- API: HTTP 400 with body containing "Insufficient seats available".
- UI: form shows an error and does not submit.
**Business Rule**: Rule 6 — Seat availability must be enforced.
**Suggested Layer**: API + E2E

### TC-308: Booking against non-existent event
**Category**: Negative
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. `POST /api/bookings` with `eventId = 99999999` (does not exist).
**Expected Results**:
- HTTP 404 or 400 with descriptive error.
- No booking created.
**Suggested Layer**: API

### TC-309: Delete a non-existent booking
**Category**: Negative
**Priority**: P1
**Preconditions**: Logged-in user.
**Steps**:
1. `DELETE /api/bookings/99999999`.
**Expected Results**:
- HTTP 404 (or 403) — no destructive side effect.
- The user's other bookings are unaffected.
**Suggested Layer**: API

### TC-310: Invalid token format
**Category**: Negative
**Priority**: P1
**Preconditions**: None.
**Steps**:
1. `GET /api/bookings` with header `Authorization: Bearer not-a-jwt`.
**Expected Results**:
- HTTP 401.
- No data returned.
**Suggested Layer**: API

### TC-311: Cancelling an already-cancelled booking
**Category**: Negative
**Priority**: P2
**Preconditions**: A booking was just deleted.
**Steps**:
1. `DELETE /api/bookings/:id` for a booking that was just deleted (idempotency probe).
**Expected Results**:
- Idempotent: HTTP 404 (not found) is acceptable; HTTP 200 with no-op is also acceptable.
- No 5xx; no double seat credit.
**Suggested Layer**: API

### TC-312: Booking creation while logged out
**Category**: Negative
**Priority**: P0
**Preconditions**: User is logged out.
**Steps**:
1. Open `/events/:id` and try to submit the booking form.
2. Call `POST /api/bookings` with no token.
**Expected Results**:
- UI: redirects to `/login` or shows auth prompt.
- API: HTTP 401.
**Suggested Layer**: E2E + API

### TC-313: Backend rejects past event date on creation flow that triggers it
**Category**: Negative
**Priority**: P2
**Preconditions**: Logged-in user.
**Steps**:
1. Attempt to book against an event whose `eventDate` is in the past (if such an event is exposed by the API for booking).
**Expected Results**:
- HTTP 400 with body containing "Event date must be in the future" OR the event is not returned by `GET /api/events`.
- No booking created.
**Suggested Layer**: API

---

## Edge Cases

### TC-401: Boundary quantity — 1 ticket
**Category**: Edge Case
**Priority**: P1
**Preconditions**: Logged-in user. Event with seats ≥ 1.
**Steps**:
1. Create a booking with `quantity = 1`.
**Expected Results**:
- Booking created; `totalPrice = event.price * 1`.
- Refund check shows "Single-ticket bookings qualify for a full refund".
**Business Rule**: Rules 8, 9.
**Suggested Layer**: E2E

### TC-402: Boundary quantity — 10 tickets
**Category**: Edge Case
**Priority**: P1
**Preconditions**: Logged-in user. Event with seats ≥ 10.
**Steps**:
1. Create a booking with `quantity = 10`.
2. Increment in UI from 1 to 10; verify `+` is disabled at 10.
**Expected Results**:
- Booking created; `totalPrice = event.price * 10`.
- Refund check shows "Group bookings (10 tickets) are non-refundable".
**Business Rule**: Rules 8, 9; quantity 1–10.
**Suggested Layer**: E2E

### TC-403: Booking consumes last available seat
**Category**: Edge Case
**Priority**: P1
**Preconditions**: Event with `availableSeats = 1` (or sum-of-user-bookings leaves 1).
**Steps**:
1. Book `quantity = 1` (the last seat).
2. Re-open event detail.
**Expected Results**:
- Booking succeeds.
- `availableSeats = 0`.
- Subsequent booking attempt is rejected with "Insufficient seats available".
**Business Rule**: Rule 6.
**Suggested Layer**: E2E

### TC-404: Customer email differs from account email
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Logged-in user.
**Steps**:
1. Book a ticket using a `customerEmail` different from the logged-in user's email.
**Expected Results**:
- Booking is allowed (customer fields are independent of the account).
- Booking detail shows the supplied customer email.
**Business Rule**: Customer fields are decoupled from the User record.
**Suggested Layer**: E2E

### TC-405: Booking reference collision retry
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Logged-in user. Many bookings.
**Steps**:
1. Create many bookings rapidly against events with the same starting letter.
2. Inspect all `bookingRef` values.
**Expected Results**:
- All references are unique.
- Each reference's first character matches the event's first letter.
- No 5xx errors during creation.
**Business Rule**: Rule 7 — Guaranteed unique via collision retry.
**Suggested Layer**: API

### TC-406: Special characters in customer name
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Logged-in user.
**Steps**:
1. Book with `customerName` containing apostrophes, accents, or non-ASCII (e.g., `O'Brien`, `José`, `李雷`).
2. View the booking detail.
**Expected Results**:
- Booking created; name is rendered without corruption/escaping errors.
- No DB or UI crash.
**Suggested Layer**: E2E

### TC-407: Very long customer name
**Category**: Edge Case
**Priority**: P3
**Preconditions**: Logged-in user.
**Steps**:
1. Submit booking with `customerName` of 5000 characters.
**Expected Results**:
- Server validates length (rejects or truncates per backend rules) with HTTP 400, OR accepts and stores.
- UI does not break layout.
**Suggested Layer**: API

### TC-408: 9th booking triggers FIFO on the 10th
**Category**: Edge Case
**Priority**: P1
**Preconditions**: Logged-in user with exactly 9 bookings.
**Steps**:
1. Note the oldest booking's id.
2. Create a 10th booking.
3. Check `/bookings` and verify the oldest is gone and the new one is present.
**Expected Results**:
- Oldest booking deleted.
- Newest booking present.
- All others preserved in their original order.
**Business Rule**: Rule 4 — FIFO at 9.
**Suggested Layer**: API

### TC-409: Cancel last remaining booking
**Category**: Edge Case
**Priority**: P2
**Preconditions**: User has exactly 1 booking.
**Steps**:
1. Cancel the only booking.
2. Verify the bookings list empty state.
**Expected Results**:
- Empty state message displayed.
- No console errors.
- No sandbox banner when count is low.
**Business Rule**: Rule 5.
**Suggested Layer**: E2E

### TC-410: Bookings for an event whose totalSeats equals 1
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Dynamic event with `totalSeats = 1`.
**Steps**:
1. Book the single seat.
2. Try to book it again as the same user.
**Expected Results**:
- First booking succeeds.
- Second booking rejected (per-user availability = 0).
**Business Rule**: Rule 6.
**Suggested Layer**: E2E

### TC-4011: Booking page empty state
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Logged-in user with zero bookings.
**Steps**:
1. Log in as a fresh user.
2. Navigate to `/bookings`.
**Expected Results**:
- Empty-state UI shown (e.g., "No bookings yet").
- "Clear All Bookings" link is hidden or disabled.
**Suggested Layer**: E2E

### TC-412: Concurrent booking attempts
**Category**: Edge Case
**Priority**: P2
**Preconditions**: Event with limited seats.
**Steps**:
1. Fire two `POST /api/bookings` requests in parallel for the same event with quantities that together exceed remaining seats.
**Expected Results**:
- One succeeds, the other is rejected with "Insufficient seats available" (no oversell).
- Final `availableSeats` is consistent.
**Business Rule**: Rule 6.
**Suggested Layer**: API

---

## UI State

### TC-501: Bookings list shows loading state
**Category**: UI State
**Priority**: P2
**Preconditions**: Slow network.
**Steps**:
1. Throttle network in DevTools.
2. Navigate to `/bookings`.
**Expected Results**:
- Loading indicator is shown while data is fetched.
- No layout shift / no flash of unstyled content.
- Loaded state replaces the indicator when the request completes.
**Suggested Layer**: E2E

### TC-502: Booking detail page refund spinner appears for 4 seconds
**Category**: UI State
**Priority**: P2
**Preconditions**: User has a booking.
**Steps**:
1. Open `/bookings/:id`.
2. Click `#check-refund-btn`.
**Expected Results**:
- `#refund-spinner` becomes visible.
- Spinner remains for ~4 seconds (Playwright auto-wait / `expect(spinner).toBeVisible()` then toBeHidden).
- `#refund-result` appears after the spinner disappears.
**Business Rule**: Rule 8 — 4-second spinner.
**Suggested Layer**: E2E

### TC-503: Quantity controls — decrement at min
**Category**: UI State
**Priority**: P2
**Preconditions**: Booking form open with default quantity 1.
**Steps**:
1. Observe `−` button at quantity = 1.
2. Click `−` repeatedly.
**Expected Results**:
- `−` button is disabled or has no effect at quantity 1.
- `#ticket-count` remains 1.
- `+` button is enabled up to 10.
**Business Rule**: quantity 1–10.
**Suggested Layer**: E2E

### TC-504: Quantity controls — increment at max
**Category**: UI State
**Priority**: P2
**Preconditions**: Booking form open.
**Steps**:
1. Click `+` to reach 10.
2. Click `+` again.
**Expected Results**:
- `+` button becomes disabled at quantity 10.
- `#ticket-count` remains 10.
- `−` button is enabled.
**Business Rule**: quantity 1–10.
**Suggested Layer**: E2E

### TC-505: Confirmation card displayed after successful booking
**Category**: UI State
**Priority**: P1
**Preconditions**: Logged-in user; event with seats.
**Steps**:
1. Submit a valid booking form.
**Expected Results**:
- Confirmation card replaces the form.
- Booking reference is shown (`.booking-ref`).
- "View My Bookings" and "Browse Events" links are present.
**Suggested Layer**: E2E

### TC-506: Bookings list sandbox banner visibility
**Category**: UI State
**Priority**: P2
**Preconditions**: Logged-in user.
**Steps**:
1. With < 5 bookings: visit `/bookings`; confirm no banner.
2. With >= 5 bookings: visit `/bookings`; confirm banner is visible with text matching sandbox limits.
**Expected Results**:
- Banner hidden when count is low.
- Banner visible when count is high.
**Business Rule**: Rule 5.
**Suggested Layer**: E2E

### TC-507: Bookings list empty state
**Category**: UI State
**Priority**: P2
**Preconditions**: Fresh user, 0 bookings.
**Steps**:
1. Log in as a new user.
2. Navigate to `/bookings`.
**Expected Results**:
- Empty-state component visible.
- "Clear All Bookings" link is hidden (or disabled).
- No errors in console.
**Suggested Layer**: E2E

### TC-508: Booking detail page for a deleted booking
**Category**: UI State
**Priority**: P2
**Preconditions**: Booking id that has been deleted.
**Steps**:
1. Capture a booking id, then delete it.
2. Navigate to `/bookings/:id` (or refresh the page if mid-flow).
**Expected Results**:
- Page renders a "not found" / empty state, NOT stale data.
- No 5xx UI error.
**Suggested Layer**: E2E

### TC-509: Booking form server-side error displayed
**Category**: UI State
**Priority**: P2
**Preconditions**: Logged-in user.
**Steps**:
1. Stub the booking POST to return HTTP 500 (or force a 4xx error e.g., seat exhaustion).
2. Submit the booking form.
**Expected Results**:
- User-visible error message is shown.
- Form remains in a submittable state (data preserved).
- No silent failure.
**Suggested Layer**: E2E

### TC-510: Bookings list visible during navigation
**Category**: UI State
**Priority**: P3
**Preconditions**: Logged-in user with bookings.
**Steps**:
1. Navigate from `/bookings` to a booking detail and back.
**Expected Results**:
- Returning to `/bookings` shows the list without requiring a manual refresh.
- List reflects the latest state (e.g., if a cancel happened on the detail page).
**Suggested Layer**: E2E
