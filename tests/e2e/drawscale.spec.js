import { test, expect } from '@playwright/test';

test.describe('DrawScale Application', () => {
  // Helper function to mock localStorage for authenticated state
  const mockAuthentication = async (page) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('drawscale_user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com', 
        name: 'Test User'
      }));
    });
  };

  test('shows login page when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should see login page
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    // In development mode, should see dev button
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    
    // Should not see Excalidraw
    await expect(page.locator('.excalidraw-wrapper')).not.toBeVisible();
  });

  test('shows main app when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Should see main app header in drawer
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    // Look for the logout button specifically in the user info area
    await expect(page.locator('.user-info .logout-button')).toBeVisible();
    
    // Should see Excalidraw
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('can sign out from the app', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Click sign out - use the one in the user info area
    await page.locator('.user-info .logout-button').click();
    
    // Should be back at login page
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    // In development mode, should see dev button
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
  });

  test('displays the application header correctly when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Check header structure and styling in drawer
    const appHeader = page.locator('.app-header');
    await expect(appHeader).toBeVisible();
    
    const title = page.getByRole('heading', { name: 'DrawScale' });
    await expect(title).toBeVisible();
    
    const subtitle = page.getByText('System Design Interview Prep Tool');
    await expect(subtitle).toBeVisible();
  });

  test('loads Excalidraw component when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Wait for Excalidraw to load
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    // Check that the Excalidraw wrapper is present
    const excalidrawWrapper = page.locator('.excalidraw-wrapper');
    await expect(excalidrawWrapper).toBeVisible();
  });

  test('has responsive layout structure when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Check that the main app container has proper flex layout
    const appContainer = page.locator('.App');
    await expect(appContainer).toBeVisible();
    
    // Verify canvas container and drawing area are both present
    await expect(page.locator('.canvas-container')).toBeVisible();
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('Excalidraw canvas elements are present when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Wait for Excalidraw to fully load
    await page.waitForTimeout(150);
    
    // Check for canvas elements that Excalidraw creates
    const canvasElements = page.locator('canvas');
    await expect(canvasElements.first()).toBeVisible({ timeout: 10000 });
  });

  test('application works on different viewport sizes', async ({ page }) => {
    // Test login page on different sizes
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
    
    // Test authenticated app on different sizes
    await mockAuthentication(page);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    // Wait for Excalidraw to adjust to new viewport size
    await page.waitForTimeout(150);
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    // Wait for Excalidraw to adjust to new viewport size
    await page.waitForTimeout(150);
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('drawer layout works correctly on different viewport sizes', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    
    // Check that drawer toggle is visible
    const drawerToggle = page.locator('.drawer-toggle');
    await expect(drawerToggle).toBeVisible();
    
    // Test smaller viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    
    // Wait for layout to adjust
    await page.waitForTimeout(150);
    
    // Check that drawer content is visible - use specific selectors
    await expect(page.locator('.problem-drawer .problem-title')).toBeVisible();
    await expect(page.locator('.problem-drawer .problem-description')).toBeVisible();
    await expect(page.locator('.problem-drawer .difficulty-badge')).toBeVisible();
    
    // Drawer toggle should still be visible (no mobile-specific hiding)
    await expect(drawerToggle).toBeVisible();
    
    // Check that Excalidraw is still visible
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    // Verify the layout structure
    const canvasContainer = page.locator('.canvas-container');
    await expect(canvasContainer).toBeVisible();
    
    // Check that problem drawer is present
    const problemDrawer = page.locator('.problem-drawer');
    await expect(problemDrawer).toBeVisible();
  });

  test('RecordButton is visible and positioned correctly when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Wait for app to load
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    // Check that record button container is present
    const recordButtonContainer = page.locator('.record-button-container');
    await expect(recordButtonContainer).toBeVisible();
    
    // Check that record button is present with correct aria-label
    const recordButton = page.getByRole('button', { name: /start recording/i });
    await expect(recordButton).toBeVisible();
    
    // Verify button has correct CSS classes
    await expect(recordButton).toHaveClass(/record-button/);
    
    // Check positioning - should be fixed and positioned in bottom-right area
    const buttonBox = await recordButton.boundingBox();
    const viewportSize = page.viewportSize();
    
    // Button should be in the bottom-right quadrant
    expect(buttonBox.x).toBeGreaterThan(viewportSize.width / 2);
    expect(buttonBox.y).toBeGreaterThan(viewportSize.height / 2);
  });

  test('RecordButton is not visible when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    // Should see login page
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    
    // Record button should not be present
    const recordButton = page.locator('.record-button-container');
    await expect(recordButton).not.toBeVisible();
  });

  test('RecordButton has correct initial state and visual feedback', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    const recordButton = page.getByRole('button', { name: /start recording/i });
    await expect(recordButton).toBeVisible();
    
    // Should not have recording class initially
    await expect(recordButton).not.toHaveClass(/recording/);
    
    // Should have microphone SVG icon
    const svgIcon = recordButton.locator('svg');
    await expect(svgIcon).toBeVisible();
    
    // Check SVG has microphone paths
    const pathElements = svgIcon.locator('path');
    await expect(pathElements).toHaveCount(2); // Microphone icon has 2 paths
  });

  test('RecordButton handles clicks without errors', async ({ page }) => {
    await mockAuthentication(page);
    
    // Mock navigator.mediaDevices.getUserMedia to prevent permission dialogs
    await page.addInitScript(() => {
      // Mock getUserMedia to fail gracefully for E2E testing
      window.navigator.mediaDevices = {
        getUserMedia: () => Promise.reject(new Error('Media access denied in test environment'))
      };
    });
    
    await page.goto('/');
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    const recordButton = page.getByRole('button', { name: /start recording/i });
    await expect(recordButton).toBeVisible();
    
    // Click the button - should handle the error gracefully
    await recordButton.click();
    
    // Button should remain in initial state due to permission error
    await expect(recordButton).toHaveAttribute('aria-label', /start recording/i);
    await expect(recordButton).not.toHaveClass(/recording/);
    
    // Verify the button is still clickable after error
    await recordButton.click();
    await expect(recordButton).toBeVisible();
  });

  test('RecordButton works correctly on different viewport sizes', async ({ page }) => {
    await mockAuthentication(page);
    
    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    let recordButton = page.getByRole('button', { name: /start recording/i });
    await expect(recordButton).toBeVisible();
    
    // Test on tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(150);
    await expect(recordButton).toBeVisible();
    
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(150);
    await expect(recordButton).toBeVisible();
    
    // On all sizes, button should be positioned correctly
    const buttonBox = await recordButton.boundingBox();
    expect(buttonBox.x).toBeGreaterThan(0);
    expect(buttonBox.y).toBeGreaterThan(0);
    expect(buttonBox.x + buttonBox.width).toBeLessThan(375); // Within viewport width
    expect(buttonBox.y + buttonBox.height).toBeLessThan(667); // Within viewport height
  });

  test('RecordButton has proper accessibility attributes', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    
    const recordButton = page.getByRole('button', { name: /start recording/i });
    await expect(recordButton).toBeVisible();
    
    // Check accessibility attributes
    await expect(recordButton).toHaveAttribute('aria-label', /start recording/i);
    
    // Should be focusable
    await recordButton.focus();
    await expect(recordButton).toBeFocused();
    
    // Should be activatable with keyboard
    await recordButton.press('Space');
    // Note: In real E2E, this would trigger recording, but we're not testing
    // actual media recording in E2E due to permission complexity
  });

  test('no console errors on page load', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(150); // Wait for full load
    
    // Filter out known Excalidraw warnings that aren't actual errors
    const actualErrors = consoleErrors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('Extension')
    );
    
    expect(actualErrors).toHaveLength(0);
  });
});