
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Sample Test Suite', () => {
  test('should navigate to homepage', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.assertPageLoaded();
  });
});
