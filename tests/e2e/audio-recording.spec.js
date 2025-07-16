import { test, expect } from '@playwright/test';

test.describe('Audio Recording E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and audio APIs before navigating
    await page.addInitScript(() => {
      // Mock authentication state
      window.localStorage.setItem('drawscale_user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User'
      }));
      
      // Mock getUserMedia
      navigator.mediaDevices.getUserMedia = async () => {
        return {
          getTracks: () => [{ stop: () => {} }]
        };
      };
      
      // Mock MediaRecorder with more complete implementation
      window.MediaRecorder = class {
        constructor() {
          this.state = 'inactive';
          this.ondataavailable = null;
          this.onstop = null;
        }
        
        start() {
          this.state = 'recording';
          // Simulate data becoming available
          setTimeout(() => {
            if (this.ondataavailable) {
              this.ondataavailable({ 
                data: new Blob(['test'], { type: 'audio/webm' }) 
              });
            }
          }, 100);
        }
        
        stop() {
          this.state = 'inactive';
          // Use setTimeout to make stop async like real MediaRecorder
          setTimeout(() => {
            if (this.onstop) {
              this.onstop();
            }
          }, 0);
        }
      };
    });
    
    // Navigate to the application
    await page.goto('/');
  });

  test('can start and stop audio recording with visual feedback', async ({ page }) => {
    // Wait for the record button to be visible
    const recordButton = page.locator('.record-button');
    await expect(recordButton).toBeVisible();
    
    // Initial state - not recording
    await expect(recordButton).not.toHaveClass(/recording/);
    await expect(recordButton).toHaveAttribute('aria-label', 'Start recording');
    
    // Start recording
    await recordButton.click();
    
    // Wait for async operations to complete
    await page.waitForTimeout(200);
    
    // Verify recording state
    await expect(recordButton).toHaveClass(/recording/);
    await expect(recordButton).toHaveAttribute('aria-label', 'Stop recording');
    
    // Verify duration display appears
    const durationDisplay = page.locator('.recording-duration');
    await expect(durationDisplay).toBeVisible();
    await expect(durationDisplay).toHaveText('0:00');
    
    // Wait a moment to see duration update
    await page.waitForTimeout(1500);
    await expect(durationDisplay).toHaveText('0:01');
    
    // Stop recording
    await recordButton.click();
    
    // Wait for async stop operations
    await page.waitForTimeout(200);
    
    // Verify recording stopped
    await expect(recordButton).not.toHaveClass(/recording/);
    await expect(recordButton).toHaveAttribute('aria-label', 'Start recording');
    await expect(durationDisplay).not.toBeVisible();
  });

  test('record button is positioned correctly and functional', async ({ page }) => {
    const recordButton = page.locator('.record-button');
    await expect(recordButton).toBeVisible();
    
    // Check basic styling and positioning
    const buttonBox = await recordButton.boundingBox();
    expect(buttonBox.width).toBe(64);
    expect(buttonBox.height).toBe(64);
    
    // Verify it's in the bottom-right area
    const viewport = page.viewportSize();
    expect(buttonBox.x).toBeGreaterThan(viewport.width - 200);
    expect(buttonBox.y).toBeGreaterThan(viewport.height - 200);
    
    // Test basic functionality
    await recordButton.click();
    await page.waitForTimeout(200);
    await expect(recordButton).toHaveClass(/recording/);
    
    await recordButton.click();
    await page.waitForTimeout(200);
    await expect(recordButton).not.toHaveClass(/recording/);
  });
});