# Playwright Automation Rules

## Project
- Language: TypeScript
- Framework: Playwright
- Test command: npx playwright test
- Follow the existing project structure.
- Reuse existing fixtures, page objects and utilities.
- Do not create duplicate utilities.

## Coding Rules
- Prefer existing functions before creating new ones.
- Keep changes minimal.
- Do not modify unrelated files.
- Use async/await.
- Use TypeScript types properly.
- Follow the existing coding style.

## Locator Rules
Use this priority:
1. getByRole()
2. getByLabel()
3. getByPlaceholder()
4. getByText()
5. data-testid
6. CSS selector
7. XPath only as a last resort.

Never use arbitrary waits such as:
await page.waitForTimeout(...)

Prefer Playwright auto-waiting and web-first assertions.

## Assertions
Use Playwright web-first assertions:

await expect(locator).toBeVisible();
await expect(locator).toHaveText(...);
await expect(page).toHaveURL(...);

Do not use unnecessary manual polling.

## Test Creation
Before creating a test:
1. Inspect existing tests.
2. Inspect fixtures.
3. Inspect page objects.
4. Reuse existing patterns.
5. Then implement the smallest required change.

## Debugging
When a test fails:
1. Read the failure.
2. Identify the root cause.
3. Inspect only relevant files.
4. Make the smallest fix.
5. Run the affected test again.
6. Do not modify unrelated tests.

## Important
Do not explain every intermediate thought.
Keep responses concise.
Do not repeat information already available in project files.