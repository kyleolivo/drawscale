import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../../src/App'

// Mock localStorage for authenticated tests
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
})

describe('App Integration Tests', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Suppress console warnings from Excalidraw during tests
    consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.clearAllMocks()
    
    // Mock authenticated state for integration tests
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      id: 'test-user',
      email: 'test@example.com',
      name: 'Test User'
    }))
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('renders Excalidraw component without crashing when authenticated', async () => {
    const { container } = render(<App />)
    
    // Wait for Excalidraw to potentially load
    await waitFor(() => {
      expect(container.querySelector('.excalidraw-wrapper')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('loads Excalidraw with canvas elements when authenticated', async () => {
    const { container } = render(<App />)
    
    // Wait for Excalidraw to render canvas elements
    await waitFor(() => {
      const canvasElements = container.querySelectorAll('canvas')
      expect(canvasElements.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('creates Excalidraw DOM structure when authenticated', async () => {
    const { container } = render(<App />)
    
    await waitFor(() => {
      // Look for elements that suggest Excalidraw has rendered
      const excalidrawElements = container.querySelectorAll('[class*="excalidraw"]')
      expect(excalidrawElements.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('maintains responsive layout structure when authenticated', () => {
    const { container } = render(<App />)
    
    const appContainer = container.querySelector('.App')
    const header = container.querySelector('.App-header')
    const excalidrawWrapper = container.querySelector('.excalidraw-wrapper')
    
    // Check that the CSS classes are applied (styles are handled by CSS files)
    expect(appContainer).toHaveClass('App')
    expect(header).toHaveClass('App-header')
    expect(excalidrawWrapper).toHaveClass('excalidraw-wrapper')
  })

  it('integrates with the complete application structure when authenticated', () => {
    render(<App />)
    
    // Check that both header content and Excalidraw wrapper are present
    expect(screen.getByText('DrawScale')).toBeInTheDocument()
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
    
    const excalidrawWrapper = document.querySelector('.excalidraw-wrapper')
    expect(excalidrawWrapper).toBeInTheDocument()
  })

  it('shows login page when not authenticated', () => {
    // Mock unauthenticated state
    mockLocalStorage.getItem.mockReturnValue(null)
    
    render(<App />)
    
    // Should show login page, not Excalidraw
    expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with apple/i })).toBeInTheDocument()
    
    // Should not show Excalidraw
    const excalidrawWrapper = document.querySelector('.excalidraw-wrapper')
    expect(excalidrawWrapper).not.toBeInTheDocument()
  })
})