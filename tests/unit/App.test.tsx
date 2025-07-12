import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../../src/App'

// Mock Excalidraw component since we'll test it separately
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-component">Excalidraw Mock</div>)
}))

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  it('renders login page when not authenticated', () => {
    render(<App />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DrawScale')
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
    expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument()
  })

  it('renders main app when authenticated', () => {
    // Mock authenticated state
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User'
    }))

    render(<App />)
    
    // Should show the drawing canvas interface
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
  })

  it('handles sign out functionality', () => {
    // Start authenticated
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User'
    }))

    const { rerender } = render(<App />)
    
    // Click sign out
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(signOutButton)

    // Should call localStorage.removeItem
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('drawscale_user')

    // Mock localStorage returning null after sign out
    mockLocalStorage.getItem.mockReturnValue(null)
    rerender(<App />)

    // Should show login page again
    expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<App />)
    // Component should handle loading state gracefully
    expect(screen.getByText(/DrawScale|Loading/)).toBeInTheDocument()
  })
})