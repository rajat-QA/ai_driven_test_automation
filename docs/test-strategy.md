# EventHub — Booking Test Strategy

Scope: assign every scenario in `docs/test-scenarios.md` to the lowest adequate test layer.
Source app: `https://eventhub.rahulshettyacademy.com` (Next.js 14 + Express/Prisma; backend source is not in this repo, so layer decisions rely on `eventhub-domain` knowledge + the API contract in `api-reference.md`).

## 1. Distribution

| Layer | Count | Focus | Est. time (sec/test) |
|---|---|---|---|
| Unit | 0 | (no pure-function logic to isolate in this repo) | — |
| API | 24 | Contract, validation, auth, FIFO/seat math, isolation | ~3 |
| Component | 0 | (no isolated React unit harness exists) | — |
| E2E | 22 | User journeys, UI state, cross-screen flows | ~25 |
| **API + E2E (defence-in-depth)** | 5 | Negative flows where UI affordance AND API status must both hold | ~15 each side |
| **Total** | **51** | | |

Pyramid shape: 0 / 24 / 0 / 22 + 5 dual-layer. Push every test as low as it still proves the behavior. No Component layer because the project has no component harness; no Unit layer because no booking pure-function code is reachable from this repo.

### Why the gaps

- **Unit = 0**: Backend services (`backend/src/services/`, `backend/src/validators/`) are not in this repo. The two validations that are pure-function-shaped — `totalPrice = price × qty` and `bookingRef = [FIRST_LETTER]-[6_RANDOM]` — live inside Prisma transaction logic; pushing them down would require new unit infra. At the API layer `request.post('/api/bookings')` and `expect(resp.data.data.totalPrice).toBe(...)` runs them in <100 ms each, which is the practical equivalent. If `backend/` is added later, these collapse to true Unit tests.
- **Component = 0**: Next.js components (`frontend/app/bookings/[id]/page.tsx` and friends) are not in this repo. UI State tests (TC-5xx) stay at E2E because the only way to reach a React component today is through the running app.

## 2. Layer Assignments

API column = Playwright `request` fixture against the public staging API at `https://eventhub.rahulshettyacademy.com/api/*`. E2E column = Playwright `page` browser. Dual entries = scenario is split into two specs (one API, one E2E) because each layer proves a distinct property.

### Happy Path

| ID | Layer | File target | Endpoint / function | Why |
|---|---|---|---|---|
| TC-001 | E2E | `tests/e2e/bookings/TC-001-view-bookings-list.spec.ts` | `GET /api/bookings` via page | Multi-step login → nav → list render; UI list is the contract |
| TC-002 | E2E | `tests/e2e/bookings/TC-002-view-booking-detail.spec.ts` | `GET /api/bookings/:id` via page | Detail-page render is the user-facing contract |
| TC-003 | E2E | `tests/e2e/bookings/TC-003-create-booking.spec.ts` | `POST /api/bookings` via page | Multi-step form with quantity, name, email, phone |
| TC-004 | E2E | `tests/e2e/bookings/TC-004-cancel-booking.spec.ts` | `DELETE /api/bookings/:id` via page | Confirms redirect + list refresh; `tests/tc-003-cancel-booking.spec.ts` already covers this — extend, don't duplicate |
| TC-005 | E2E | `tests/e2e/bookings/TC-005-clear-all-bookings.spec.ts` | `DELETE /api/bookings` via page | Bulk action with empty-state assertion |
| TC-006 | E2E | `tests/e2e/bookings/TC-006-ref-format.spec.ts` | `POST /api/bookings` + `GET /api/bookings/:id` via page | Reference format must be visible in the confirmation card |
| TC-007 | E2E | `tests/e2e/bookings/TC-007-pagination.spec.ts` | `GET /api/bookings?page=` via page | Pagination controls live in the page chrome |
| TC-008 | API | `tests/api/bookings/TC-008-lookup-by-ref.spec.ts` | `GET /api/bookings/ref/:ref` | Pure API lookup; no UI surface in the app for ref-based search |

### Business Rules

