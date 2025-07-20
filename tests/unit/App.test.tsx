import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
// BrowserRouter is mocked below
import App from '../../src/App'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

// Mock Excalidraw component since we'll test it separately
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-component">Excalidraw Mock</div>)
}))

// Mock React Router since App includes BrowserRouter
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  const { MemoryRouter } = actual as typeof import('react-router-dom')
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter initialEntries={['/']}>{children}</MemoryRouter>
    )
  }
})

// Mock Supabase client
vi.mock('../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn()
    }
  }
}))

// Helper to create mock Supabase user
const createMockSupabaseUser = (overrides: Partial<SupabaseUser> = {}): SupabaseUser => ({
  id: 'user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: { provider: 'google' },
  user_metadata: { 
    full_name: 'Test User',
    first_name: 'Test',
    last_name: 'User'
  },
  identities: [],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  is_anonymous: false,
  ...overrides
})

// Helper to create mock session
const createMockSession = (user?: SupabaseUser): Session | null => {
  if (!user) return null
  
  return {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() / 1000 + 3600,
    token_type: 'bearer',
    user
  }
}

describe('App Component', () => {
  let mockAuthStateCallback: ((event: string, session: Session | null) => void) | null = null

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Mock console methods to avoid spam
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset auth state callback
    mockAuthStateCallback = null
    
    // Get mocked supabase and setup default mocks - no session initially
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null })
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      mockAuthStateCallback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })
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

  it('renders login page when not authenticated', async () => {
    render(<App />)
    
    // Wait for auth to initialize
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DrawScale')
    })
    
    expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    
    // In test environment (development), should show dev button
    expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
    
    // Should not show the main app
    expect(screen.queryByTestId('excalidraw-component')).not.toBeInTheDocument()
  })

  it('shows loading state initially', () => {
    render(<App />)
    
    // Should show loading spinner while auth is initializing
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders main app when authenticated', async () => {
    // Mock authenticated user
    const mockUser = createMockSupabaseUser({
      email: 'authenticated@example.com',
      user_metadata: { full_name: 'Auth User' }
    })
    const mockSession = createMockSession(mockUser)
    
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    render(<App />)
    
    // Wait for auth to load
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    })
    
    // Should show the drawing canvas interface with user initials
    expect(screen.getByText('AU')).toBeInTheDocument()
    
    // Should not show login page
    expect(screen.queryByText('Sign in to access the drawing canvas')).not.toBeInTheDocument()
  })

  it('handles auth state changes from login to authenticated', async () => {
    render(<App />)
    
    // Initially should show login page
    await waitFor(() => {
      expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    })
    
    // Simulate successful authentication
    const mockUser = createMockSupabaseUser({
      email: 'newuser@example.com',
      user_metadata: { full_name: 'New User' }
    })
    const mockSession = createMockSession(mockUser)
    
    if (mockAuthStateCallback) {
      mockAuthStateCallback('SIGNED_IN', mockSession)
    }
    
    // Should now show the main app
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    })
    
    expect(screen.getByText('NU')).toBeInTheDocument() // New User initials
    expect(screen.queryByText('Sign in to access the drawing canvas')).not.toBeInTheDocument()
  })

  it('handles sign out functionality', async () => {
    // Start with authenticated user
    const mockUser = createMockSupabaseUser({
      email: 'signout@example.com',
      user_metadata: { full_name: 'Sign Out' }
    })
    const mockSession = createMockSession(mockUser)
    
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    render(<App />)
    
    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    })
    
    // Find and click sign out button
    const userSection = screen.getByText('SO').closest('.user-section')
    const signOutButton = userSection?.querySelector('.logout-button') as HTMLButtonElement
    
    expect(signOutButton).toBeInTheDocument()
    fireEvent.click(signOutButton)
    
    // Should call supabase signOut
    await waitFor(async () => {
      const { supabase } = await import('../../src/lib/supabase')
      expect(vi.mocked(supabase.auth.signOut)).toHaveBeenCalledTimes(1)
    })
    
    // Simulate auth state change to signed out
    if (mockAuthStateCallback) {
      mockAuthStateCallback('SIGNED_OUT', null)
    }
    
    // Should show login page again
    await waitFor(() => {
      expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    })
    
    expect(screen.queryByTestId('excalidraw-component')).not.toBeInTheDocument()
  })

  it('handles auth errors gracefully', async () => {
    // Mock auth error
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: null }, 
      error: new Error('Auth error') 
    })
    
    render(<App />)
    
    // Should still show login page despite error
    await waitFor(() => {
      expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    })
    
    // Error should be logged
    expect(console.error).toHaveBeenCalledWith('Error getting session:', expect.any(Error))
  })

  it('renders correct routes when authenticated', async () => {
    const mockUser = createMockSupabaseUser()
    const mockSession = createMockSession(mockUser)
    
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    })
    
    // Should render the main route (/) with DrawCanvas
    expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
  })

  it('handles different user metadata formats', async () => {
    const testCases = [
      {
        name: 'full_name metadata',
        user: createMockSupabaseUser({
          user_metadata: { full_name: 'Full Name' }
        }),
        expectedInitials: 'FN'
      },
      {
        name: 'first and last name',
        user: createMockSupabaseUser({
          user_metadata: { first_name: 'First', last_name: 'Last' }
        }),
        expectedInitials: 'FL'
      },
      {
        name: 'nested name object',
        user: createMockSupabaseUser({
          user_metadata: { name: { first_name: 'Nested', last_name: 'Name' } }
        }),
        expectedInitials: 'NN'
      },
      {
        name: 'email only',
        user: createMockSupabaseUser({
          email: 'email@example.com',
          user_metadata: {}
        }),
        expectedInitials: 'EM' // Should use email when no name
      }
    ]
    
    for (const testCase of testCases) {
      const mockSession = createMockSession(testCase.user)
      const { supabase } = await import('../../src/lib/supabase')
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      })
      
      const { unmount } = render(<App />)
      
      await waitFor(() => {
        expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
      })
      
      // Check user initials are displayed correctly
      expect(screen.getByText(testCase.expectedInitials)).toBeInTheDocument()
      
      unmount()
    }
  })
})