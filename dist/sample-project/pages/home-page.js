
export class HomePage {
  constructor(page) {
    this.page = page;
    this.heading = page.locator('h1');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
  
  async navigate() {
    await this.page.goto(process.env.BASE_URL || 'https://example.com');
  }
  
  async assertPageLoaded() {
    await this.heading.waitFor({ state: 'visible' });
  }
}
