import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import AppHeader from '../../../src/components/AppHeader';

describe('AppHeader', () => {
  it('renders app title and description', () => {
    render(<AppHeader />);

    expect(screen.getByText('DrawScale')).toBeInTheDocument();
    expect(screen.getByText('System Design Interview Prep Tool')).toBeInTheDocument();
  });

  it('renders user info when user is provided', () => {
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

    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('renders user email when name is not provided', () => {
    const mockUser = {
      id: '1',
      email: 'john@example.com'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('Welcome, john@example.com')).toBeInTheDocument();
  });

  it('renders generic user text when neither name nor email is provided', () => {
    const mockUser = {
      id: '1'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('Welcome, User')).toBeInTheDocument();
  });

  it('does not render user info when user is not provided', () => {
    render(<AppHeader />);

    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
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

    screen.getByText('Sign Out').click();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('does not render sign out button when onSignOut is not provided', () => {
    const mockUser = {
      id: '1',
      name: 'John Doe'
    };

    render(<AppHeader user={mockUser} />);

    expect(screen.getByText('Welcome, John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Sign Out')).not.toBeInTheDocument();
  });

  it('renders with correct CSS classes', () => {
    render(<AppHeader />);

    const header = screen.getByText('DrawScale').closest('.app-header');
    expect(header).toBeInTheDocument();
    
    const title = screen.getByText('DrawScale').closest('.app-title');
    expect(title).toBeInTheDocument();
  });

  it('renders user info with correct CSS classes when user is provided', () => {
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

    const userInfo = screen.getByText('Welcome, John Doe').closest('.user-info');
    expect(userInfo).toBeInTheDocument();
    
    const logoutButton = screen.getByText('Sign Out');
    expect(logoutButton).toHaveClass('logout-button');
  });
}); 