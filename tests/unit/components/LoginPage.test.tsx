import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../../../src/components/LoginPage'

describe('LoginPage Component', () => {
  const mockOnSignIn = vi.fn()
  const originalEnv = import.meta.env

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Restore original env
    Object.defineProperty(import.meta, 'env', {
      value: originalEnv,
      configurable: true
    })
  })

  it('renders the login page with correct content', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DrawScale')
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
  })

  it('renders correct button based on environment', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    // In test environment (development), should show dev button
    if (import.meta.env.DEV) {
      expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /sign in with apple/i })).not.toBeInTheDocument()
    } else {
      expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument()
      expect(screen.queryByText('Dev Sign In (Local Only)')).not.toBeInTheDocument()
    }
  })

  it('shows correct button based on environment (currently dev in tests)', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    // Since tests run in development mode, should show dev button
    expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sign in with apple/i })).not.toBeInTheDocument()
    
    // Should have only one button
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
  })

  it('calls onSignIn when dev button is clicked', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const devButton = screen.getByText('Dev Sign In (Local Only)')
    fireEvent.click(devButton)
    
    expect(mockOnSignIn).toHaveBeenCalledWith({
      authorization: { id_token: expect.stringMatching(/^dev-token-\d+$/) },
      user: {
        email: 'dev@example.com',
        name: { firstName: 'Dev', lastName: 'User' }
      }
    })
  })

  it('does not load Apple Sign-In SDK script in development mode', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const script = document.querySelector('script[src*="appleid.auth.js"]')
    expect(script).not.toBeInTheDocument()
  })
})