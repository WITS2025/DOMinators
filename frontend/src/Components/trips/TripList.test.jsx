import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, test } from 'vitest';
import TripList from './TripList';

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

    render(<TripList trips={mockTrips} onSelect={onSelect} onDelete={onDelete} />);

    // Check that both destinations are rendered
    expect(screen.getByText('Paris')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();

    // Simulate clicking on the first trip
    fireEvent.click(screen.getByText('Paris'));
    expect(onSelect).toHaveBeenCalledWith(mockTrips[0]);

    // Simulate clicking the delete button for the second trip
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith(mockTrips[1].id);
  });
});



describe('TripList', () => {
  const mockTrips = [
    {
      id: 1,
      destination: 'London',
      startDate: '2025-07-01',
      endDate: '2025-07-10',
    },
    {
      id: 2,
      destination: 'Berlin',
      startDate: '2025-08-15',
      endDate: '2025-08-22',
    },
  ];

  it('renders trips and handles select and delete actions', () => {
    const onSelect = vi.fn();
    const onDelete = vi.fn();

    render(<TripList trips={mockTrips} onSelect={onSelect} onDelete={onDelete} />);

    // Check that both destinations are rendered
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Berlin')).toBeInTheDocument();

    // Click on a trip
    fireEvent.click(screen.getByText('London'));
    expect(onSelect).toHaveBeenCalledWith(mockTrips[0]);

    // Click delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[1]);
    expect(onDelete).toHaveBeenCalledWith(mockTrips[1].id);
  });
});

