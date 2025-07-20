import { test, expect } from '@playwright/test';

// Helper to mock authentication
const mockAuthentication = async (page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('drawscale_user', JSON.stringify({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
};

test.describe('Authentication', () => {
  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).not.toBeVisible();
  });

  test('shows main app when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    // User avatar with initials should be visible
    await expect(page.locator('.user-avatar')).toBeVisible();
    await expect(page.locator('.user-avatar')).toHaveText('TU'); // Test User initials
    await expect(page.locator('.logout-button')).toBeVisible();
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('can sign out', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    await page.locator('.logout-button').click();
    
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
  });
});