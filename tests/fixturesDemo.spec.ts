import { expect } from '@playwright/test';
import { customTest } from '../fixtures/fixtures';

customTest('Fixtures Demo', async ({ createOrder, testDataOrder }) => {
    await expect(createOrder.locator(`tbody`)).toContainText(testDataOrder.productName as string);
});
