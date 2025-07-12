import { test, expect } from '@playwright/test';

test.describe('DrawScale Application', () => {
  test('loads the application successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/DrawScale/);
    
    // Verify the header is visible
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('System Design Interview Prep Tool')).toBeVisible();
  });

  test('displays the application header correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check header structure and styling
    const header = page.locator('.App-header');
    await expect(header).toBeVisible();
    
    const title = page.getByRole('heading', { name: 'DrawScale' });
    await expect(title).toBeVisible();
    
    const subtitle = page.getByText('System Design Interview Prep Tool');
    await expect(subtitle).toBeVisible();
  });

  test('loads Excalidraw component', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Excalidraw to load
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    // Check that the Excalidraw wrapper is present
    const excalidrawWrapper = page.locator('.excalidraw-wrapper');
    await expect(excalidrawWrapper).toBeVisible();
  });

  test('has responsive layout structure', async ({ page }) => {
    await page.goto('/');
    
    // Check that the main app container has proper flex layout
    const appContainer = page.locator('.App');
    await expect(appContainer).toBeVisible();
    
    // Verify header and drawing area are both present
    await expect(page.locator('.App-header')).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('Excalidraw canvas elements are present', async ({ page }) => {
    await page.goto('/');
    
    // Wait for Excalidraw to fully load
    await page.waitForTimeout(3000);
    
    // Check for canvas elements that Excalidraw creates
    const canvasElements = page.locator('canvas');
    await expect(canvasElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('application works on different viewport sizes', async ({ page }) => {
    // Test desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    // Test tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    // Test mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('no console errors on page load', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(3000); // Wait for full load
    
    // Filter out known Excalidraw warnings that aren't actual errors
    const actualErrors = consoleErrors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('Extension')
    );
    
    expect(actualErrors).toHaveLength(0);
  });
});