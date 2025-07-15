import { test, expect } from '@playwright/test';

// Helper function to set up authenticated state
async function setupAuth(page) {
  await page.addInitScript(() => {
    localStorage.setItem('drawscale_user', JSON.stringify({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
}

test.describe('DrawScale Main Flows', () => {
  test('login flow works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should show login page when not authenticated
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    
    // Should not see main app
    await expect(page.locator('.excalidraw-wrapper')).not.toBeVisible();
  });

  test('main app loads correctly when authenticated', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    
    // Should see main app elements
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    
    // Should see canvas and record button
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.record-button')).toBeVisible();
  });

  test('record button is functional', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    
    // Wait for app to load
    await expect(page.locator('.record-button')).toBeVisible({ timeout: 10000 });
    
    const recordButton = page.locator('.record-button');
    
    // Should have correct initial state
    await expect(recordButton).toHaveAttribute('aria-label', 'Start recording');
    await expect(recordButton).toBeEnabled();
    
    // Should have microphone icon
    await expect(recordButton.locator('svg')).toBeVisible();
  });

  test('drawer functionality works', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    
    // Wait for app to load
    await expect(page.locator('.problem-drawer')).toBeVisible();
    
    // Should show problem picker content - target the specific title element
    const cardTitleLocator = page.locator('.problem-card-title');
    await expect(cardTitleLocator.first()).toBeVisible();
    
    // Simulate selecting the first problem to enter presentation view
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(150);
    
    // Now check for problem presentation view content
    await expect(page.locator('.problem-title')).toContainText('Design Bitly');
    
    // Drawer toggle should work on desktop
    const drawerToggle = page.locator('.drawer-toggle');
    if (await drawerToggle.isVisible()) {
      await drawerToggle.click();
      await expect(page.locator('.problem-drawer.closed')).toBeVisible();
      
      await drawerToggle.click();
      await expect(page.locator('.problem-drawer.open')).toBeVisible();
    }
  });

  test('sign out works correctly', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    
    // Wait for app to load and click sign out
    await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();
    await page.getByRole('button', { name: 'Sign Out' }).click();
    
    // Should return to login page
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).not.toBeVisible();
  });

  test('app works on smaller viewport', async ({ page }) => {
    await setupAuth(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Main elements should still be visible on smaller viewport
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.record-button')).toBeVisible();
    
    // Drawer should still be visible
    await expect(page.locator('.problem-drawer')).toBeVisible();
  });

  test('app loads without JavaScript errors', async ({ page }) => {
    const jsErrors = [];
    page.on('pageerror', error => jsErrors.push(error.message));
    
    await setupAuth(page);
    await page.goto('/');
    
    // Wait for app to fully load
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.record-button')).toBeVisible();
    
    // Should not have critical JavaScript errors
    const criticalErrors = jsErrors.filter(error =>
      error.includes('TypeError') || error.includes('ReferenceError')
    );
    expect(criticalErrors.length).toBe(0);
  });
});