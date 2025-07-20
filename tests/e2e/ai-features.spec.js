import { test, expect } from '@playwright/test';

test.describe('AI Features UI', () => {
  test.beforeEach(async ({ page }) => {
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
    
    await page.goto('/');
    
    // Wait for the app to load and show the authenticated state
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
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
    await page.waitForTimeout(500);
    
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
    await page.waitForTimeout(500);
    
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