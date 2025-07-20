import { test, expect } from '@playwright/test';

const mockAuthentication = async (page) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('drawscale_user', JSON.stringify({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User'
    }));
  });
};

const viewports = [
  { name: 'desktop', width: 1200, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 }
];

test.describe('Responsive Design', () => {
  viewports.forEach(({ name, width, height }) => {
    test(`works correctly on ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      
      // Test unauthenticated state
      await page.goto('/');
      await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
      await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
      
      // Test authenticated state
      await mockAuthentication(page);
      await page.reload();
      
      // Check user avatar is visible
      await expect(page.locator('.user-avatar')).toBeVisible();
      await expect(page.locator('.user-avatar')).toHaveText('TU');
      await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
      await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
      
      // Record button should be visible on all sizes
      const recordButton = page.locator('.record-button');
      await expect(recordButton).toBeVisible();
      
      // Problem drawer should be visible
      await expect(page.locator('.problem-drawer')).toBeVisible();
      
      // Drawer toggle should be visible
      const drawerToggle = page.locator('.drawer-toggle');
      await expect(drawerToggle).toBeVisible();
      
      // Verify record button is within viewport
      const buttonBox = await recordButton.boundingBox();
      expect(buttonBox.x + buttonBox.width).toBeLessThan(width);
      expect(buttonBox.y + buttonBox.height).toBeLessThan(height);
    });
  });

  test('drawer adapts to mobile viewport', async ({ page }) => {
    await mockAuthentication(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForSelector('.problem-drawer', { timeout: 10000 });
    
    // Select a problem to see presentation view
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(150);
    
    // Content should be visible
    await expect(page.locator('.problem-title')).toBeVisible();
    await expect(page.locator('.problem-description')).toBeVisible();
    await expect(page.locator('.difficulty-badge')).toBeVisible();
    
    // Excalidraw should still be visible
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });
});