| ID | Layer | File target | Endpoint / function | Why |
|---|---|---|---|---|
| TC-101 | API | `tests/api/bookings/TC-101-total-price.spec.ts` | `POST /api/bookings` | Pure math: read `event.price` from `GET /api/events/:id`, assert `totalPrice = price × qty` |
| TC-102 | E2E | `tests/e2e/bookings/TC-102-ref-first-letter.spec.ts` | `POST /api/bookings` via page | First-letter rule needs to be visible on the confirmation card per the business rule wording |
| TC-103 | API | `tests/api/bookings/TC-103-status-confirmed.spec.ts` | `POST /api/bookings` then `GET /api/bookings/:id` | Literal string assertion on a field; no UI involved |
| TC-104 | E2E | `tests/e2e/bookings/TC-104-seat-decrement.spec.ts` | `GET /api/events/:id` + `POST /api/bookings` via page | Seat count must visibly change on the event detail page |
| TC-105 | E2E | `tests/e2e/bookings/TC-105-cancel-frees-seats.spec.ts` | `DELETE /api/bookings/:id` + `GET /api/events/:id` via page | Same reasoning as TC-104 — visible seat restore |
| TC-106 | API | `tests/api/bookings/TC-106-fifo-9.spec.ts` | `POST /api/bookings` × 10 | FIFO is server logic; verify by listing bookings after 10th create |
| TC-107 | E2E | `tests/e2e/bookings/TC-107-refund-single.spec.ts` | client-only refund check on `/bookings/:id` | Refund logic is **client-only** per Rule 8 — only reachable through UI |
| TC-108 | E2E | `tests/e2e/bookings/TC-108-refund-group.spec.ts` | client-only refund check on `/bookings/:id` | Same: client-only |
| TC-109 | E2E | `tests/e2e/bookings/TC-109-sandbox-banner.spec.ts` | banner on `/bookings` | Banner is a UI element |
| TC-110 | E2E | `tests/e2e/bookings/TC-110-per-user-availability.spec.ts` | event detail page | Per-user availability is computed and rendered in the page |

### Security

| ID | Layer | File target | Endpoint / function | Why |
|---|---|---|---|---|
| TC-201 | **API + E2E** | `tests/api/bookings/TC-201a-cross-user-get.spec.ts` + `tests/e2e/bookings/TC-201b-cross-user-ui.spec.ts` | `GET /api/bookings/:id` + `/bookings/:id` page | Both layers prove different things: API must return 403, page must show Access Denied. Split into two specs. |
| TC-202 | API | `tests/api/bookings/TC-202-cross-user-cancel.spec.ts` | `DELETE /api/bookings/:id` | API status is the contract |
| TC-203 | API | `tests/api/bookings/TC-203-unauth-rejected.spec.ts` | `GET /api/bookings`, `POST /api/bookings`, `DELETE /api/bookings/:id` | Pure auth-header contract |
| TC-204 | E2E | `tests/e2e/bookings/TC-204-clear-all-scope.spec.ts` | `DELETE /api/bookings` via page | The "only affects me" claim needs the list UI of both users |
| TC-205 | API | `tests/api/bookings/TC-205-no-spoofing.spec.ts` | `POST /api/bookings` with `userId` / `bookingRef` in body | Server-side contract |
| TC-206 | API | `tests/api/bookings/TC-206-cascade-delete.spec.ts` | `DELETE /api/auth/me` (if exposed) or DB-level teardown | Cascade is a server invariant; needs an admin path. If no admin path exists, mark as **DB-layer** (out of scope here, note in `tc-206-skipped.md`) |
| TC-207 | API | `tests/api/bookings/TC-207-jwt-tamper.spec.ts` | `GET /api/bookings` with mutated token | Pure auth integrity |

### Negative / Error

