import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock fetch globally
global.fetch = vi.fn();

// Setup default fetch responses with new table structure
beforeEach(() => {
  fetch.mockClear();
  fetch.mockImplementation((url, options) => {
    console.log('Mock fetch called with:', url, options);
    
    // Mock getTripList endpoint (uses userId as PK)
    if (url.includes('getTripList')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          trips: [
            {
              userId: 'test-user-id-123',
              id: 'test-trip-id', // This matches the useParams mock
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
          ]
        })
      });
    }
    
    // Mock createTrip endpoint
    if (url.includes('createTrip')) {
      const body = options?.body ? JSON.parse(options.body) : {};
      return Promise.resolve({
        ok: true,
        json: async () => ({
          message: 'Trip created successfully',
          trip: {
            userId: 'test-user-id-123',
            id: body.id || 'new-trip-id',
            ...body
          }
        })
      });
    }
    
    // Mock updateTrip endpoint
    if (url.includes('updateTrip')) {
      const body = options?.body ? JSON.parse(options.body) : {};
      return Promise.resolve({
        ok: true,
        json: async () => ({
          message: 'Trip updated successfully',
          trip: {
            userId: 'test-user-id-123',
            ...body
          }
        })
      });
    }
    
    // Mock deleteTrip endpoint (expects userId and tripId)
    if (url.includes('deleteTrip')) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          message: 'Trip deleted successfully'
        })
      });
    }
    
    // Default fallback
    return Promise.resolve({
      ok: true,
      json: async () => ({ trips: [] })
    });
  });
});

// Mock TripContext globally with proper data
vi.mock('./context/TripContext', () => {
  const mockTripData = {
    userId: 'test-user-id-123',
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
  };

  return {
    useTripContext: () => ({
      trips: [mockTripData],
      loading: false,
      fetchTrips: vi.fn(),
      saveTrip: vi.fn(),
      deleteTrip: vi.fn(),
      getTripById: vi.fn((id) => {
        console.log('getTripById called with:', id);
        if (id === 'test-trip-id') {
          return mockTripData;
        }
        return undefined;
      })
    }),
    TripProvider: ({ children }) => <div data-testid="trip-provider">{children}</div>
  };
});

// Mock AuthContext globally
vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      userId: 'test-user-id-123',
      username: 'testuser',
      signInDetails: { loginId: 'testuser' },
      attributes: {
        email: 'test@example.com'
      }
    },
    signOut: vi.fn()
  }),
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

// Mock react-router-dom globally
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useParams: () => ({ id: 'test-trip-id' }), // Make sure this matches the trip ID in mock data
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/test' }),
    BrowserRouter: ({ children }) => <div data-testid="router">{children}</div>,
    Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>
  };
});

// Mock date-fns to prevent conversion errors
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString().split('T')[0];
    return '2024-01-01';
  }),
  eachDayOfInterval: vi.fn(() => [
    new Date('2024-01-01'), 
    new Date('2024-01-02'),
    new Date('2024-01-03'),
    new Date('2024-01-04'),
    new Date('2024-01-05')
  ]),
  parse: vi.fn((dateStr, formatStr, baseDate) => {
    if (!dateStr) return new Date('2024-01-01');
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return new Date(parts[2], parts[0] - 1, parts[1]);
    }
    return new Date(dateStr);
  })
}));

// Mock UUID
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
}));

// Suppress console errors during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: Each child in a list should have a unique "key" prop'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

