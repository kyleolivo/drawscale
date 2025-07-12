import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '../../../src/components/LoginPage'

describe('LoginPage Component', () => {
  const mockOnSignIn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
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

  it('always renders Apple Sign-In button', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    // Always shows Apple button regardless of environment
    expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument()
  })

  it('shows dev button when in development mode', () => {
    render(<LoginPage onSignIn={mockOnSignIn} />)
    
    // Since we're running tests in dev mode, dev button should be present
    const devButton = screen.queryByText('Dev Sign In (Local Only)')
    const appleButton = screen.getByRole('button', { name: /sign in with apple/i })
    
    // Both buttons should be present in development
    expect(devButton).toBeInTheDocument()
    expect(appleButton).toBeInTheDocument()
    
    // Should have two buttons total
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('calls onSignIn when dev button is clicked', () => {
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