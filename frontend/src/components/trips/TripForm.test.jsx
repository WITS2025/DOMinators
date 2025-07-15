import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TripForm from './TripForm';
import { vi } from 'vitest';

// Mock react-time-picker
vi.mock('react-time-picker', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <input
      data-testid="mock-time-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const mockTrip = {
  destination: 'Paris',
  startDate: '07/20/2025',
  endDate: '07/21/2025',
  itinerary: [
    {
      date: '07/20/2025',
      activities: [{ time: '10:00 AM', name: 'Museum Visit' }],
    },
  ],
};

describe('TripForm', () => {
  it('renders with pre-filled trip data', () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByDisplayValue('Paris')).toBeInTheDocument();
    expect(screen.getByText('07/20/2025')).toBeInTheDocument();
    expect(screen.getByText(/Museum Visit/)).toBeInTheDocument();
  });

  it('displays error on submit when required fields are missing', () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText(/Save/));
    expect(screen.getByText(/Please fill in all fields/)).toBeInTheDocument();
  });

  it('adds an activity to the itinerary when inputs are valid', async () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
    const timeInput = screen.getByTestId('mock-time-picker');
    const activityInput = screen.getByPlaceholderText('Activity Description');

    fireEvent.change(timeInput, { target: { value: '11:00' } });
    fireEvent.change(activityInput, { target: { value: 'Lunch' } });

    fireEvent.click(screen.getByText('+ Add Activity'));

    await waitFor(() =>
      expect(screen.getByText(/Lunch/)).toBeInTheDocument()
    );
  });

  it('removes an activity from the itinerary', async () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByText('Remove'));
    await waitFor(() =>
      expect(screen.queryByText(/Museum Visit/)).not.toBeInTheDocument()
    );
  });

  it('calls onSave with correct data on submit', async () => {
    const onSave = vi.fn();
    render(<TripForm trip={mockTrip} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByText(/Save/));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        destination: 'Paris',
        startDate: '07/20/2025',
        endDate: '07/21/2025',
        itinerary: expect.arrayContaining([
          expect.objectContaining({
            date: '07/20/2025',
            activities: expect.arrayContaining([
              expect.objectContaining({
                time: '10:00 AM',
                name: 'Museum Visit',
              }),
            ]),
          }),
        ]),
      }))
    );
  });

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn();
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText(/Cancel/));
    expect(onCancel).toHaveBeenCalled();
  });
});
