import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import NavigationBar from './NavigationBar';

describe('NavigationBar', () => {
  test('renders without crashing', () => {
    render(<NavigationBar />);
    expect(document.body).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(<NavigationBar />);
    
    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Trips/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Us/i)).toBeInTheDocument();
  });

  test('renders logo image with alt text', () => {
    render(<NavigationBar />);
    const logo = screen.getByAltText(/TripTrek/i);
    expect(logo).toBeInTheDocument();
  });
});
