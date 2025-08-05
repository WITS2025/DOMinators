// Create a new file: src/test-utils.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext
const mockUser = {
  userId: 'test-user-id-123',
  username: 'testuser',
  signInDetails: { loginId: 'testuser' },
  attributes: {
    email: 'test@example.com'
  }
};

const mockAuthContext = {
  user: mockUser,
  signOut: vi.fn()
};

// Mock TripContext with proper functions
const mockTripContext = {
  trips: [
    {
      id: 'test-trip-id',
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
    }
  ],
  loading: false,
  fetchTrips: vi.fn(),
  saveTrip: vi.fn(),
  deleteTrip: vi.fn(),
  getTripById: vi.fn((id) => {
    if (id === 'test-trip-id') {
      return mockTripContext.trips[0];
    }
    return undefined;
  })
};

// Global mocks
vi.mock('./context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('./context/TripContext', () => ({
  useTripContext: () => mockTripContext,
  TripProvider: ({ children }) => <div>{children}</div>
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: 'test-trip-id' }),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test' })
  };
});

// Mock date-fns to prevent conversion errors
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (typeof date === 'string') return date;
    return '2024-01-01';
  }),
  eachDayOfInterval: vi.fn(() => [new Date('2024-01-01'), new Date('2024-01-02')]),
  parse: vi.fn((dateStr, formatStr, baseDate) => {
    if (!dateStr) return new Date('2024-01-01');
    return new Date(dateStr.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2'));
  })
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123'
}));

// Custom render function
const customRender = (ui, options = {}) => {
  const { wrapper: Wrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  ), ...renderOptions } = options;

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
export { mockTripContext, mockAuthContext };