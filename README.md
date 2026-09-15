# Playwright bookings tests

Run the booking tests in Docker without installing Node.js, browsers, or npm dependencies locally:

```bash
docker compose run --build --rm playwright
```

The command runs the tests in `tests/e2e/bookings`. The HTML report is written to `playwright-report/` and test artifacts are written to `test-results/`.