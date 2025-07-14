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
    
    // Should see main app header
    await expect(page.getByRole('heading', { name: 'DrawScale' })).toBeVisible();
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
    
    // Should see Excalidraw
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('can sign out from the app', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Click sign out
    await page.getByRole('button', { name: /sign out/i }).click();
    
    // Should be back at login page
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    // In development mode, should see dev button
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
  });

  test('displays the application header correctly when authenticated', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Check header structure and styling
    const header = page.locator('.App-header');
    await expect(header).toBeVisible();
    
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
    
    // Verify header and drawing area are both present
    await expect(page.locator('.App-header')).toBeVisible();
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

  test('responsive drawer layout works correctly on mobile', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Test desktop layout first (horizontal)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    
    // Check that drawer toggle is visible on desktop
    const drawerToggle = page.locator('.drawer-toggle');
    await expect(drawerToggle).toBeVisible();
    
    // Test mobile layout (vertical)
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByText('Welcome, Test User')).toBeVisible();
    
    // Wait for layout to adjust
    await page.waitForTimeout(150);
    
    // Check that drawer content is visible on mobile - use specific selectors
    await expect(page.locator('.problem-drawer .problem-title')).toBeVisible();
    await expect(page.locator('.problem-drawer .problem-description')).toBeVisible();
    await expect(page.locator('.problem-drawer .difficulty-badge')).toBeVisible();
    
    // Check that drawer toggle is hidden on mobile
    await expect(drawerToggle).not.toBeVisible();
    
    // Check that Excalidraw is still visible below the drawer
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    // Verify the layout structure - drawer should be above canvas
    const canvasContainer = page.locator('.canvas-container');
    await expect(canvasContainer).toBeVisible();
    
    // Check that problem drawer is present and has correct mobile styling
    const problemDrawer = page.locator('.problem-drawer');
    await expect(problemDrawer).toBeVisible();
    
    // Verify the drawer is full width on mobile (no border-right, has border-bottom)
    const drawerStyle = await problemDrawer.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        width: styles.width,
        borderRight: styles.borderRight,
        borderBottom: styles.borderBottom
      };
    });
    
    // Should be full width and have bottom border instead of right border
    expect(drawerStyle.width).toBe('375px'); // full width on mobile
    expect(drawerStyle.borderRight === 'none' || drawerStyle.borderRight.includes('none') || drawerStyle.borderRight.startsWith('0px')).toBe(true);
    expect(drawerStyle.borderBottom).not.toBe('none');
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