| ID | Layer | File target | Endpoint / function | Why |
|---|---|---|---|---|
| TC-301 | API | `tests/api/bookings/TC-301-missing-fields.spec.ts` | `POST /api/bookings` | Validation contract per `api-reference.md` (400) |
| TC-302 | API | `tests/api/bookings/TC-302-bad-email.spec.ts` | `POST /api/bookings` | Field validation |
| TC-303 | **API + E2E** | `tests/api/bookings/TC-303a-short-phone-api.spec.ts` + `tests/e2e/bookings/TC-303b-short-phone-ui.spec.ts` | `POST /api/bookings` + UI form | API must return 400, UI must show inline error — distinct properties |
| TC-304 | API | `tests/api/bookings/TC-304-short-name.spec.ts` | `POST /api/bookings` | Field validation |
| TC-305 | **API + E2E** | `tests/api/bookings/TC-305a-qty-below-1.spec.ts` + `tests/e2e/bookings/TC-305b-qty-min-button.spec.ts` | `POST /api/bookings` + `−` button | API rejects 0 / -3; UI disables `−` at 1. Distinct properties. |
| TC-306 | **API + E2E** | `tests/api/bookings/TC-306a-qty-above-10.spec.ts` + `tests/e2e/bookings/TC-306b-qty-max-button.spec.ts` | `POST /api/bookings` + `+` button | API rejects 11; UI disables `+` at 10. Distinct properties. |
| TC-307 | **API + E2E** | `tests/api/bookings/TC-307a-insufficient-seats.spec.ts` + `tests/e2e/bookings/TC-307b-insufficient-seats-ui.spec.ts` | `POST /api/bookings` + form submit | API must say "Insufficient seats available"; UI must show inline error |
| TC-308 | API | `tests/api/bookings/TC-308-missing-event.spec.ts` | `POST /api/bookings` with bogus `eventId` | Pure contract check |
| TC-309 | API | `tests/api/bookings/TC-309-delete-missing.spec.ts` | `DELETE /api/bookings/99999999` | Pure contract check |
| TC-310 | API | `tests/api/bookings/TC-310-bad-token.spec.ts` | `GET /api/bookings` with `Bearer not-a-jwt` | Pure auth check |
| TC-311 | API | `tests/api/bookings/TC-311-idempotent-cancel.spec.ts` | `DELETE /api/bookings/:id` twice | Idempotency contract |
| TC-312 | **API + E2E** | `tests/api/bookings/TC-312a-no-token.spec.ts` + `tests/e2e/bookings/TC-312b-logged-out-ui.spec.ts` | `POST /api/bookings` + `/events/:id` form | API returns 401, UI redirects to `/login` |
| TC-313 | API | `tests/api/bookings/TC-313-past-date.spec.ts` | `POST /api/bookings` against a past event | Server must reject; the "event not returned by `GET /api/events`" half is implicit |

### Edge Cases

| ID | Layer | File target | Endpoint / function | Why |
|---|---|---|---|---|
| TC-401 | E2E | `tests/e2e/bookings/TC-401-qty-1.spec.ts` | full UI flow | Boundary + refund message both UI-side |
| TC-402 | E2E | `tests/e2e/bookings/TC-402-qty-10.spec.ts` | full UI flow | Same — boundary + group refund message |
| TC-403 | E2E | `tests/e2e/bookings/TC-403-last-seat.spec.ts` | event detail + create | Last-seat assertion is visible on the page |
| TC-404 | E2E | `tests/e2e/bookings/TC-404-different-customer-email.spec.ts` | full UI flow | Customer email is shown in the detail page |
| TC-405 | API | `tests/api/bookings/TC-405-ref-collision.spec.ts` | `POST /api/bookings` × N | Server-side uniqueness contract |
| TC-406 | E2E | `tests/e2e/bookings/TC-406-special-chars.spec.ts` | full UI flow | Rendering correctness is UI |
| TC-407 | API | `tests/api/bookings/TC-407-long-name.spec.ts` | `POST /api/bookings` | Server validation is the contract |
| TC-408 | API | `tests/api/bookings/TC-408-fifo-exact-9.spec.ts` | `POST /api/bookings` × 10 | Same logic as TC-106, just more precise wording — fold into TC-106 if you want to keep one spec per behavior |
| TC-409 | E2E | `tests/e2e/bookings/TC-409-cancel-last.spec.ts` | full UI flow | Empty-state UI behavior |
| TC-410 | E2E | `tests/e2e/bookings/TC-410-totalSeats-1.spec.ts` | event detail + create | Per-user seat count is rendered |
| TC-411 | E2E | `tests/e2e/bookings/TC-411-empty-state.spec.ts` | `/bookings` | Pure UI state |
| TC-412 | API | `tests/api/bookings/TC-412-concurrent.spec.ts` | parallel `POST /api/bookings` | Server-side concurrency; UI can't model true race |

