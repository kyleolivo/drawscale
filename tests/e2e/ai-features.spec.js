import { test, expect } from '@playwright/test';

test.describe('AI Features UI', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.addInitScript(() => {
      window.localStorage.setItem('drawscale_user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User'
      }));
    });
    
    await page.goto('/');
    await page.waitForSelector('.problem-drawer', { timeout: 10000 });
  });

  test('record button is disabled without problem selection', async ({ page }) => {
    const recordButton = page.locator('.record-button');
    await expect(recordButton).toBeVisible();
    
    // Should be disabled initially
    await expect(recordButton).toHaveClass(/disabled/);
    await expect(recordButton).toHaveAttribute('aria-label', 'Select a problem to enable recording');
    await expect(recordButton).toHaveAttribute('title', 'Select a problem to enable recording');
    await expect(recordButton).toBeDisabled();
  });

  test('record button enables after problem selection', async ({ page }) => {
    // Select a problem
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(150);
    
    // Record button should now be enabled
    const recordButton = page.locator('.record-button');
    await expect(recordButton).not.toHaveClass(/disabled/);
    await expect(recordButton).toHaveAttribute('aria-label', 'Start recording');
    await expect(recordButton).not.toHaveAttribute('title', 'Select a problem to enable recording');
    await expect(recordButton).toBeEnabled();
    
    // Should have microphone icon
    const svgIcon = recordButton.locator('svg');
    await expect(svgIcon).toBeVisible();
    await expect(svgIcon.locator('path')).toHaveCount(2);
  });

  test('UI layout supports AI analysis display', async ({ page }) => {
    // Select a problem to see the layout
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(150);
    
    // Verify the drawer content area exists for analysis display
    const drawerContent = page.locator('.drawer-content');
    await expect(drawerContent).toBeVisible();
    
    // Problem presentation should be visible
    await expect(page.locator('.problem-title')).toBeVisible();
    await expect(page.locator('.problem-description')).toBeVisible();
    
    // Verify record button is properly positioned and functional
    const recordButton = page.locator('.record-button');
    await expect(recordButton).toBeVisible();
    await expect(recordButton).toBeEnabled();
  });
});