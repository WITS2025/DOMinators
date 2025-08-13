import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import TripForm from './TripForm';
import { vi } from 'vitest';

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock react-time-picker
vi.mock('react-time-picker', () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <input
      data-testid="mock-time-picker"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

// Mock CSS imports
vi.mock('react-time-picker/dist/TimePicker.css', () => ({}));
vi.mock('react-clock/dist/Clock.css', () => ({}));

// Mock image compression
vi.mock('browser-image-compression', () => ({
  __esModule: true,
  default: vi.fn().mockResolvedValue(new File([''], 'compressed.jpg', { type: 'image/jpeg' })),
}));

// Mock the AuthContext
const mockUser = { userId: 'test-user-123' };
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock the TripContext
const mockUploadTripImage = vi.fn().mockResolvedValue('https://example.com/image.jpg');
vi.mock('../context/TripContext', () => ({
  useTripContext: () => ({
    uploadTripImage: mockUploadTripImage,
  }),
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with pre-filled trip data', () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
    
    expect(screen.getByDisplayValue('Paris')).toBeInTheDocument();
    expect(screen.getByText('07/20/2025')).toBeInTheDocument();
    expect(screen.getByText(/Museum Visit/)).toBeInTheDocument();
  });

  it('renders with empty trip object', () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    // Find destination input by placeholder or type
    const destinationInput = screen.getByRole('textbox');
    expect(destinationInput).toHaveValue('');
   
    // Find date inputs by type
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => input.type === 'date');
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];
   
    expect(startDateInput).toHaveValue('');
    expect(endDateInput).toHaveValue('');
  });

  it('displays error on submit when required fields are missing', async () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/Please fill in all fields/)).toBeInTheDocument();
    });
  });

  it('automatically generates itinerary days when dates are selected', async () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    // Find date inputs by type
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => input.type === 'date');
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];
   
    // Set start and end dates
    fireEvent.change(startDateInput, { target: { value: '2025-07-20' } });
    fireEvent.change(endDateInput, { target: { value: '2025-07-22' } });

    await waitFor(() => {
      expect(screen.getByText('07/20/2025')).toBeInTheDocument();
      expect(screen.getByText('07/21/2025')).toBeInTheDocument();
      expect(screen.getByText('07/22/2025')).toBeInTheDocument();
    });
  });

  it('clears itinerary if startDate is after endDate', async () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    // Find date inputs by type
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => input.type === 'date');
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];
   
    // Set end date before start date
    fireEvent.change(startDateInput, { target: { value: '2025-07-22' } });
    fireEvent.change(endDateInput, { target: { value: '2025-07-20' } });

    await waitFor(() => {
      expect(screen.queryByText('Itinerary')).not.toBeInTheDocument();
    });
  });

  it('preserves existing activities when dates change', async () => {
    const tripWithActivity = {
      destination: 'Rome',
      startDate: '07/20/2025',
      endDate: '07/21/2025',
      itinerary: [
        { date: '07/20/2025', activities: [{ time: '9:00 AM', name: 'Breakfast' }] },
        { date: '07/21/2025', activities: [] }
      ]
    };
   
    render(<TripForm trip={tripWithActivity} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    // Find date inputs by type and value
    const dateInputs = screen.getAllByDisplayValue(/.*/);
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];
   
    // Extend the trip by one day
    fireEvent.change(endDateInput, { target: { value: '2025-07-22' } });

    await waitFor(() => {
      // Original activity should still be there
      expect(screen.getByText(/Breakfast/)).toBeInTheDocument();
      // New day should be added
      expect(screen.getByText('07/22/2025')).toBeInTheDocument();
    });
  });

  it('adds an activity to the itinerary when inputs are valid', async () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    const timeInput = screen.getAllByTestId('mock-time-picker')[0];
    const activityInput = screen.getAllByPlaceholderText('Activity Description')[0];

    fireEvent.change(timeInput, { target: { value: '11:00' } });
    fireEvent.change(activityInput, { target: { value: 'Lunch' } });
    fireEvent.click(screen.getAllByText('+ Add Activity')[0]);

    await waitFor(() => {
      expect(screen.getByText(/11:00 AM — Lunch/)).toBeInTheDocument();
    });

    // Check that inputs are cleared after adding
    expect(timeInput.value).toBe('');
    expect(activityInput.value).toBe('');
  });

  it('sorts activities by time when added', async () => {
    const tripWithMultipleDays = {
      destination: 'Tokyo',
      startDate: '07/20/2025',
      endDate: '07/20/2025',
      itinerary: [
        { date: '07/20/2025', activities: [{ time: '2:00 PM', name: 'Lunch' }] }
      ]
    };

    render(<TripForm trip={tripWithMultipleDays} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    const timeInput = screen.getByTestId('mock-time-picker');
    const activityInput = screen.getByPlaceholderText('Activity Description');

    // Add an earlier activity
    fireEvent.change(timeInput, { target: { value: '09:00' } });
    fireEvent.change(activityInput, { target: { value: 'Breakfast' } });
    fireEvent.click(screen.getByText('+ Add Activity'));

    await waitFor(() => {
      const activities = screen.getAllByText(/AM|PM/);
      // Breakfast (9:00 AM) should appear before Lunch (2:00 PM)
      expect(activities[0]).toHaveTextContent('9:00 AM — Breakfast');
      expect(activities[1]).toHaveTextContent('2:00 PM — Lunch');
    });
  });

  it('removes an activity from the itinerary', async () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    
    await waitFor(() =>
      expect(screen.queryByText(/Museum Visit/)).not.toBeInTheDocument()
    );
  });

  it('does not add activity if time or name is missing', () => {
    render(<TripForm trip={mockTrip} onSave={vi.fn()} onCancel={vi.fn()} />);

    const addBtn = screen.getAllByText('+ Add Activity')[0];
    const timeInput = screen.getAllByTestId('mock-time-picker')[0];
    const nameInput = screen.getAllByPlaceholderText('Activity Description')[0];

    // Missing time
    fireEvent.change(nameInput, { target: { value: 'No time activity' } });
    fireEvent.click(addBtn);
    expect(screen.queryByText(/No time activity/)).not.toBeInTheDocument();

    // Reset input
    fireEvent.change(nameInput, { target: { value: '' } });

    // Missing name
    fireEvent.change(timeInput, { target: { value: '10:30' } });
    fireEvent.click(addBtn);
    expect(screen.queryByText(/10:30/)).not.toBeInTheDocument();
  });

  it('adds activity only to the matching day', async () => {
    const multiDayTrip = {
      destination: 'Rome',
      startDate: '07/20/2025',
      endDate: '07/21/2025',
      itinerary: [
        { date: '07/20/2025', activities: [] },
        { date: '07/21/2025', activities: [] },
      ],
    };

    render(<TripForm trip={multiDayTrip} onSave={vi.fn()} onCancel={vi.fn()} />);

    // Find the day sections
    const day1Section = screen.getByText('07/20/2025').closest('.border');
    const day2Section = screen.getByText('07/21/2025').closest('.border');

    // Add activity to second day only
    const timePickers = screen.getAllByTestId('mock-time-picker');
    const nameInputs = screen.getAllByPlaceholderText('Activity Description');
    const addButtons = screen.getAllByText('+ Add Activity');

    fireEvent.change(timePickers[1], { target: { value: '14:00' } });
    fireEvent.change(nameInputs[1], { target: { value: 'Forum Visit' } });
    fireEvent.click(addButtons[1]);

    await waitFor(() => {
      expect(screen.getByText(/Forum Visit/)).toBeInTheDocument();
    });

    // Verify activity is only in day 2
    const day1Activities = within(day1Section).queryAllByText(/Forum Visit/);
    const day2Activities = within(day2Section).queryAllByText(/Forum Visit/);

    expect(day1Activities.length).toBe(0);
    expect(day2Activities.length).toBe(1);
  });

  it('calls onSave with correct data including userId on submit', async () => {
    const onSave = vi.fn();
    render(<TripForm trip={mockTrip} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        destination: 'Paris',
        startDate: '07/20/2025',
        endDate: '07/21/2025',
        user: {
          userId: 'test-user-123'
        },
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
    
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('handles date format conversion correctly', () => {
    const tripWithDates = {
      destination: 'London',
      startDate: '12/25/2025',
      endDate: '12/31/2025',
      itinerary: []
    };

    render(<TripForm trip={tripWithDates} onSave={vi.fn()} onCancel={vi.fn()} />);

    // Check that dates are converted to ISO format for input fields
    const dateInputs = screen.getAllByDisplayValue(/.*/);
    const startDateInput = dateInputs.find(input => input.type === 'date');
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];
   
    expect(startDateInput).toHaveValue('2025-12-25');
    expect(endDateInput).toHaveValue('2025-12-31');
  });

  it('validates end date is not before start date in form', () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);
   
    // Find date inputs by type
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => input.type === 'date');
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];

    fireEvent.change(startDateInput, { target: { value: '2025-07-20' } });
   
    // End date input should have min attribute set to start date
    expect(endDateInput).toHaveAttribute('min', '2025-07-20');
  });

  it('handles image upload and compression', async () => {
    render(<TripForm trip={{}} onSave={vi.fn()} onCancel={vi.fn()} />);

    // Find file input by type since label association might not work
    const fileInput = screen.getByRole('textbox', { hidden: true }) || 
                     document.querySelector('input[type="file"]');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for image processing
    await waitFor(() => {
      expect(screen.getByAltText(/trip image/i)).toBeInTheDocument();
    });
  });

  it('calls uploadTripImage when saving with selected image file', async () => {
    const onSave = vi.fn();
    render(<TripForm trip={{}} onSave={onSave} onCancel={vi.fn()} />);

    // Fill required fields - find inputs by type/role
    const destinationInput = screen.getByRole('textbox');
    fireEvent.change(destinationInput, { target: { value: 'Test Destination' } });
    
    const dateInputs = screen.getAllByDisplayValue('');
    const startDateInput = dateInputs.find(input => input.type === 'date');
    const endDateInput = dateInputs.filter(input => input.type === 'date')[1];
    
    fireEvent.change(startDateInput, { target: { value: '2025-07-20' } });
    fireEvent.change(endDateInput, { target: { value: '2025-07-21' } });

    // Upload an image - find file input by type
    const fileInput = document.querySelector('input[type="file"]');
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUploadTripImage).toHaveBeenCalled();
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        imageUrl: 'https://example.com/image.jpg'
      }));
    });
  });
});