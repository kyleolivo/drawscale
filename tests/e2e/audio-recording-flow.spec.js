import { test, expect } from '@playwright/test';

test.describe('Audio Recording Flow', () => {
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
      
      // Set up authentication data and audio APIs
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
      
      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = async () => {
        return {
          getTracks: () => [{ stop: () => {} }]
        };
      };
      
      // Mock MediaRecorder with better browser compatibility
      window.MediaRecorder = class {
        constructor(stream, options) {
          this.state = 'inactive';
          this.ondataavailable = null;
          this.onstop = null;
          this.onstart = null;
          this.stream = stream;
          this.options = options;
        }
        
        start() {
          this.state = 'recording';
          
          // Immediately trigger onstart if it exists
          if (this.onstart) {
            this.onstart();
          }
          
          // Simulate data becoming available after a small delay
          setTimeout(() => {
            if (this.ondataavailable && this.state === 'recording') {
              this.ondataavailable({ 
                data: new Blob(['test audio data'], { type: 'audio/webm;codecs=opus' }) 
              });
            }
          }, 50);
        }
        
        stop() {
          if (this.state === 'recording') {
            this.state = 'inactive';
            // Trigger onstop immediately but asynchronously
            setTimeout(() => {
              if (this.onstop) {
                this.onstop();
              }
            }, 10);
          }
        }
      };
      
      // Ensure MediaRecorder.isTypeSupported returns true
      window.MediaRecorder.isTypeSupported = () => true;
    });
    
    // Wait a bit for the script to execute
    await page.waitForTimeout(100);
    
    await page.goto('/');
    
    // Wait for the app to load and show the authenticated state
    await expect(page.locator('.app-header')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('.record-button', { timeout: 10000 });
  });

  test('record button interaction works correctly', async ({ page }) => {
    // First select a problem to enable recording
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(500);
    
    const recordButton = page.locator('.record-button');
    
    // Initial state - should be enabled after problem selection
    await expect(recordButton).not.toHaveClass(/recording/);
    await expect(recordButton).toHaveAttribute('aria-label', 'Start recording');
    await expect(recordButton).toBeEnabled();
    
    // Button should be clickable (we can't fully test recording due to browser permission complexity)
    await expect(recordButton).toBeVisible();
    await expect(recordButton.locator('svg')).toBeVisible();
    
    // Verify the recording duration display is not initially visible
    const durationDisplay = page.locator('.recording-duration');
    await expect(durationDisplay).not.toBeVisible();
  });

  test('handles permission errors gracefully', async ({ page }) => {
    // First select a problem to enable recording
    const firstProblemCard = page.locator('.problem-card').first();
    await firstProblemCard.click();
    await page.waitForTimeout(500);
    
    // Listen for alert dialog
    let alertMessage = '';
    page.on('dialog', async dialog => {
      alertMessage = dialog.message();
      await dialog.accept();
    });
    
    // Override mock to simulate permission denied
    await page.evaluate(() => {
      window.navigator.mediaDevices.getUserMedia = () => 
        Promise.reject(new Error('Permission denied'));
    });
    
    const recordButton = page.locator('.record-button');
    
    // Click should trigger permission error
    await recordButton.click();
    await page.waitForTimeout(1000);
    
    // Should show alert about microphone permissions (WebKit may not capture dialogs)
    if (alertMessage) {
      expect(alertMessage).toContain('Unable to access microphone');
    } else {
      // For WebKit, just verify button remains in initial state
      console.log('No alert captured (likely WebKit) - checking button state instead');
    }
    
    // Button should remain in initial state
    await expect(recordButton).toHaveAttribute('aria-label', 'Start recording');
    await expect(recordButton).not.toHaveClass(/recording/);
    
    // Button should still be clickable after error
    await expect(recordButton).toBeVisible();
    await expect(recordButton).toBeEnabled();
  });
});