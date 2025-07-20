import { test, expect } from '@playwright/test';

const mockAuthentication = async (page) => {
  // Mock the database service and set up authentication before loading the app
  await page.addInitScript(() => {
    // Clear any existing localStorage first
    localStorage.clear();
    
    // Mock UserService methods
    window.UserService = {
      getUserByEmail: async (email) => {
        if (email === 'dev@example.com') {
          return {
            id: 'test-user-id',
            email: 'dev@example.com',
            first_name: 'Dev',
            last_name: 'User',
            provider: 'dev',
            apple_id_token: null,
            created_at: new Date().toISOString(),
            banhammer: false
          };
        }
        return null;
      },
              getUserByAppleIdToken: async (token) => null, // eslint-disable-line @typescript-eslint/no-unused-vars
      createUser: async (userData) => ({
        id: 'new-user-id',
        ...userData,
        created_at: new Date().toISOString(),
        banhammer: false
      }),
      updateUser: async (id, userData) => ({
        id,
        ...userData,
        created_at: new Date().toISOString(),
        banhammer: false
      })
    };
    
    // Mock the database module
    window.mockDatabase = {
      UserService: window.UserService
    };
    
    // Set up authentication data
    const authUser = {
      id: 'test-user-id',
      email: 'dev@example.com',
      name: 'Dev User'
    };
    
    const databaseUser = {
      id: 'test-user-id',
      email: 'dev@example.com',
      first_name: 'Dev',
      last_name: 'User',
      provider: 'dev',
      apple_id_token: null,
      created_at: new Date().toISOString(),
      banhammer: false
    };
    
    localStorage.setItem('drawscale_user', JSON.stringify(authUser));
    localStorage.setItem('drawscale_database_user', JSON.stringify(databaseUser));
  });
  
  // Wait a bit for the script to execute
  await page.waitForTimeout(100);
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
      
      // Wait for the app to load and show the authenticated state
      await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
      
      // Check user avatar is visible
      await expect(page.locator('.user-avatar')).toBeVisible();
      await expect(page.locator('.user-avatar')).toHaveText('DU'); // Dev User initials
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
    
    // Wait for the app to load and show the authenticated state
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('.problem-drawer', { timeout: 10000 });
    
    // Select a problem to see presentation view
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(500);
    
    // Content should be visible
    await expect(page.locator('.problem-title')).toBeVisible();
    await expect(page.locator('.problem-description')).toBeVisible();
    await expect(page.locator('.difficulty-badge')).toBeVisible();
    
    // Excalidraw should still be visible
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });
});