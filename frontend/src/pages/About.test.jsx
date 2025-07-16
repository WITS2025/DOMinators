import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import About from './About'; // Adjust the path if needed

describe('About component', () => {
  it('renders the main heading', () => {
    render(<About />);
    expect(screen.getByRole('heading', { name: /about triptrek/i })).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<About />);
    expect(
      screen.getByText(/welcome to triptrek! we want you to be able to plan your trip/i)
    ).toBeInTheDocument();
  });

  it('renders the question about planning', () => {
    render(<About />);
    expect(
      screen.getByText(/ever wish your trip was perfectly planned/i)
    ).toBeInTheDocument();
  });

  it('renders the question about debates', () => {
    render(<About />);
    expect(
      screen.getByText(/want to skip the endless debates/i)
    ).toBeInTheDocument();
  });

  it('renders the paragraph about TripTrek features', () => {
    render(<About />);
    expect(
      screen.getByText(/with triptrek, you can build your itinerary/i)
    ).toBeInTheDocument();
  });

  it('renders the closing motivational message', () => {
    render(<About />);
    expect(
      screen.getByText(/let’s make trip planning part of the fun/i)
    ).toBeInTheDocument();
  });
});
