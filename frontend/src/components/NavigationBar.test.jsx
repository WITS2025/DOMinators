import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, beforeEach, test, expect, vi, it } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import NavigationBar from './NavigationBar';

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
  it('renders navigation links', () => {
    render(
      <BrowserRouter>
        <NavigationBar />
      </BrowserRouter>
    );

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText(/home/i)).toBeInTheDocument();
    expect(screen.getByText(/trips/i)).toBeInTheDocument();
  });
});
