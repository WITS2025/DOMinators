import React from 'react';
import { render, screen } from '../test-utils'; // Use our custom test utils
import { describe, test, expect, vi } from 'vitest';
import NavigationBar from './NavigationBar';

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

  test('renders navigation bar', () => {
    render(<NavigationBar />);
    
    // Should render without throwing errors
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
  });
});
