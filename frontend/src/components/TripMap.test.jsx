// TripMap.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import TripMap from './TripMap';
import React from 'react';

vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ children }) => <div data-testid="api-provider">{children}</div>,
  Map: ({ style }) => <div data-testid="map" style={style} />,
  useMap: () => ({
    fitBounds: vi.fn(),
  }),
}));

const mockGeocodeResponse = {
  status: 'OK',
  results: [
    {
      geometry: {
        location: { lat: 40.7128, lng: -74.006 },
        viewport: {
          northeast: { lat: 40.9153, lng: -73.7004 },
          southwest: { lat: 40.496, lng: -74.2557 },
        },
      },
    },
  ],
};

describe('TripMap', () => {
  beforeEach(() => {
    // Mock global fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockGeocodeResponse),
      })
    );

    // ✅ Mock global `google.maps`
    global.google = {
      maps: {
        LatLng: vi.fn((lat, lng) => ({ lat, lng })),
        LatLngBounds: vi.fn(() => ({
          extend: vi.fn(),
        })),
      },
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state initially', () => {
    render(<TripMap destination="New York, NY" />);
    expect(screen.getByText(/Loading map for "New York, NY".../)).toBeInTheDocument();
  });

  it('renders map on successful geocode', async () => {
    render(<TripMap destination="New York, NY" />);

    await waitFor(() => {
      expect(screen.getByTestId('api-provider')).toBeInTheDocument();
      expect(screen.getByTestId('map')).toBeInTheDocument();
    });
  });

  it('renders error state on geocode failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 'ZERO_RESULTS' }),
      })
    );

    render(<TripMap destination="Invalid Place" />);

    await waitFor(() => {
      expect(screen.getByText(/Map error: Geocoding failed: ZERO_RESULTS/)).toBeInTheDocument();
    });
  });
});
