import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, beforeEach, test, expect, vi, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import { useAuth } from '../context/AuthContext';

// Mock the useAuth hook
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock the logo import
vi.mock('../assets/TripTrekLogo.png', () => ({
  default: 'mocked-logo-path'
}));

describe('NavigationBar', () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation
    useAuth.mockReturnValue({
      user: {
        username: 'testuser'
      },
      signOut: mockSignOut
    });
  });

  const renderNavigationBar = () => {
    return render(
      <BrowserRouter>
        <NavigationBar />
      </BrowserRouter>
    );
  };

  test('renders logo image with alt text', () => {
    renderNavigationBar();
    const logo = screen.getByAltText('TripTrek');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'mocked-logo-path');
  });

  test('renders all navigation links', () => {
    renderNavigationBar();
   
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Trips')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  test('renders user avatar with first letter of username', () => {
    renderNavigationBar();
   
    const avatar = screen.getByText('T'); // First letter of 'testuser'
    expect(avatar).toBeInTheDocument();
  });

  test('displays username in dropdown header', () => {
    renderNavigationBar();
   
    // Click on the avatar to open dropdown
    const avatar = screen.getByText('T');
    fireEvent.click(avatar);
   
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('renders sign out option in dropdown', () => {
    renderNavigationBar();
   
    // Click on the avatar to open dropdown
    const avatar = screen.getByText('T');
    fireEvent.click(avatar);
   
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  test('calls signOut when sign out is clicked', () => {
    renderNavigationBar();
   
    // Click on the avatar to open dropdown
    const avatar = screen.getByText('T');
    fireEvent.click(avatar);
   
    // Click sign out
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
   
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  test('handles user with email as loginId', () => {
    useAuth.mockReturnValue({
      user: {
        signInDetails: {
          loginId: 'user@example.com'
        }
      },
      signOut: mockSignOut
    });

    renderNavigationBar();
   
    const avatar = screen.getByText('U'); // First letter of 'user@example.com'
    expect(avatar).toBeInTheDocument();
   
    // Click to open dropdown and check username display
    fireEvent.click(avatar);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  test('handles user with attributes.email', () => {
    useAuth.mockReturnValue({
      user: {
        attributes: {
          email: 'test@example.com'
        }
      },
      signOut: mockSignOut
    });

    renderNavigationBar();
   
    const avatar = screen.getByText('T'); // First letter of 'test@example.com'
    expect(avatar).toBeInTheDocument();
   
    // Click to open dropdown and check username display
    fireEvent.click(avatar);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('handles user with no username (defaults to "User")', () => {
    useAuth.mockReturnValue({
      user: {},
      signOut: mockSignOut
    });

    renderNavigationBar();
   
    const avatar = screen.getByText('U'); // First letter of 'User'
    expect(avatar).toBeInTheDocument();
   
    // Click to open dropdown and check username display
    fireEvent.click(avatar);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    renderNavigationBar();
   
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /trips/i })).toHaveAttribute('href', '/trips');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /contact us/i })).toHaveAttribute('href', '/contact');
  });

  test('navbar has correct accessibility attributes', () => {
    renderNavigationBar();
   
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
   
    const toggleButton = screen.getByRole('button', { name: /toggle navigation/i });
    expect(toggleButton).toHaveAttribute('aria-controls', 'main-navbar-nav');
  });
});
