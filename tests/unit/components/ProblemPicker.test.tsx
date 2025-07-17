import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ProblemPicker from '../../../src/components/ProblemPicker';
import { PROBLEMS } from '../../../src/constants/problems';

describe('ProblemPicker', () => {
  const mockOnProblemSelect = vi.fn();

  beforeEach(() => {
    mockOnProblemSelect.mockClear();
  });

  it('renders the title and all problem cards', () => {
    render(
      <ProblemPicker 
        problems={PROBLEMS} 
        onProblemSelect={mockOnProblemSelect} 
      />
    );

    expect(screen.getByText('Choose a System Design Problem')).toBeInTheDocument();
    expect(screen.getByText('Blog Platform')).toBeInTheDocument();
    expect(screen.getByText('Parking Garage Valet')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();
  });

  it('displays problem information correctly', () => {
    render(
      <ProblemPicker 
        problems={PROBLEMS} 
        onProblemSelect={mockOnProblemSelect} 
      />
    );

    // Check for problem titles
    expect(screen.getByText('Blog Platform')).toBeInTheDocument();
    expect(screen.getByText('Parking Garage Valet')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp')).toBeInTheDocument();

    // Check for problem descriptions
    expect(screen.getByText('Simple blogging platform where users create accounts and publish articles.')).toBeInTheDocument();
    expect(screen.getByText('Smart parking system that manages valet operations and customer experience.')).toBeInTheDocument();
    expect(screen.getByText('Real-time messaging app supporting one-on-one and group conversations.')).toBeInTheDocument();

    // Check for difficulty badges (we now have one of each difficulty)
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('calls onProblemSelect when a problem card is clicked', () => {
    render(
      <ProblemPicker 
        problems={PROBLEMS} 
        onProblemSelect={mockOnProblemSelect} 
      />
    );

    const firstProblemCard = screen.getByText('Blog Platform').closest('.problem-card');
    expect(firstProblemCard).toBeInTheDocument();

    fireEvent.click(firstProblemCard!);
    expect(mockOnProblemSelect).toHaveBeenCalledWith(PROBLEMS[0]);
  });

  it('calls onProblemSelect when Enter key is pressed on a problem card', () => {
    render(
      <ProblemPicker 
        problems={PROBLEMS} 
        onProblemSelect={mockOnProblemSelect} 
      />
    );

    const firstProblemCard = screen.getByText('Blog Platform').closest('.problem-card');
    expect(firstProblemCard).toBeInTheDocument();

    fireEvent.keyDown(firstProblemCard!, { key: 'Enter' });
    expect(mockOnProblemSelect).toHaveBeenCalledWith(PROBLEMS[0]);
  });

  it('calls onProblemSelect when Space key is pressed on a problem card', () => {
    render(
      <ProblemPicker 
        problems={PROBLEMS} 
        onProblemSelect={mockOnProblemSelect} 
      />
    );

    const firstProblemCard = screen.getByText('Blog Platform').closest('.problem-card');
    expect(firstProblemCard).toBeInTheDocument();

    fireEvent.keyDown(firstProblemCard!, { key: ' ' });
    expect(mockOnProblemSelect).toHaveBeenCalledWith(PROBLEMS[0]);
  });

  it('does not call onProblemSelect for other keys', () => {
    render(
      <ProblemPicker 
        problems={PROBLEMS} 
        onProblemSelect={mockOnProblemSelect} 
      />
    );

    const firstProblemCard = screen.getByText('Blog Platform').closest('.problem-card');
    expect(firstProblemCard).toBeInTheDocument();

    fireEvent.keyDown(firstProblemCard!, { key: 'Tab' });
    expect(mockOnProblemSelect).not.toHaveBeenCalled();
  });
}); 