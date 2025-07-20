import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import React, { ReactNode } from 'react'
import { AuthProvider, useAuth } from '../../../src/hooks/useAuth'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('../../../src/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn()
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

describe('useAuth hook with Supabase Auth', () => {
  let mockAuthStateCallback: ((event: string, session: Session | null) => void) | null = null

  beforeEach(async () => {
    vi.clearAllMocks()
    
    // Mock console methods to avoid spam
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Reset auth state callback
    mockAuthStateCallback = null
    
    // Get mocked supabase
    const { supabase } = await import('../../../src/lib/supabase')
    
    // Setup default mocks
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ data: { session: null }, error: null })
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      mockAuthStateCallback = callback
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('throws error when used outside AuthProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('initializes with loading state and no user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Initially should be loading
    expect(result.current.isLoading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAuthorized).toBe(false)
    
    // Wait for initial session check to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.isLoading).toBe(false)
  })

  it('loads existing session on mount', async () => {
    const mockUser = createMockSupabaseUser({
      email: 'existing@example.com',
      user_metadata: { full_name: 'Existing User' }
    })
    const mockSession = createMockSession(mockUser)
    
    const { supabase } = await import('../../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: mockSession }, 
      error: null 
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toEqual({
      id: 'user-123',
      email: 'existing@example.com',
      name: 'Existing User',
      provider: 'google'
    })
    expect(result.current.session).toBe(mockSession)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAuthorized).toBe(true)
  })

  it('handles auth state changes', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Wait for initial setup
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.user).toBeNull()
    
    // Simulate sign in
    const mockUser = createMockSupabaseUser({
      email: 'signin@example.com',
      app_metadata: { provider: 'apple' },
      user_metadata: { 
        name: { first_name: 'Apple', last_name: 'User' }
      }
    })
    const mockSession = createMockSession(mockUser)
    
    await act(async () => {
      if (mockAuthStateCallback) {
        mockAuthStateCallback('SIGNED_IN', mockSession)
      }
    })
    
    expect(result.current.user).toEqual({
      id: 'user-123',
      email: 'signin@example.com',
      name: 'Apple User',
      provider: 'apple'
    })
    expect(result.current.session).toBe(mockSession)
    expect(result.current.isAuthenticated).toBe(true)
    
    // Simulate sign out
    await act(async () => {
      if (mockAuthStateCallback) {
        mockAuthStateCallback('SIGNED_OUT', null)
      }
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.session).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('handles user metadata extraction correctly', async () => {
    const testCases = [
      {
        name: 'handles full_name in metadata',
        user: createMockSupabaseUser({
          email: 'fullname@example.com',
          user_metadata: { full_name: 'Full Name User' }
        }),
        expectedName: 'Full Name User'
      },
      {
        name: 'handles nested name object',
        user: createMockSupabaseUser({
          email: 'nested@example.com',
          user_metadata: { 
            name: { first_name: 'Nested', last_name: 'User' }
          }
        }),
        expectedName: 'Nested User'
      },
      {
        name: 'handles separate first/last names',
        user: createMockSupabaseUser({
          email: 'separate@example.com',
          user_metadata: { 
            first_name: 'Separate',
            last_name: 'Names'
          }
        }),
        expectedName: 'Separate Names'
      },
      {
        name: 'handles missing name gracefully',
        user: createMockSupabaseUser({
          email: 'noname@example.com',
          user_metadata: {}
        }),
        expectedName: undefined
      }
    ]

    for (const testCase of testCases) {
      const mockSession = createMockSession(testCase.user)
      const { supabase } = await import('../../../src/lib/supabase')
      vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
        data: { session: mockSession }, 
        error: null 
      })
      
      const { result, unmount } = renderHook(() => useAuth(), { wrapper })
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })
      
      expect(result.current.user?.name).toBe(testCase.expectedName)
      
      unmount()
    }
  })

  it('handles session errors gracefully', async () => {
    const mockError = new Error('Session error')
    const { supabase } = await import('../../../src/lib/supabase')
    vi.mocked(supabase.auth.getSession).mockResolvedValue({ 
      data: { session: null }, 
      error: mockError 
    })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.isLoading).toBe(false)
    expect(result.current.user).toBeNull()
    expect(console.error).toHaveBeenCalledWith('Error getting session:', mockError)
  })

  it('calls supabase signOut when signOut is called', async () => {
    const { supabase } = await import('../../../src/lib/supabase')
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await result.current.signOut()
    })
    
    expect(vi.mocked(supabase.auth.signOut)).toHaveBeenCalledTimes(1)
  })

  it('handles signOut errors', async () => {
    const mockError = new Error('Sign out error')
    const { supabase } = await import('../../../src/lib/supabase')
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: mockError })
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await expect(async () => {
      await act(async () => {
        await result.current.signOut()
      })
    }).rejects.toThrow('Sign out error')
    
    expect(console.error).toHaveBeenCalledWith('Error signing out:', mockError)
  })

  it('unsubscribes from auth changes on unmount', async () => {
    const mockUnsubscribe = vi.fn()
    const { supabase } = await import('../../../src/lib/supabase')
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })
    
    const { unmount } = renderHook(() => useAuth(), { wrapper })
    
    unmount()
    
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
  })
})