### UI State

All UI state scenarios stay at E2E — they are page-chrome-only by definition.

| ID | Layer | File target | Notes |
|---|---|---|---|
| TC-501 | E2E | `tests/e2e/bookings/TC-501-loading-state.spec.ts` | Throttle via `page.route` |
| TC-502 | E2E | `tests/e2e/bookings/TC-502-spinner.spec.ts` | Use `expect(spinner).toBeVisible()` then `toBeHidden()` — no `waitForTimeout` |
| TC-503 | E2E | `tests/e2e/bookings/TC-503-qty-min-button.spec.ts` | `−` button state |
| TC-504 | E2E | `tests/e2e/bookings/TC-504-qty-max-button.spec.ts` | `+` button state |
| TC-505 | E2E | `tests/e2e/bookings/TC-505-confirmation-card.spec.ts` | Confirmation card DOM |
| TC-506 | E2E | `tests/e2e/bookings/TC-506-sandbox-banner.spec.ts` | Banner visibility |
| TC-507 | E2E | `tests/e2e/bookings/TC-507-empty-state.spec.ts` | Empty state (overlaps TC-411 — merge) |
| TC-508 | E2E | `tests/e2e/bookings/TC-508-deleted-detail.spec.ts` | "Not found" page |
| TC-509 | E2E | `tests/e2e/bookings/TC-509-server-error.spec.ts` | `page.route` to stub 500 |
| TC-510 | E2E | `tests/e2e/bookings/TC-510-list-staleness.spec.ts` | Navigate back/forward, assert fresh state |

## 3. Contested Assignments — Decision Rationale

### TC-101: totalPrice = price × qty — API, not Unit
Pure function on the surface. Push to Unit only if `backend/src/services/bookings.js#calculateTotal` is reachable. It is not. At the API layer: fetch event, POST booking, assert `resp.data.data.totalPrice === eventPrice * qty`. Same proof, ~100 ms. **Layer: API.**

### TC-102 / TC-006: booking reference format — E2E (TC-102) vs API (TC-006) split
The scenarios cover the same regex but wording differs. TC-006 is "format is correct" → API is enough. TC-102 is "first letter matches the event title" and is the headline Rule 7 — keep at E2E so a regression in the confirmation card is visible. Two scenarios → two layers.

### TC-103: status always "confirmed" — API, not E2E
The UI never shows the status field; it's only in the JSON. E2E would add zero coverage. **Layer: API.**

### TC-104 / TC-105: seat decrement / restore — E2E, not API
The contract is `availableSeats` rendered on the event detail page. Rule 6's per-user dynamic computation lives in the backend, but the *user-observable* contract is the rendered number. API assertions would only re-prove what Rule 4 already covers. **Layer: E2E.**

### TC-107 / TC-108: refund eligibility — E2E (cannot push down)
Business Rules file marks this as **client-only logic** with a 4-second spinner. There is no API to call. **Layer: E2E — forced.**

### TC-201: cross-user access — split into API + E2E
The 403 status and the "Access Denied" UI message are independent contracts. A passing API test does not prove the page renders correctly, and vice versa. Both layers → 2 specs.

### TC-204: Clear All only affects me — E2E, not API
The contract is "User B's session still shows their bookings" — that needs two browser sessions, not two `request` contexts. E2E with `page.context()` per user.

### TC-205: body spoofing — API, not E2E
You can curl with `userId: 'B'` and a forged `bookingRef` in 200 ms; doing the same via the UI requires DOM manipulation. The contract is the request/response — API is the layer. **Layer: API.**

