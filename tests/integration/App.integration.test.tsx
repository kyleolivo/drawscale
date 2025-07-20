import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../../src/App'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

// Mock Excalidraw component
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-component" className="excalidraw-wrapper">Excalidraw Mock</div>)
}))

// Mock React Router
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
  },
  transcribeAudioWithImage: vi.fn()
}))

// Helper to create mock Supabase user
const createMockSupabaseUser = (overrides: Partial<SupabaseUser> = {}): SupabaseUser => ({
  id: 'test-user',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@example.com',
  email_confirmed_at: '2024-01-01T00:00:00Z',
  phone: '',
  confirmed_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-01-01T00:00:00Z',
  app_metadata: { provider: 'google' },
  user_metadata: { 
    full_name: 'Test User'
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

describe('App Integration Tests', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(async () => {
    // Suppress console warnings from Excalidraw during tests
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.clearAllMocks()
    
    // Setup authenticated state for integration tests
    const mockUser = createMockSupabaseUser()
    const mockSession = createMockSession(mockUser)
    
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      // Immediately call with signed in state
      setTimeout(() => callback('SIGNED_IN', mockSession), 0)
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('renders Excalidraw component without crashing when authenticated', async () => {
    render(<App />)
    
    // Wait for auth to initialize and Excalidraw to load
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('loads Excalidraw with canvas elements when authenticated', async () => {
    render(<App />)
    
    // Wait for Excalidraw component to load
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Since we're mocking Excalidraw, we expect our mock component
    expect(screen.getByText('Excalidraw Mock')).toBeInTheDocument()
  })

  it('creates Excalidraw DOM structure when authenticated', async () => {
    const { container } = render(<App />)
    
    await waitFor(() => {
      // Look for mocked Excalidraw component
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check that the excalidraw wrapper class is present
    expect(container.querySelector('.excalidraw-wrapper')).toBeInTheDocument()
  })

  it('maintains responsive layout structure when authenticated', async () => {
    const { container } = render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check that main structural elements are present
    const appContainer = container.querySelector('.App')
    expect(appContainer).toBeInTheDocument()
  })

  it('integrates with the complete application structure when authenticated', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check that both header content and Excalidraw wrapper are present
    expect(screen.getByRole('heading', { name: 'DrawScale', level: 1 })).toBeInTheDocument()
    // Check for user avatar with initials
    expect(screen.getByText('TU')).toBeInTheDocument() // Test User initials
  })

  it('renders RecordButton component when authenticated', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // Check that the record button is present but disabled (no problem selected)
    const button = screen.getByRole('button', { name: /select a problem to enable recording/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('record-button')
  })

  it('integrates RecordButton with transcription functionality', async () => {
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // The record button should be disabled initially (no problem selected)
    const recordButton = screen.getByRole('button', { name: /select a problem to enable recording/i })
    expect(recordButton).toBeInTheDocument()
    expect(recordButton).toBeDisabled()
  })

  it('shows login page when not authenticated', async () => {
    // Mock unauthenticated state
    const { supabase } = await import('../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: null }, 
      error: null 
    })
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      setTimeout(() => callback('SIGNED_OUT', null), 0)
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    
    render(<App />)
    
    // Should show login page, not Excalidraw
    await waitFor(() => {
      expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    // In test environment (development), should show dev button
    expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
    // Should not show Excalidraw
    expect(screen.queryByTestId('excalidraw-component')).not.toBeInTheDocument()
  })
})