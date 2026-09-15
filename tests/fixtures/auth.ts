import { test as base, expect } from '@playwright/test';

const BASE_URL = 'https://eventhub.rahulshettyacademy.com';
const TEST_EMAIL = 'rajat.mahadik@nec.com';
const TEST_PASSWORD = 'Test@1212#1';

type AuthFixtures = {
  loginPage: typeof LoginPage;
  loggedInPage: typeof page;
};

class LoginPage {
  readonly page;

  constructor(page: any) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/login`);
  }

  get emailInput() {
    return this.page.getByPlaceholder('you@email.com');
  }

  get passwordInput() {
    return this.page.getByPlaceholder('••••••');
  }

  get loginButton() {
    return this.page.locator('#login-btn');
  }

  async login(email = TEST_EMAIL, password = TEST_PASSWORD) {
    await this.goto();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.page).toHaveURL(BASE_URL, { timeout: 10000 });
    await expect(this.page.getByRole('link', { name: 'Browse Events →' })).toBeVisible();
    return this.page;
  }
}

export const test = base.extend<{
  loginPage: LoginPage;
  loggedInPage: typeof base['fixtures']['page'];
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login();
    await use(page);
  },
});

export { expect, BASE_URL, TEST_EMAIL, TEST_PASSWORD };
