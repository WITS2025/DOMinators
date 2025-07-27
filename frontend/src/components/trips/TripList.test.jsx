import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, test } from 'vitest';
import TripList from './TripList';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to render component with Router
const renderWithRouter = (component) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

beforeEach(() => {
  mockNavigate.mockClear();
});

describe('TripList', () => {
  const mockTrips = [
    {
      id: 1,
      destination: 'Paris',
      startDate: '2025-08-01',
      endDate: '2025-08-10',
    },
    {
      id: 2,
      destination: 'Tokyo',
      startDate: '2025-09-15',
      endDate: '2025-09-25',
    },
  ];

  it('renders all trips and handles interactions', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    renderWithRouter(<TripList trips={mockTrips} onSelect={onSelect} onDelete={onDelete} />);

    // Check that both destinations are rendered
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    // Test navigation when clicking on trip
    fireEvent.click(screen.getByText('Paris'));
    expect(mockNavigate).toHaveBeenCalledWith('/trips/1');

    // Test delete functionality
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith(mockTrips[1].id);
  });

  it('renders trips and handles select and delete actions', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    renderWithRouter(<TripList trips={mockTrips} onSelect={onSelect} onDelete={onDelete} />);

    // Check that both destinations are rendered
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    // Test navigation when clicking on Tokyo
    fireEvent.click(screen.getByText('Tokyo'));
    expect(mockNavigate).toHaveBeenCalledWith('/trips/2');

    // Test delete functionality
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    expect(onDelete).toHaveBeenCalledWith(mockTrips[0].id);
  });

  it('shows empty state when no trips', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    renderWithRouter(<TripList trips={[]} onSelect={onSelect} onDelete={onDelete} />);

    expect(screen.getByText('No trips planned yet. Start trekking!')).toBeInTheDocument();
  });
});