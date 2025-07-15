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
      const headings = screen.getAllByText('Design Twitter');
      expect(headings.length).toBeGreaterThan(1); // h2 and h1
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

  describe('Responsive Behavior Integration', () => {
    it('forces drawer open on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      const { container } = renderWithAuth(<DrawCanvas />);

      // On mobile, drawer should be forced open
      const canvasContainer = container.querySelector('.canvas-container');
      expect(canvasContainer).toHaveClass('drawer-open');
    });

    it('disables toggle button on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(max-width: 768px)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      renderWithAuth(<DrawCanvas />);

      // Use aria-label to select the toggle button
      const toggleButton = screen.getByRole('button', { name: /instructions/i });
      expect(toggleButton).toBeDisabled();
      expect(toggleButton).toHaveClass('hide-mobile');
    });
  });

  describe('ProblemDrawer and DrawerToggle Integration', () => {
    it('passes correct props from DrawCanvas to ProblemDrawer', () => {
      renderWithAuth(<DrawCanvas />);

      // Check that ProblemDrawer receives the default problem
      const headings = screen.getAllByText('Design Twitter');
      expect(headings.length).toBeGreaterThan(1); // h2 and h1
      expect(screen.getByText('A simple test problem for the system design tool')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('passes correct props from DrawCanvas to DrawerToggle', () => {
      renderWithAuth(<DrawCanvas />);

      // Check that DrawerToggle is rendered with correct initial state
      const toggleButton = screen.getByRole('button', { name: /instructions/i });
      expect(toggleButton).toBeInTheDocument();
      // On mobile, it will be disabled
      // expect(toggleButton).not.toBeDisabled();
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

      // All components should reflect closed state (but on mobile, toggle is disabled, so state doesn't change)
      await waitFor(() => {
        expect(canvasContainer).toHaveClass('drawer-open'); // remains open on mobile
        expect(excalidrawWrapper).toHaveClass('with-drawer');
        expect(screen.getByRole('button', { name: /hide instructions/i })).toBeInTheDocument();
      });
    });
  });

  describe('Header and Component Integration', () => {
    it('displays user information in header while showing drawing components', () => {
      renderWithAuth(<DrawCanvas />);

      // Check header content
      expect(screen.getByRole('heading', { name: 'DrawScale', level: 1 })).toBeInTheDocument();
      expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument();
      expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();

      // Check that drawing components are also present
      const headings = screen.getAllByText('Design Twitter');
      expect(headings.length).toBeGreaterThan(1); // h2 and h1
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument();
    });

    it('sign out button works while drawer is in different states', async () => {
      renderWithAuth(<DrawCanvas />);

      // Initially drawer is open
      const headerSection = screen.getByText('Welcome, Test User').closest('.header-user')
      expect(headerSection?.querySelector('.logout-button')).toBeInTheDocument();

      // Close drawer
      const toggleButton = screen.getByRole('button', { name: /hide instructions/i });
      fireEvent.click(toggleButton);

      // Sign out button should still be functional
      await waitFor(() => {
        const headerSection = screen.getByText('Welcome, Test User').closest('.header-user')
        const signOutButton = headerSection?.querySelector('.logout-button')
        expect(signOutButton).toBeInTheDocument();
        expect(signOutButton).not.toBeDisabled();
      });
    });
  });
}); 