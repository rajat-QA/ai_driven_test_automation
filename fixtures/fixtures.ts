import { test, Page } from '@playwright/test'

interface testData {
    [key: string]: string | number | boolean;
}

export const customTest = test.extend<{ authenticatedPage: Page; createOrder: Page; testDataOrder: testData }>({

    authenticatedPage: async ({ page }, use) => {
        await page.goto('https://rahulshettyacademy.com/client');
        await page.getByPlaceholder('email@example.com').fill('rahulshettyw@gmail.com');
        await page.getByPlaceholder('enter your passsword').fill('Learning@830$3mK3');
        await page.getByRole('button', { name: 'Login' }).click();
        await page.waitForLoadState('networkidle');
        await use(page);
    },
    createOrder: async ({ authenticatedPage }, use) => {
        await authenticatedPage.click(`[routerlink='/dashboard/myorders']`);
        await authenticatedPage.locator(`tbody`).first().waitFor();
        await use(authenticatedPage);
    },
    testDataOrder: async ({ }, use) => {
        await use({ productName: 'ZARA COAT 3' });
    }

});