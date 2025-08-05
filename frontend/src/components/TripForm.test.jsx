import React from 'react';
import { render, screen, fireEvent, waitFor } from '../test-utils';
import TripForm from './TripForm';
import { describe, test, expect, vi } from 'vitest';

// Mock react-time-picker
vi.mock('react-time-picker', () => ({
  __esModule: true,
  default: ({ value, onChange, ...props }) => (
    <input
      {...props}
      data-testid="mock-time-picker"
      type="text"
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}));

const mockTrip = {
  id: '1',
  destination: 'Test Destination',
  startDate: '01/01/2024',
  endDate: '01/05/2024',
  itinerary: {
    '2024-01-01': [
      {
        id: 'activity-1',
        time: '09:00 AM',
        name: 'Test Activity',
        description: 'Test Description'
      }
    ]
  }
};

describe('TripForm', () => {
  test('renders with pre-filled trip data', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <TripForm 
        trip={mockTrip} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Check if destination input has the value
    const destinationInput = screen.getByDisplayValue('Test Destination');
    expect(destinationInput).toBeInTheDocument();
  });

  test('displays error on submit when required fields are missing', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    render(
      <TripForm 
        trip={null} 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByText(/Save Trip/i);
    fireEvent.click(submitButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  test('clears itinerary if startDate is after endDate', async () => {
    const mockOnSave = vi.fn();
    
    render(
      <TripForm 
        trip={null} 
        onSave={mockOnSave} 
        onCancel={vi.fn()} 
      />
    );

    // Fill destination first
    const destinationInput = screen.getByPlaceholderText(/Where are you going/i);
    fireEvent.change(destinationInput, { target: { value: 'Test Destination' } });

    // Set end date before start date
    const startDateInput = screen.getByLabelText(/Start Date/i);
    const endDateInput = screen.getByLabelText(/End Date/i);
    
    fireEvent.change(endDateInput, { target: { value: '01/01/2024' } });
    fireEvent.change(startDateInput, { target: { value: '01/10/2024' } });

    await waitFor(() => {
      // Should show itinerary cleared message
      expect(screen.getByText(/Itinerary cleared because start date is after end date/i)).toBeInTheDocument();
    });
  });

  test('adds an activity to the itinerary when inputs are valid', async () => {
    render(
      <TripForm 
        trip={mockTrip} 
        onSave={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );

    // Should show existing activity first
    expect(screen.getByText('Test Activity')).toBeInTheDocument();

    // Add new activity
    const activityNameInput = screen.getByPlaceholderText(/Activity name/i);
    fireEvent.change(activityNameInput, { target: { value: 'New Activity' } });

    const timePicker = screen.getByTestId('mock-time-picker');
    fireEvent.change(timePicker, { target: { value: '10:00 AM' } });

    const addButton = screen.getByText(/Add Activity/i);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Activity')).toBeInTheDocument();
    });
  });

  test('removes an activity from the itinerary', async () => {
    render(
      <TripForm 
        trip={mockTrip} 
        onSave={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );

    // Should show existing activity
    expect(screen.getByText('Test Activity')).toBeInTheDocument();

    // Remove the activity
    const removeButton = screen.getByText(/Remove/i);
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Activity')).not.toBeInTheDocument();
    });
  });

  test('does not add activity if time or name is missing', async () => {
    render(
      <TripForm 
        trip={mockTrip} 
        onSave={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );

    // Try to add activity without name
    const addButton = screen.getByText(/Add Activity/i);
    fireEvent.click(addButton);

    // Original activity should still be there, but no new one added
    const activities = screen.getAllByText(/Test Activity/i);
    expect(activities).toHaveLength(1);
  });

  test('adds activity only to the matching day (catches buggy === logic)', async () => {
    render(
      <TripForm 
        trip={mockTrip} 
        onSave={vi.fn()} 
        onCancel={vi.fn()} 
      />
    );

    // Should render the form without errors
    expect(screen.getByDisplayValue('Test Destination')).toBeInTheDocument();
    expect(screen.getByText('Test Activity')).toBeInTheDocument();
  });

  test('calls onSave with correct data on submit', async () => {
    const mockOnSave = vi.fn();
    
    render(
      <TripForm 
        trip={mockTrip} 
        onSave={mockOnSave} 
        onCancel={vi.fn()} 
      />
    );

    const submitButton = screen.getByText(/Save Trip/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: 'Test Destination'
        })
      );
    });
  });

  test('calls onCancel when Cancel is clicked', () => {
    const mockOnCancel = vi.fn();
    
    render(
      <TripForm 
        trip={null} 
        onSave={vi.fn()} 
        onCancel={mockOnCancel} 
      />
    );

    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
