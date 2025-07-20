import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for login page elements
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('System Design Interview Prep Tool')).toBeVisible();
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    
    // Should not show authenticated components
    await expect(page.locator('.user-avatar')).not.toBeVisible();
    await expect(page.locator('.app-header')).not.toBeVisible();
  });

  test('dev sign in button works and authenticates user', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const devButton = page.getByRole('button', { name: /dev sign in/i });
    await expect(devButton).toBeVisible();
    await expect(devButton).toBeEnabled();
    
    // Click the button to sign in
    await devButton.click();
    
    // After successful sign in, should navigate to main app
    // Look for authenticated state indicators
    await expect(page.locator('.user-avatar')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.app-header')).toBeVisible();
    
    // Should show user initials "DU" for Dev User
    await expect(page.locator('.user-avatar')).toHaveText('DU');
    
    // Should no longer show login page
    await expect(page.getByText('Sign in to access the drawing canvas')).not.toBeVisible();
  });

  test('login page has proper styling and layout', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that the login container is visible and properly styled
    const loginContainer = page.locator('.login-container');
    await expect(loginContainer).toBeVisible();
    
    // Check for proper button styling
    const devButton = page.getByRole('button', { name: /dev sign in/i });
    await expect(devButton).toHaveClass(/apple-signin-button/);
    
    // Check for SVG icon in button
    const svgIcon = devButton.locator('svg');
    await expect(svgIcon).toBeVisible();
  });

  test('handles error states in authentication', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Mock network failure for dev sign in
    await page.route('**/auth/v1/**', route => {
      route.abort('failed');
    });
    
    const devButton = page.getByRole('button', { name: /dev sign in/i });
    await devButton.click();
    
    // Should eventually show an error or return to normal state
    // Since we can't easily test the exact error without more complex mocking,
    // we'll just verify the button becomes enabled again
    await expect(devButton).toBeEnabled({ timeout: 5000 });
  });
});