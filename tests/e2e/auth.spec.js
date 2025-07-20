import { test, expect } from '@playwright/test';

// Helper to mock authentication with database
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
    
    // Wait for the app to load and show the authenticated state
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    
    // User avatar with initials should be visible
    await expect(page.locator('.user-avatar')).toBeVisible();
    await expect(page.locator('.user-avatar')).toHaveText('DU'); // Dev User initials
    await expect(page.locator('.logout-button')).toBeVisible();
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 10000 });
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
  });

  test('can sign out', async ({ page }) => {
    await mockAuthentication(page);
    await page.goto('/');
    
    // Wait for the app to load
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    
    await page.locator('.logout-button').click();
    
    await expect(page.getByText('Sign in to access the drawing canvas')).toBeVisible();
    await expect(page.getByRole('button', { name: /dev sign in/i })).toBeVisible();
  });
});