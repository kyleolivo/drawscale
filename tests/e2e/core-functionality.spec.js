import { test, expect } from '@playwright/test';

// Helper to set up authenticated state with database mocking
const setupAuth = async (page) => {
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

test.describe('Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await page.goto('/');
    
    // Wait for the app to load and show the authenticated state
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    
    // Wait for the problem drawer to be visible
    await expect(page.locator('.problem-drawer')).toBeVisible({ timeout: 15000 });
    
    // Wait for Excalidraw wrapper with increased timeout
    await page.waitForSelector('.excalidraw-wrapper', { timeout: 20000 });
    
    // Give Excalidraw time to initialize
    await page.waitForTimeout(1000);
  });

  test('loads Excalidraw canvas correctly', async ({ page }) => {
    await expect(page.locator('.excalidraw-wrapper')).toBeVisible();
    
    // Wait for canvas elements to be created
    await page.waitForTimeout(500);
    const canvasElements = page.locator('canvas');
    await expect(canvasElements.first()).toBeVisible();
  });

  test('problem drawer functionality', async ({ page }) => {
    // Should show problem picker
    await expect(page.locator('.problem-drawer')).toBeVisible();
    
    const cardTitle = page.locator('.problem-card-title');
    await expect(cardTitle.first()).toBeVisible();
    
    // Select a problem
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(500);
    
    // Should show problem presentation view
    await expect(page.locator('.problem-title')).toBeVisible();
    await expect(page.locator('.problem-description')).toBeVisible();
    await expect(page.locator('.difficulty-badge')).toBeVisible();
    
    // Test drawer toggle
    const drawerToggle = page.locator('.drawer-toggle');
    await expect(drawerToggle).toBeVisible();
    
    await drawerToggle.click();
    await expect(page.locator('.problem-drawer.closed')).toBeVisible();
    
    await drawerToggle.click();
    await expect(page.locator('.problem-drawer.open')).toBeVisible();
  });

  test('record button is visible and accessible', async ({ page }) => {
    // First select a problem to enable the record button
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(500);
    
    const recordButton = page.getByRole('button', { name: /start recording/i });
    await expect(recordButton).toBeVisible();
    
    // Check positioning
    const buttonBox = await recordButton.boundingBox();
    const viewportSize = page.viewportSize();
    expect(buttonBox.x).toBeGreaterThan(viewportSize.width / 2);
    expect(buttonBox.y).toBeGreaterThan(viewportSize.height / 2);
    
    // Check accessibility
    await expect(recordButton).toHaveAttribute('aria-label', /start recording/i);
    await recordButton.focus();
    await expect(recordButton).toBeFocused();
    
    // Should have microphone icon
    const svgIcon = recordButton.locator('svg');
    await expect(svgIcon).toBeVisible();
    await expect(svgIcon.locator('path')).toHaveCount(2);
  });

  test('no console errors during normal usage', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Interact with the app
    const drawerToggle = page.locator('.drawer-toggle');
    await drawerToggle.click();
    await drawerToggle.click();
    
    await page.waitForTimeout(500);
    
    // Filter out known warnings
    const actualErrors = consoleErrors.filter(error => 
      !error.includes('Warning') && 
      !error.includes('DevTools') &&
      !error.includes('Extension')
    );
    
    expect(actualErrors).toHaveLength(0);
  });
});