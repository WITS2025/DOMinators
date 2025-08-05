import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, beforeEach, test, expect, vi, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NavigationBar from './NavigationBar';

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      username: 'testuser',
      attributes: {
        email: 'test@example.com'
      }
    },
    signOut: vi.fn()
  })
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
}));

describe('NavigationBar', () => {
  test('renders logo image with alt text', () => {
    render(
      <BrowserRouter>
        <NavigationBar />
      </BrowserRouter>
    );
    const logo = screen.getByAltText(/TripTrek/i);
    expect(logo).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(
      <BrowserRouter>
        <NavigationBar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Trips/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });
});

describe('NavigationBar', () => {
  it('renders navigation bar', () => {
    render(<NavigationBar />);
    // Your test assertions here
  });
});