### TC-206: cascade delete — API (with skip fallback)
If `DELETE /api/auth/me` or an admin endpoint exists, use it. If not, this is a DB-level invariant that cannot be tested without source access. In that case, write a skip-noted stub spec rather than a fake E2E.

### TC-303, TC-305, TC-306, TC-307, TC-312: dual-layer
Each names *two* distinct assertions: API status code AND UI affordance. Splitting into two specs keeps each test asserting exactly one thing. Don't collapse them.

### TC-412: concurrent booking — API, not E2E
Two parallel `POST`s is a server race. UI click timing cannot reliably reproduce the race window. Use `Promise.all([request.post(...), request.post(...)])`.

### TC-407: very long name — API, not E2E
The interesting property is server length handling. A 5000-char fill in the UI just re-tests what the API test already covers.

## 4. Anti-Patterns Found in Existing Tests

`tests/create-booking.spec.ts`, `tests/check-bookings.spec.ts`, `tests/tc-003-cancel-booking.spec.ts`, `tests/practice_test.spec.ts`:

1. **`page.waitForTimeout(...)` after every action** — `create-booking.spec.ts:33`, `tc-003-cancel-booking.spec.ts:53`, and `practice_test.spec.ts` style. `tests/create-booking.spec.ts:33` uses `waitForTimeout(2000)` to "wait for a confirmation dialog" — replace with `await expect(confirmBtn).toBeVisible()`. `tests/tc-003-cancel-booking.spec.ts:53` does `waitForTimeout(1000)` to "let the list refresh" — replace with `await expect(...).not.toBeVisible()`. The project CLAUDE.md forbids arbitrary waits.
2. **`page.waitForLoadState('networkidle')` after every navigation** — `tests/create-booking.spec.ts:12,16,32,39`, `tests/check-bookings.spec.ts:14`, `tests/tc-003-cancel-booking.spec.ts:14,20,26,42`. Web-first assertions are the preferred idiom. `networkidle` after a `getByRole('button', { name: 'Sign In' }).click()` is redundant because the next locator already auto-waits.
3. **Hardcoded credentials in every spec** — `create-booking.spec.ts:6-7`, `check-bookings.spec.ts:6-7`, `tc-003-cancel-booking.spec.ts:6-7`. Move to `fixtures/auth.ts` (a `customTest` fixture already exists at `fixtures/fixtures.ts` but only wraps a different app).
4. **Three-booking-id hardcoded assertion** — `tc-003-cancel-booking.spec.ts:57` checks `text=H-A3KHDN`, a ref that exists in one user's data only. Capture the ref during the test instead of hardcoding.
5. **Console-log debug instead of assertions** — `check-bookings.spec.ts:18-32` dumps every button, link, and 3 KB of body text. This is exploratory; production tests should assert.
6. **No API-layer tests at all** — every existing test is E2E. The pyramid is missing its base. Adding 24 API specs is the single highest-leverage improvement.
7. **`testDir: './tests'`** with `fullyParallel: false` and no `projects` work for the new structure but `playwright.config.ts` lacks `baseURL`, `use.storageState`, and a separate `testMatch` for API specs. Add `testMatch: /.*\.spec\.ts/` and split with `testDir: ['tests/api', 'tests/e2e']` if parallel-run isolation is needed.
8. **`page.goto('https://rahulshettyacademy.com/client')` in `fixtures/fixtures.ts:11`** — that fixture targets a different app (ShopperStack). Don't reuse it for EventHub; build a fresh `fixtures/auth.ts`.

## 5. Test Counts (final)

- API-only: 19
- E2E-only: 22
- Dual (API + E2E): 5 scenarios → 10 specs
- Specs total: **51**
- Anti-patterns flagged: 8

## 6. Hand-off to `/generate-tests`

Use the file targets in §2. Group by directory: `tests/api/bookings/` for the `request` fixture, `tests/e2e/bookings/` for the `page` fixture. Reuse the auth flow via a new `fixtures/auth.ts`; do not import `fixtures/fixtures.ts`. Follow the locator priority in `CLAUDE.md` and avoid every anti-pattern in §4.
