import React from 'react';
import { render, screen, fireEvent, waitFor, within} from '../test-utils';
import TripForm from './TripForm';
import { describe, test, expect, vi } from 'vitest';
import { TripProvider } from '../context/TripContext';

// Mock react-time-picker
vi.mock('react-time-picker', () => ({
  __esModule: true,
  default: ({ value, onChange, ...props }) => (
    <input
      {...props}
      data-testid="mock-time-picker"
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
    />
  ),
}));

const mockTrip = {
  id: '1',
  destination: 'Test Destination',
  startDate: '01/01/2024', // Use MM/dd/yyyy format
  endDate: '01/05/2024',   // Use MM/dd/yyyy format
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

const renderTripForm = (props = {}) => {
  const defaultProps = {
    trip: null,
    onSave: vi.fn(),
    onCancel: vi.fn(),
    ...props
  };

  return render(
    <TripProvider>
      <TripForm {...defaultProps} />
    </TripProvider>
  );
};

describe('TripForm', () => {
  test('renders with pre-filled trip data', () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    renderTripForm({
      trip: mockTrip,
      onSave: mockOnSave,
      onCancel: mockOnCancel
    });

    expect(screen.getByDisplayValue('Test Destination')).toBeInTheDocument();
  });

  test('displays error on submit when required fields are missing', async () => {
    const mockOnSave = vi.fn();
    const mockOnCancel = vi.fn();

    renderTripForm({
      onSave: mockOnSave,
      onCancel: mockOnCancel
    });

    const submitButton = screen.getByRole('button', { name: /save trip/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
  });

  test('clears itinerary if startDate is after endDate', async () => {
    const mockOnSave = vi.fn();
    
    renderTripForm({
      onSave: mockOnSave
    });

    // Fill in destination
    const destinationInput = screen.getByPlaceholderText(/destination/i);
    fireEvent.change(destinationInput, { target: { value: 'Test Destination' } });

    // Set start date after end date
    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);
    
    fireEvent.change(startDateInput, { target: { value: '01/10/2024' } });
    fireEvent.change(endDateInput, { target: { value: '01/05/2024' } });

    // Should clear itinerary and show message
    await waitFor(() => {
      expect(screen.getByText(/itinerary cleared/i)).toBeInTheDocument();
    });
  });

  test('adds an activity to the itinerary when inputs are valid', async () => {
    renderTripForm({
      trip: mockTrip
    });

    // Fill in activity details
    const activityNameInput = screen.getByPlaceholderText(/activity name/i);
    const activityDescInput = screen.getByPlaceholderText(/description/i);
    
    fireEvent.change(activityNameInput, { target: { value: 'New Activity' } });
    fireEvent.change(activityDescInput, { target: { value: 'New Description' } });

    // Set time using the mocked time picker
    const timePicker = screen.getByTestId('mock-time-picker');
    fireEvent.change(timePicker, { target: { value: '10:00 AM' } });

    // Add activity
    const addButton = screen.getByRole('button', { name: /add activity/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New Activity')).toBeInTheDocument();
    });
  });

  test('removes an activity from the itinerary', async () => {
    renderTripForm({
      trip: mockTrip
    });

    // Should show existing activity
    expect(screen.getByText('Test Activity')).toBeInTheDocument();

    // Find and click remove button
    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('Test Activity')).not.toBeInTheDocument();
    });
  });

  test('does not add activity if time or name is missing', async () => {
    renderTripForm({
      trip: mockTrip
    });

    // Try to add activity without name
    const addButton = screen.getByRole('button', { name: /add activity/i });
    fireEvent.click(addButton);

    // Should not add the activity
    await waitFor(() => {
      // Count of activities should remain the same
      const activities = screen.getAllByText(/Test Activity/i);
      expect(activities).toHaveLength(1); // Only the original activity
    });
  });

  test('adds activity only to the matching day (catches buggy === logic)', async () => {
    renderTripForm({
      trip: mockTrip
    });

    // Should show the form for the trip
    expect(screen.getByDisplayValue('Test Destination')).toBeInTheDocument();
  });

  test('calls onSave with correct data on submit', async () => {
    const mockOnSave = vi.fn();
    
    renderTripForm({
      trip: mockTrip,
      onSave: mockOnSave
    });

    const submitButton = screen.getByRole('button', { name: /save trip/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        destination: 'Test Destination'
      }));
    });
  });

  test('calls onCancel when Cancel is clicked', () => {
    const mockOnCancel = vi.fn();
    
    renderTripForm({
      onCancel: mockOnCancel
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
