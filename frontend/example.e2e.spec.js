import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');
    // Add assertions based on your validation messages
  });
});

test.describe('Transaction Creation', () => {
  test.skip('should create a new transaction', async ({ page }) => {
    // This test requires authentication setup
    // Skip for now, implement after auth is configured
    await page.goto('/login');
    // Login steps...
    await page.goto('/create-deal');
    await page.fill('[name="transactionTitle"]', 'Test Transaction');
    await page.fill('[name="price"]', '1000');
    await page.click('button:has-text("Create")');
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu is visible
    const menuButton = page.locator('button[aria-label="Menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Verify navigation is accessible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should work on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page).toHaveTitle(/Escrow/);
  });
});

test.describe('Accessibility', () => {
  test('should have no console errors on home page', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    expect(errors).toHaveLength(0);
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Escrow/);
  });
});
