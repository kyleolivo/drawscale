import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import DrawCanvas from '../../src/components/DrawCanvas';
import { AuthProvider } from '../../src/hooks/useAuth';

// Mock Excalidraw
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-component">Excalidraw Mock</div>)
}));

// Mock useAuth hook
const mockSignOut = vi.fn();
const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Test User'
};

vi.mock('../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    signOut: mockSignOut,
    isAuthenticated: true,
    isLoading: false,
    signIn: vi.fn()
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Component Interaction Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  describe('DrawCanvas and ProblemDrawer Integration', () => {
    it('renders both ProblemDrawer and Excalidraw components together', () => {
      renderWithAuth(<DrawCanvas />);

      // Check that both components are rendered
      const headings = screen.getAllByText('Bitly');
      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument();
    });

    it('applies correct CSS classes to canvas container based on drawer state', () => {
      const { container } = renderWithAuth(<DrawCanvas />);

      const canvasContainer = container.querySelector('.canvas-container');
      expect(canvasContainer).toHaveClass('drawer-open');
      expect(canvasContainer).not.toHaveClass('drawer-closed');
    });

    it('applies correct CSS classes to excalidraw wrapper based on drawer state', () => {
      const { container } = renderWithAuth(<DrawCanvas />);

      const excalidrawWrapper = container.querySelector('.excalidraw-wrapper');
      expect(excalidrawWrapper).toHaveClass('with-drawer');
    });
  });

  describe('Drawer Toggle Functionality', () => {
    it('toggles drawer state when toggle button is clicked', async () => {
      const { container } = renderWithAuth(<DrawCanvas />);

      // Initially drawer should be open
      let canvasContainer = container.querySelector('.canvas-container');
      expect(canvasContainer).toHaveClass('drawer-open');

      // Find and click the toggle button
      const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
      fireEvent.click(toggleButton);

      // Wait for state update
      await waitFor(() => {
        canvasContainer = container.querySelector('.canvas-container');
        expect(canvasContainer).toHaveClass('drawer-closed');
      });
    });

    it('updates toggle button aria-label when drawer state changes', async () => {
      renderWithAuth(<DrawCanvas />);

      // Initially should show "Hide instructions"
      expect(screen.getByRole('button', { name: /hide instructions/i })).toBeInTheDocument();

      // Click to close drawer
      const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
      fireEvent.click(toggleButton);

      // Should now show "Show instructions"
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /show instructions/i })).toBeInTheDocument();
      });
    });

    it('updates SVG arrow class when drawer state changes', async () => {
      const { container } = renderWithAuth(<DrawCanvas />);

      // Initially arrow should have 'open' class
      let svg = container.querySelector('.toggle-arrow.open');
      expect(svg).toBeInTheDocument();

      // Click to close drawer
      const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
      fireEvent.click(toggleButton);

      // Arrow should no longer have 'open' class
      await waitFor(() => {
        svg = container.querySelector('.toggle-arrow');
        expect(svg).not.toHaveClass('open');
      });
    });
  });


  describe('ProblemDrawer and DrawerToggle Integration', () => {
    it('passes correct props from DrawCanvas to ProblemDrawer', () => {
      renderWithAuth(<DrawCanvas />);

      // Check that ProblemDrawer receives the default problem
      const headings = screen.getAllByText('Bitly');
      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('URL shortening service that converts long URLs into short, shareable links.')).toBeInTheDocument();
      // Check for Medium difficulty badges - there should be multiple since both problems are Medium
      const mediumBadges = screen.getAllByText('Medium');
      expect(mediumBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('passes correct props from DrawCanvas to DrawerToggle', () => {
      renderWithAuth(<DrawCanvas />);

      // Check that DrawerToggle is rendered with correct initial state
      const toggleButton = screen.getByRole('button', { name: /instructions/i });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).not.toBeDisabled();
    });

    it('maintains state consistency between components', async () => {
      const { container } = renderWithAuth(<DrawCanvas />);

      // Initially all components should reflect open state
      const canvasContainer = container.querySelector('.canvas-container');
      const excalidrawWrapper = container.querySelector('.excalidraw-wrapper');
      const toggleButton = screen.getByRole('button', { name: /instructions/i });

      expect(canvasContainer).toHaveClass('drawer-open');
      expect(excalidrawWrapper).toHaveClass('with-drawer');
      expect(toggleButton).toHaveAttribute('aria-label', 'Hide instructions');

      // Toggle drawer
      fireEvent.click(toggleButton);

      // All components should reflect closed state
      await waitFor(() => {
        expect(canvasContainer).toHaveClass('drawer-closed');
        expect(excalidrawWrapper).not.toHaveClass('with-drawer');
        expect(screen.getByRole('button', { name: /show instructions/i })).toBeInTheDocument();
      });
    });
  });

  describe('Header and Component Integration', () => {
    it('displays user information in header while showing drawing components', () => {
      renderWithAuth(<DrawCanvas />);

      // Check header content
      expect(screen.getByRole('heading', { name: 'DrawScale', level: 1 })).toBeInTheDocument();
      // Check for user avatar with initials instead of welcome text
      expect(screen.getByText('TU')).toBeInTheDocument(); // Test User initials

      // Check that drawing components are also present
      const headings = screen.getAllByText('Bitly');
      expect(headings.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument();
    });

    it('sign out button works while drawer is in different states', async () => {
      renderWithAuth(<DrawCanvas />);

      // Initially drawer is open
      const userSection = screen.getByText('TU').closest('.user-section')
      expect(userSection?.querySelector('.logout-button')).toBeInTheDocument();

      // Close drawer
      const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
      fireEvent.click(toggleButton);

      // Sign out button should still be functional
      await waitFor(() => {
        const userSection = screen.getByText('TU').closest('.user-section')
        const signOutButton = userSection?.querySelector('.logout-button')
        expect(signOutButton).toBeInTheDocument();
        expect(signOutButton).not.toBeDisabled();
      });
    });
  });

  describe('Problem Navigation Flow', () => {
    it('shows back button in header when viewing a specific problem', () => {
      renderWithAuth(<DrawCanvas />);

      // Initially in problems directory - no back button should be visible
      expect(screen.queryByLabelText('Back to problems list')).not.toBeInTheDocument();

      // Click on a problem to view it
      const problemCards = screen.getAllByText('Bitly');
      fireEvent.click(problemCards[0]); // Click the first problem card

      // Now we should see the back button in the header
      expect(screen.getByLabelText('Back to problems list')).toBeInTheDocument();
    });

    it('navigates back to problems list when back button is clicked', async () => {
      renderWithAuth(<DrawCanvas />);

      // Click on a problem to view it
      const problemCards = screen.getAllByText('Bitly');
      fireEvent.click(problemCards[0]);

      // Verify we're viewing the problem (back button should be visible)
      expect(screen.getByLabelText('Back to problems list')).toBeInTheDocument();

      // Click the back button
      const backButton = screen.getByLabelText('Back to problems list');
      fireEvent.click(backButton);

      // Should return to problems directory - back button should disappear
      await waitFor(() => {
        expect(screen.queryByLabelText('Back to problems list')).not.toBeInTheDocument();
      });

      // Should show the problem picker again
      expect(screen.getByText('Choose a System Design Problem')).toBeInTheDocument();
    });

    it('maintains proper component state during navigation', async () => {
      const { container } = renderWithAuth(<DrawCanvas />);

      // Initially should show problem picker
      expect(screen.getByText('Choose a System Design Problem')).toBeInTheDocument();
      expect(container.querySelector('.problem-picker')).toBeInTheDocument();

      // Navigate to a problem
      const problemCards = screen.getAllByText('Bitly');
      fireEvent.click(problemCards[0]);

      // Should show problem renderer instead of picker
      await waitFor(() => {
        expect(container.querySelector('.problem-renderer')).toBeInTheDocument();
        expect(container.querySelector('.problem-picker')).not.toBeInTheDocument();
      });

      // Navigate back
      const backButton = screen.getByLabelText('Back to problems list');
      fireEvent.click(backButton);

      // Should show picker again, not renderer
      await waitFor(() => {
        expect(container.querySelector('.problem-picker')).toBeInTheDocument();
        expect(container.querySelector('.problem-renderer')).not.toBeInTheDocument();
      });
    });

    it('back button works correctly with drawer toggle state', async () => {
      renderWithAuth(<DrawCanvas />);

      // Navigate to a problem
      const problemCards = screen.getAllByText('Bitly');
      fireEvent.click(problemCards[0]);

      // Verify back button is present
      expect(screen.getByLabelText('Back to problems list')).toBeInTheDocument();

      // Close the drawer
      const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
      fireEvent.click(toggleButton);

      // Back button should still be functional even when drawer is closed
      await waitFor(() => {
        expect(screen.getByLabelText('Back to problems list')).toBeInTheDocument();
      });

      // Click back button
      const backButton = screen.getByLabelText('Back to problems list');
      fireEvent.click(backButton);

      // Should navigate back successfully
      await waitFor(() => {
        expect(screen.queryByLabelText('Back to problems list')).not.toBeInTheDocument();
      });
    });
  });
}); 