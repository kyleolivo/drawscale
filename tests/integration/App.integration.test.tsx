import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
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
    let container;
    await act(async () => {
      ({ container } = render(<App />));
    });
    // Wait for Excalidraw to potentially load
    await waitFor(() => {
      expect(container.querySelector('.excalidraw-wrapper')).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('loads Excalidraw with canvas elements when authenticated', async () => {
    let container;
    await act(async () => {
      ({ container } = render(<App />));
    });
    // Wait for Excalidraw to render canvas elements
    await waitFor(() => {
      const canvasElements = container.querySelectorAll('canvas')
      expect(canvasElements.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('creates Excalidraw DOM structure when authenticated', async () => {
    let container;
    await act(async () => {
      ({ container } = render(<App />));
    });
    await waitFor(() => {
      // Look for elements that suggest Excalidraw has rendered
      const excalidrawElements = container.querySelectorAll('[class*="excalidraw"]')
      expect(excalidrawElements.length).toBeGreaterThan(0)
    }, { timeout: 5000 })
  })

  it('maintains responsive layout structure when authenticated', async () => {
    let container;
    await act(async () => {
      ({ container } = render(<App />));
    });
    const appContainer = container.querySelector('.App')
    const header = container.querySelector('.App-header')
    const excalidrawWrapper = container.querySelector('.excalidraw-wrapper')
    // Check that the CSS classes are applied (styles are handled by CSS files)
    expect(appContainer).toHaveClass('App')
    expect(header).toHaveClass('App-header')
    expect(excalidrawWrapper).toHaveClass('excalidraw-wrapper')
  })

  it('integrates with the complete application structure when authenticated', async () => {
    await act(async () => {
      render(<App />)
    });
    // Check that both header content and Excalidraw wrapper are present
    // Use getByRole to be more specific about which DrawScale we want
    expect(screen.getByRole('heading', { name: 'DrawScale', level: 1 })).toBeInTheDocument()
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument()
    const excalidrawWrapper = document.querySelector('.excalidraw-wrapper')
    expect(excalidrawWrapper).toBeInTheDocument()
  })

  it('renders RecordButton component when authenticated', async () => {
    await act(async () => {
      render(<App />)
    });
    
    // Check that the record button container is present
    const recordButton = document.querySelector('.record-button-container')
    expect(recordButton).toBeInTheDocument()
    
    // Check that the record button itself is present
    const button = screen.getByRole('button', { name: /start recording/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('record-button')
  })

  it('integrates RecordButton with transcription functionality', async () => {
    // Mock the transcribeAudio function
    vi.mock('../../../src/lib/supabase', () => ({
      transcribeAudio: vi.fn().mockResolvedValue({ text: 'Test transcription' })
    }))

    await act(async () => {
      render(<App />)
    });
    
    const recordButton = screen.getByRole('button', { name: /start recording/i })
    expect(recordButton).toBeInTheDocument()
    
    // The button should be integrated into the DrawCanvas component
    const drawCanvas = document.querySelector('.App')
    expect(drawCanvas).toContainElement(recordButton)
  })

  it('shows login page when not authenticated', async () => {
    // Mock unauthenticated state
    mockLocalStorage.getItem.mockReturnValue(null)
    await act(async () => {
      render(<App />)
    });
    // Should show login page, not Excalidraw
    expect(screen.getByText('Sign in to access the drawing canvas')).toBeInTheDocument()
    // In test environment (development), should show dev button
    expect(screen.getByText('Dev Sign In (Local Only)')).toBeInTheDocument()
    // Should not show Excalidraw
    const excalidrawWrapper = document.querySelector('.excalidraw-wrapper')
    expect(excalidrawWrapper).not.toBeInTheDocument()
  })
})