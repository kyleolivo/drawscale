import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import ProcessingIndicator from '../../../src/components/ProcessingIndicator';

describe('ProcessingIndicator', () => {
  it('renders with default message', () => {
    render(<ProcessingIndicator />);
    
    expect(screen.getByText('Processing your submission...')).toBeInTheDocument();
    expect(screen.getByText('Analyzing your design and commentary...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Custom processing message';
    render(<ProcessingIndicator message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.getByText('Analyzing your design and commentary...')).toBeInTheDocument();
  });

  it('renders spinner animation', () => {
    const { container } = render(<ProcessingIndicator />);
    
    const spinner = container.querySelector('.spinner-ring');
    expect(spinner).toBeInTheDocument();
    
    // Check that spinner has the correct number of div elements for animation
    const spinnerDivs = container.querySelectorAll('.spinner-ring div');
    expect(spinnerDivs).toHaveLength(4);
  });

  it('has correct CSS classes', () => {
    const { container } = render(<ProcessingIndicator />);
    
    expect(container.querySelector('.processing-indicator')).toBeInTheDocument();
    expect(container.querySelector('.processing-spinner')).toBeInTheDocument();
    expect(container.querySelector('.processing-message')).toBeInTheDocument();
    expect(container.querySelector('.processing-details')).toBeInTheDocument();
  });

  it('renders compact variant correctly', () => {
    const { container } = render(<ProcessingIndicator variant="compact" />);
    
    expect(container.querySelector('.processing-indicator-compact')).toBeInTheDocument();
    expect(container.querySelector('.processing-spinner-compact')).toBeInTheDocument();
    expect(container.querySelector('.spinner-ring-compact')).toBeInTheDocument();
    expect(container.querySelector('.processing-text-compact')).toBeInTheDocument();
    expect(screen.getByText('Processing...')).toBeInTheDocument();
    
    // Should not have full variant classes
    expect(container.querySelector('.processing-indicator')).not.toBeInTheDocument();
  });

  it('compact variant has correct number of spinner elements', () => {
    const { container } = render(<ProcessingIndicator variant="compact" />);
    
    const spinnerDivs = container.querySelectorAll('.spinner-ring-compact div');
    expect(spinnerDivs).toHaveLength(4);
  });
});