const { test, expect } = require('@playwright/test');
const { apiClient, webInteractions } = require('@your-org/playwright-framework');

test.describe('Example Tests', () => {
  test('should navigate to the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Home/);
  });

  test('should use web interactions helper', async ({ page }) => {
    const interactions = new webInteractions(page);
    
    await page.goto('/');
    
    // Use the helper methods
    await interactions.waitForPageLoad();
    await interactions.takeScreenshot('homepage');
    
    // Verify page loaded correctly
    expect(await interactions.isElementVisible('h1')).toBeTruthy();
  });

  test('should use API client', async ({ request }) => {
    const api = new apiClient({ request });
    
    // Make API request
    const response = await api.get('/api/users');
    
    // Verify response
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();
  });
});