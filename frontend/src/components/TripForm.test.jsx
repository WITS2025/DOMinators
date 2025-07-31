import { render, screen, fireEvent, waitFor, within} from '@testing-library/react';
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

  it('clears itinerary if startDate is after endDate', () => {
    render(<TripForm trip={{ startDate: '07/21/2025', endDate: '07/20/2025' }} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByText('Itinerary')).not.toBeInTheDocument();
  });

  it('adds an activity to the itinerary when inputs are valid', async () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
    const timeInput = screen.getAllByTestId('mock-time-picker')[0];
    const activityInput = screen.getAllByPlaceholderText('Activity Description')[0];

    fireEvent.change(timeInput, { target: { value: '11:00' } });
    fireEvent.change(activityInput, { target: { value: 'Lunch' } });

    fireEvent.click(screen.getAllByText('+ Add Activity')[0]);

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

  it('does not add activity if time or name is missing', () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);

    const addBtn = screen.getAllByText('+ Add Activity')[0];

    // Missing time
    fireEvent.change(screen.getAllByPlaceholderText('Activity Description')[0], {
      target: { value: 'No time' },
    });
    fireEvent.click(addBtn);
    expect(screen.queryByText(/No time/)).not.toBeInTheDocument();

    // Reset input
    fireEvent.change(screen.getAllByPlaceholderText('Activity Description')[0], {
      target: { value: '' },
    });

    // Missing name
    fireEvent.change(screen.getAllByTestId('mock-time-picker')[0], {
      target: { value: '10:30' },
    });
    fireEvent.click(addBtn);
    expect(screen.queryByText(/10:30/)).not.toBeInTheDocument();
  });

  it('adds activity only to the matching day (catches buggy === logic)', async () => {
    const emptyTrip = {
      destination: 'Rome',
      startDate: '07/20/2025',
      endDate: '07/21/2025',
      itinerary: [
        { date: '07/20/2025', activities: [] },
        { date: '07/21/2025', activities: [] },
      ],
    };

    render(<TripForm trip={emptyTrip} onSave={vi.fn()} onCancel={vi.fn()} />);

    const dayLabels = screen.getAllByText(/07\/2[01]\/2025/); // Ensure 2 dates are rendered
    expect(dayLabels).toHaveLength(2);

    // Add activity to second day
    const timePickers = screen.getAllByTestId('mock-time-picker');
    const nameInputs = screen.getAllByPlaceholderText('Activity Description');
    const addButtons = screen.getAllByText('+ Add Activity');

    fireEvent.change(timePickers[1], { target: { value: '14:00' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Forum Visit' } });
    fireEvent.click(addButtons[1]);

    // Wait for activity to show up
    await waitFor(() =>
      expect(screen.getByText((content) => content.includes('Forum Visit'))).toBeInTheDocument()
    );

    // Confirm activity is only in the second section
    const allItinerarySections = screen.getAllByText(/07\/2[01]\/2025/).map(label =>
      label.closest('.border') // or whatever class wraps the day's section
    );

    // Count activities inside each day section
    const day1Activities = within(allItinerarySections[0]).queryAllByText(/Forum Visit/);
    const day2Activities = within(allItinerarySections[1]).queryAllByText(/Forum Visit/);

    expect(day1Activities.length).toBe(0); // Should not be in day 1
    expect(day2Activities.length).toBe(1); // Should be in day 2
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
