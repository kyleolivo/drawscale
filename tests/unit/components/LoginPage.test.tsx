import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../../../src/components/LoginPage'

describe('LoginPage Component', () => {
  const mockOnSignIn = vi.fn()
  const originalEnv = import.meta.env

  beforeEach(() => {
    vi.clearAllMocks()
    // Default to production mode
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, DEV: false },
      configurable: true
    })
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

  it('renders Apple Sign-In button', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const appleButton = screen.getByRole('button', { name: /sign in with apple/i })
    expect(appleButton).toBeInTheDocument()
    expect(appleButton).toHaveClass('apple-signin-button')
  })

  it('renders Apple Sign-In button always', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    // Always renders Apple Sign-In button regardless of environment
    expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument()
  })

  it('shows dev sign-in button in development mode', () => {
    // Mock development environment
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, DEV: true },
      configurable: true
    })
    
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    // Should have two buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
  })

  it('calls onSignIn when dev button is clicked in development', () => {
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, DEV: true },
      configurable: true
    })
    
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const devButton = screen.getByText('Dev Sign In (Local Only)')
    fireEvent.click(devButton)
    
    expect(mockOnSignIn).toHaveBeenCalledWith({
      authorization: { id_token: 'dev-token' },
      user: {
        email: 'dev@example.com',
        name: { firstName: 'Dev', lastName: 'User' }
      }
    })
  })

  it('loads Apple Sign-In SDK script on mount', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const script = document.querySelector('script[src*="appleid.auth.js"]')
    expect(script).toBeInTheDocument()
  })

  it('removes Apple Sign-In SDK script on unmount', () => {
    const { unmount } = render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const scriptBefore = document.querySelector('script[src*="appleid.auth.js"]')
    expect(scriptBefore).toBeInTheDocument()
    
    unmount()
    
    const scriptAfter = document.querySelector('script[src*="appleid.auth.js"]')
    expect(scriptAfter).not.toBeInTheDocument()
  })

  it('handles Apple Sign-In button click', () => {
    // Mock window.AppleID
    const mockSignIn = vi.fn().mockResolvedValue({ authorization: { id_token: 'apple-token' } })
    vi.stubGlobal('AppleID', {
      auth: {
        init: vi.fn(),
        signIn: mockSignIn
      }
    })
    
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    const appleButton = screen.getByRole('button', { name: /sign in with apple/i })
    fireEvent.click(appleButton)
    
    expect(mockSignIn).toHaveBeenCalled()
  })
})