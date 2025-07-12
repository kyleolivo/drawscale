import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import DrawCanvas from '../../../src/components/DrawCanvas'

// Mock Excalidraw
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-component">Excalidraw Mock</div>)
}))

// Mock useAuth hook
const mockSignOut = vi.fn()
const mockUser = {
  id: 'test-user',
  email: 'test@example.com',
  name: 'Test User'
}

vi.mock('../../../src/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    signOut: mockSignOut
  }))
}))

describe('DrawCanvas Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the header with correct content', () => {
    render(<DrawCanvas />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DrawScale')
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
  })

  it('displays user name in welcome message', () => {
    render(<DrawCanvas />)
    
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
  })

  it('displays user email when name is not available', async () => {
    const { useAuth } = await import('../../../src/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValueOnce({
      user: { ...mockUser, name: undefined },
      signOut: mockSignOut,
      isAuthenticated: true,
      isLoading: false,
      signIn: vi.fn()
    })
    
    render(<DrawCanvas />)
    
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument()
  })

  it('renders sign out button', () => {
    render(<DrawCanvas />)
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    expect(signOutButton).toBeInTheDocument()
    expect(signOutButton).toHaveClass('logout-button')
  })

  it('calls signOut when sign out button is clicked', () => {
    render(<DrawCanvas />)
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(signOutButton)
    
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('renders Excalidraw component', () => {
    render(<DrawCanvas />)
    
    expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
  })

  it('has correct component structure', () => {
    const { container } = render(<DrawCanvas />)
    
    const appDiv = container.querySelector('.App')
    const header = container.querySelector('.App-header')
    const excalidrawWrapper = container.querySelector('.excalidraw-wrapper')
    
    expect(appDiv).toBeInTheDocument()
    expect(header).toBeInTheDocument()
    expect(excalidrawWrapper).toBeInTheDocument()
  })

  it('has correct header structure', () => {
    const { container } = render(<DrawCanvas />)
    
    const headerContent = container.querySelector('.header-content')
    const headerTitle = container.querySelector('.header-title')
    const headerUser = container.querySelector('.header-user')
    
    expect(headerContent).toBeInTheDocument()
    expect(headerTitle).toBeInTheDocument()
    expect(headerUser).toBeInTheDocument()
  })
})