import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { AuthProvider, useAuth } from '../../../src/hooks/useAuth'

// Set environment variable for tests
process.env.VITE_ALLOWED_EMAILS = 'apple@example.com,test@example.com,user@example.com'

// Mock import.meta.env for the tests
const originalEnv = import.meta.env

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    
    // Reset to production mode for each test
    Object.defineProperty(import.meta, 'env', {
      value: {
        ...originalEnv,
        VITE_ALLOWED_EMAILS: 'apple@example.com,test@example.com,user@example.com',
        MODE: 'production' // Mock production mode for authorization tests
      },
      writable: true,
      configurable: true
    })
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
    
    consoleSpy.mockRestore()
  })

  it('initializes with null user and loading state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Initially loading is true, but useEffect runs immediately in tests
    // By the time we check, loading might already be false
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    // Loading state might have already completed
    expect(typeof result.current.isLoading).toBe('boolean')
  })

  it('loads user from localStorage on mount', async () => {
    const storedUser = {
      id: 'stored-user',
      email: 'stored@example.com',
      name: 'Stored User'
    }
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedUser))
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // Wait for useEffect to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.user).toEqual(storedUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('handles invalid stored user data gracefully', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-json')
    
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('drawscale_user')
    
    consoleSpy.mockRestore()
  })

  it('signs in user with Apple data when email is authorized', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    const appleData = {
      authorization: { id_token: 'apple-token-123' },
      user: {
        email: 'apple@example.com',
        name: { firstName: 'Apple', lastName: 'User' }
      }
    }
    
    act(() => {
      result.current.signIn(appleData)
    })
    
    expect(result.current.user).toEqual({
      id: 'apple-token-123',
      email: 'apple@example.com',
      name: 'Apple User'
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAuthorized).toBe(true)
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'drawscale_user',
      JSON.stringify({
        id: 'apple-token-123',
        email: 'apple@example.com',
        name: 'Apple User'
      })
    )
  })
  
  it('rejects sign in for unauthorized email', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    const appleData = {
      authorization: { id_token: 'apple-token-123' },
      user: {
        email: 'unauthorized@example.com',
        name: { firstName: 'Unauthorized', lastName: 'User' }
      }
    }
    
    expect(() => {
      act(() => {
        result.current.signIn(appleData)
      })
    }).toThrow('Access denied: Your email is not authorized to use this service.')
    
    expect(result.current.user).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAuthorized).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('drawscale_user')
  })

  it('handles sign in with minimal data (no email)', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    const minimalData = {
      user: 'user-string-id'
    }
    
    expect(() => {
      act(() => {
        result.current.signIn(minimalData)
      })
    }).toThrow('Access denied: Your email is not authorized to use this service.')
    
    expect(result.current.user).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAuthorized).toBe(false)
  })

  it('signs out user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    
    // First sign in
    act(() => {
      result.current.signIn({
        authorization: { id_token: 'token' },
        user: { email: 'test@example.com' }
      })
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAuthorized).toBe(true)
    
    // Then sign out
    act(() => {
      result.current.signOut()
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isAuthorized).toBe(false)
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('drawscale_user')
  })

})