import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AppHeader from '../../../src/components/AppHeader';

describe('AppHeader', () => {
  it('renders app title', () => {
    render(<AppHeader />);

    expect(screen.getByText('DrawScale')).toBeInTheDocument();
  });

  it('renders user avatar and sign out button when user is provided', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com'
    };
    const mockSignOut = vi.fn();

    render(
      <AppHeader
        user={mockUser}
        onSignOut={mockSignOut}
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument(); // User initials
    expect(screen.getByTitle('Sign Out')).toBeInTheDocument(); // Icon button with title
  });

  it('renders correct initials from user name', () => {
    const mockUser = {
      id: '1',
      name: 'John Smith Doe',
      email: 'john@example.com'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('JS')).toBeInTheDocument(); // First two initials
  });

  it('renders initials from email when name is not provided', () => {
    const mockUser = {
      id: '1',
      email: 'john@example.com'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('JO')).toBeInTheDocument(); // First two letters of email
  });

  it('renders generic initial when neither name nor email is provided', () => {
    const mockUser = {
      id: '1'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('U')).toBeInTheDocument(); // Generic 'U' for User
  });

  it('does not render user section when user is not provided', () => {
    render(<AppHeader />);

    expect(screen.queryByTitle('Sign Out')).not.toBeInTheDocument();
    expect(document.querySelector('.user-section')).not.toBeInTheDocument();
  });

  it('calls onSignOut when sign out button is clicked', () => {
    const mockSignOut = vi.fn();
    const mockUser = {
      id: '1',
      name: 'John Doe'
    };

    render(
      <AppHeader
        user={mockUser}
        onSignOut={mockSignOut}
      />
    );

    screen.getByTitle('Sign Out').click();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not render sign out button when onSignOut is not provided', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('JD')).toBeInTheDocument(); // Avatar still shows
    expect(screen.queryByTitle('Sign Out')).not.toBeInTheDocument(); // But no sign out button
  });

  it('renders with correct CSS classes', () => {
    render(<AppHeader />);

    const header = screen.getByText('DrawScale').closest('.app-header');
    expect(header).toBeInTheDocument();
    
    const title = screen.getByText('DrawScale').closest('.app-title');
    expect(title).toBeInTheDocument();
  });

  it('renders user section with correct CSS classes when user is provided', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe'
    };
    const mockSignOut = vi.fn();

    render(
      <AppHeader
        user={mockUser}
        onSignOut={mockSignOut}
      />
    );

    const userSection = document.querySelector('.user-section');
    expect(userSection).toBeInTheDocument();
    
    const userAvatar = document.querySelector('.user-avatar');
    expect(userAvatar).toBeInTheDocument();
    
    const logoutButton = screen.getByTitle('Sign Out');
    expect(logoutButton).toHaveClass('logout-button');
  });
}); 