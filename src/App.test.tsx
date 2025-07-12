import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

// Mock Excalidraw component since we'll test it separately
vi.mock('@excalidraw/excalidraw', () => ({
  Excalidraw: vi.fn(() => <div data-testid="excalidraw-component">Excalidraw Mock</div>)
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the app header with correct title', () => {
    render(<App />)
    
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DrawScale')
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument()
  })

  it('renders the header with correct styling class', () => {
    render(<App />)
    
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('App-header')
  })

  it('renders the main app container', () => {
    const { container } = render(<App />)
    
    const appContainer = container.querySelector('.App')
    expect(appContainer).toHaveClass('App')
  })

  it('renders the Excalidraw wrapper container', () => {
    render(<App />)
    
    const excalidrawWrapper = screen.getByTestId('excalidraw-component').parentElement
    expect(excalidrawWrapper).toHaveClass('excalidraw-wrapper')
  })

  it('renders the Excalidraw component', () => {
    render(<App />)
    
    expect(screen.getByTestId('excalidraw-component')).toBeInTheDocument()
  })

  it('has the correct component structure', () => {
    const { container } = render(<App />)
    
    // Check that the structure is App > header + excalidraw-wrapper
    const appDiv = container.querySelector('.App')
    const header = appDiv.querySelector('.App-header')
    const excalidrawWrapper = appDiv.querySelector('.excalidraw-wrapper')
    
    expect(appDiv).toBeInTheDocument()
    expect(header).toBeInTheDocument()
    expect(excalidrawWrapper).toBeInTheDocument()
  })
})