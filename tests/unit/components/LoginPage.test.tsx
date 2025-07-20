import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '../../../src/components/LoginPage'

// Mock Supabase client
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}))

describe('LoginPage Component', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Mock console methods to avoid spam
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Get mocked supabase and reset mocks
    const { supabase } = await import('../../../src/lib/supabase')
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ error: null })
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({ 
      data: { user: null, session: null }, 
      error: null 
    })
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Basic Rendering', () => {
    it('renders the login page with correct content', () => {
      render(<LoginPage />)
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DrawScale')
      expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
      expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    })

    it('renders dev sign-in button in development mode', () => {
      // Tests run in development mode by default
      render(<LoginPage />)
      
      expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
      expect(screen.queryByText('Sign in with Apple')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign in with Google')).not.toBeInTheDocument()
    })

    it('renders OAuth buttons in production mode', () => {
      render(<LoginPage forceMode="production" />)
      
      expect(screen.getByText('Sign in with Apple')).toBeInTheDocument()
      expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
      expect(screen.getByText('or')).toBeInTheDocument()
      expect(screen.queryByText('Dev Sign In (Local Only)')).not.toBeInTheDocument()
    })
  })

  describe('OAuth Functionality', () => {

    it('calls supabase signInWithOAuth for Apple when Apple button is clicked', async () => {
      render(<LoginPage forceMode="production" />)
      
      const appleButton = screen.getByText('Sign in with Apple')
      fireEvent.click(appleButton)
      
      const { supabase } = await import('../../../src/lib/supabase')
      expect(vi.mocked(supabase.auth.signInWithOAuth)).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: window.location.origin
        }
      })
    })

    it('calls supabase signInWithOAuth for Google when Google button is clicked', async () => {
      render(<LoginPage forceMode="production" />)
      
      const googleButton = screen.getByText('Sign in with Google')
      fireEvent.click(googleButton)
      
      const { supabase } = await import('../../../src/lib/supabase')
      expect(vi.mocked(supabase.auth.signInWithOAuth)).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })
    })

    it('disables buttons and shows loading state during OAuth', async () => {
      const { supabase } = await import('../../../src/lib/supabase')
      // Mock a slow OAuth response to test loading state
      vi.mocked(supabase.auth.signInWithOAuth).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ error: null }), 50))
      )
      
      render(<LoginPage forceMode="production" />)
      
      const appleButton = screen.getByText('Sign in with Apple')
      fireEvent.click(appleButton)
      
      // Check buttons are disabled during loading - both buttons show "Signing In..."
      expect(screen.getAllByText('Signing In...')).toHaveLength(2)
      expect(appleButton).toBeDisabled()
      
      // Get the Google button by its class since its text has changed
      const googleButton = document.querySelector('.google-signin-button') as HTMLButtonElement
      expect(googleButton).toBeDisabled()
      
      // Wait for OAuth to complete
      await waitFor(() => {
        expect(screen.getByText('Sign in with Apple')).toBeInTheDocument()
        expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('displays error message when OAuth fails', async () => {
      const mockError = new Error('OAuth failed')
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ error: mockError })
      
      render(<LoginPage forceMode="production" />)
      
      const appleButton = screen.getByText('Sign in with Apple')
      fireEvent.click(appleButton)
      
      await waitFor(() => {
        expect(screen.getByText('OAuth failed')).toBeInTheDocument()
      })
      
      // Check that error can be dismissed
      const dismissButton = screen.getByText('X')
      fireEvent.click(dismissButton)
      
      expect(screen.queryByText('OAuth failed')).not.toBeInTheDocument()
    })
  })

  describe('Dev Sign-In Functionality', () => {
    beforeEach(() => {
      // Tests already run in dev mode by default, no need to mock
    })

    it('signs in with existing dev user successfully', async () => {
      const mockDevUser = {
        id: 'dev-user-123',
        email: 'dev@example.com'
      }
      
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: mockDevUser, session: { user: mockDevUser } },
        error: null
      })
      
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      fireEvent.click(devButton)
      
      await waitFor(() => {
        expect(vi.mocked(supabase.auth.signInWithPassword)).toHaveBeenCalledWith({
          email: 'dev@example.com',
          password: 'devpassword123'
        })
      })
      
      expect(console.log).toHaveBeenCalledWith('Dev sign in successful')
    })

    it('creates dev user if it does not exist, then signs in', async () => {
      const { supabase } = await import('../../../src/lib/supabase')
      // First call fails (user doesn't exist)
      vi.mocked(supabase.auth.signInWithPassword)
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: new Error('Invalid login credentials')
        })
        .mockResolvedValueOnce({
          data: { user: { id: 'new-dev-user' }, session: null },
          error: null
        })
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: { id: 'new-dev-user' }, session: null },
        error: null
      })
      
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      fireEvent.click(devButton)
      
      await waitFor(() => {
        expect(vi.mocked(supabase.auth.signUp)).toHaveBeenCalledWith({
          email: 'dev@example.com',
          password: 'devpassword123',
          options: {
            data: {
              first_name: 'Dev',
              last_name: 'User',
              full_name: 'Dev User'
            }
          }
        })
      })
      
      // Should attempt to sign in again after signup
      expect(vi.mocked(supabase.auth.signInWithPassword)).toHaveBeenCalledTimes(2)
    })

    it('displays error message when dev sign-in fails', async () => {
      const mockError = new Error('Dev sign in failed')
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: mockError
      })
      
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      fireEvent.click(devButton)
      
      await waitFor(() => {
        expect(screen.getByText('Dev sign in failed')).toBeInTheDocument()
      })
    })

    it('shows loading state during dev sign-in', async () => {
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve({
          data: { user: null, session: null },
          error: null
        }), 100))
      )
      
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      fireEvent.click(devButton)
      
      expect(screen.getByText('Signing In...')).toBeInTheDocument()
      expect(devButton).toBeDisabled()
      
      await waitFor(() => {
        expect(screen.queryByText('Signing In...')).not.toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('handles network errors gracefully', async () => {
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithOAuth).mockRejectedValue(new Error('Network error'))
      
      render(<LoginPage forceMode="production" />)
      
      const appleButton = screen.getByText('Sign in with Apple')
      fireEvent.click(appleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('handles unknown errors with generic message', async () => {
      // This test is for dev mode, so use the original dev environment
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: 'string error' // Non-Error object
      })
      
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: 'string error'
      })
      
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      fireEvent.click(devButton)
      
      await waitFor(() => {
        expect(screen.getByText('Dev sign in failed')).toBeInTheDocument()
      })
    })
  })

  describe('UI Styling and Accessibility', () => {
    it('has proper button styling classes for dev button', () => {
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      expect(devButton).toHaveClass('apple-signin-button')
    })

    it('includes proper SVG icons', () => {
      render(<LoginPage />)
      
      // Check that SVG element is present in dev button
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      const devSvg = devButton.querySelector('svg')
      expect(devSvg).toBeInTheDocument()
    })

    it('has proper error message styling', async () => {
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        error: new Error('Test error')
      })
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        error: new Error('Test error')
      })
      
      render(<LoginPage />)
      
      const devButton = screen.getByText('Dev Sign In (Local Only)')
      fireEvent.click(devButton)
      
      await waitFor(() => {
        const errorDiv = screen.getByText('Test error').closest('div')
        expect(errorDiv).toHaveClass('error-message')
      })
    })
  })
})