import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Trips from './Trips'
import { TripProvider } from '../context/TripContext'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch globally before all tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]), // default empty trip list
  })
)

// Helper function to render component with all required providers
const renderWithProviders = (component) => {
  return render(
    <MemoryRouter>
      <TripProvider>
        {component}
      </TripProvider>
    </MemoryRouter>
  );
};

describe('Trips Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Destinations header', async () => {
    renderWithProviders(<Trips />)
    expect(await screen.findByText(/Destinations/i)).toBeInTheDocument()
  })

  it('shows New Trip button', async () => {
    renderWithProviders(<Trips />)
    expect(await screen.findByRole('button', { name: /\+ New Trip/i })).toBeInTheDocument()
  })

  it('shows loading spinner when loading', async () => {
    // simulate a slow fetch
    fetch.mockImplementationOnce(() =>
      new Promise(resolve =>
        setTimeout(() =>
          resolve({
            ok: true,
            json: () => Promise.resolve([]),
          }),
          100
        )
      )
    )
    renderWithProviders(<Trips />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a trip in the list when API returns data', async () => {
    // mock fetch to return 1 trip with minimal data
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              pk: 'trip123',
              destination: 'Paris',
              startDate: '07/20/2025',
              endDate: '07/25/2025',
              itinerary: [],
            },
          ]),
      })
    )

    renderWithProviders(<Trips />)

    // Wait for the trip destination to appear on screen
    expect(await screen.findByText(/Paris/i)).toBeInTheDocument()
  })
})