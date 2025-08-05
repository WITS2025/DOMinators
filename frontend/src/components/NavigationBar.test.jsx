import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, beforeEach, test, expect, vi, it } from 'vitest';
import NavigationBar from './NavigationBar';

// Mock the AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      username: 'testuser',
      signInDetails: { loginId: 'testuser' },
      attributes: {
        email: 'test@example.com'
      }
    },
    signOut: vi.fn()
  })
}));

// Mock react-router-dom with proper exports
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
    useNavigate: () => vi.fn()
  };
});

// Mock Bootstrap components
vi.mock('react-bootstrap', () => ({
  Navbar: {
    Brand: ({ children, ...props }) => <div {...props}>{children}</div>,
    Toggle: ({ children, ...props }) => <button {...props}>{children}</button>,
    Collapse: ({ children, ...props }) => <div {...props}>{children}</div>
  },
  Nav: {
    Link: ({ children, ...props }) => <a {...props}>{children}</a>
  },
  Container: ({ children, ...props }) => <div {...props}>{children}</div>,
  Dropdown: {
    Toggle: ({ children, ...props }) => <div {...props}>{children}</div>,
    Menu: ({ children, ...props }) => <div {...props}>{children}</div>,
    Header: ({ children, ...props }) => <div {...props}>{children}</div>,
    Divider: (props) => <hr {...props} />,
    Item: ({ children, ...props }) => <div {...props}>{children}</div>
  }
}));

describe('NavigationBar', () => {
  test('renders logo image with alt text', () => {
    render(<NavigationBar />);
    const logo = screen.getByAltText(/TripTrek/i);
    expect(logo).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<NavigationBar />);
    
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Trips/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test('renders user avatar with first letter', () => {
    render(<NavigationBar />);
    
    // Should display the first letter of the username
    expect(screen.getByText('T')).toBeInTheDocument(); // 'T' from 'testuser'
  });

  test('renders username in dropdown', () => {
    render(<NavigationBar />);
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  test('renders sign out option', () => {
    render(<NavigationBar />);
    
    expect(screen.getByText(/Sign Out/i)).toBeInTheDocument();
  });
});
