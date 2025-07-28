// src/context/__tests__/TripContext.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { TripProvider, useTripContext } from './TripContext'

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MM/dd/yyyy') {
      return '01/01/2024'
    }
    return '2024-01-01'
  }),
  eachDayOfInterval: vi.fn(() => [new Date('2024-01-01'), new Date('2024-01-02')]),
  parse: vi.fn(() => new Date('2024-01-01'))
}))

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-123')
}))

// Mock console methods to avoid noise in tests
let consoleSpy

// Mock alert
global.alert = vi.fn()

const mockTripsResponse = [
  {
    pk: 'trip-1',
    destination: 'Paris',
    startDate: '01/01/2024',
    endDate: '01/03/2024',
    itinerary: [
      {
        date: '01/01/2024',
        activities: [
          { name: 'Visit Eiffel Tower', time: '2:00 PM' },
          { name: 'Breakfast', time: '9:00 AM' }
        ]
      }
    ]
  },
  {
    pk: 'trip-2',
    destination: 'Tokyo',
    startDate: '02/01/2024',
    endDate: '02/05/2024',
    itinerary: []
  }
]

const renderTripContext = () => {
  return renderHook(() => useTripContext(), {
    wrapper: ({ children }) => <TripProvider>{children}</TripProvider>
  })
}

describe('TripContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock console methods to suppress logs during tests
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      log: vi.spyOn(console, 'log').mockImplementation(() => {})
    }
    // Reset fetch mock to default successful response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTripsResponse),
      status: 200,
      statusText: 'OK'
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
    if (consoleSpy) {
      consoleSpy.error.mockRestore()
      consoleSpy.log.mockRestore()
    }
  })

  describe('useTripContext', () => {
    it('should throw error when used outside TripProvider', () => {
      // Suppress console errors for this test
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        renderHook(() => useTripContext())
      }).toThrow('useTripContext must be used within a TripProvider')
      
      errorSpy.mockRestore()
    })
  })

  describe('TripProvider', () => {
    it('should provide initial context values', async () => {
      const { result } = renderTripContext()
      
      // Initially loading should be true as fetchTrips is called on mount
      expect(result.current.loading).toBe(true)
      expect(result.current.trips).toEqual([])
      expect(typeof result.current.fetchTrips).toBe('function')
      expect(typeof result.current.deleteTrip).toBe('function')
      expect(typeof result.current.saveTrip).toBe('function')
      expect(typeof result.current.getTripById).toBe('function')
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('should fetch trips on mount', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/getTripList',
        { method: 'GET' }
      )

      expect(result.current.trips[0]).toEqual({
        ...mockTripsResponse[0],
        id: 'trip-1',
        itinerary: [
          {
            date: '01/01/2024',
            activities: [
              { name: 'Breakfast', time: '9:00 AM' },
              { name: 'Visit Eiffel Tower', time: '2:00 PM' }
            ]
          }
        ]
      })
    })

    it('should handle fetch error gracefully', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))
      
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })

      // Should still have empty trips array after error
      expect(result.current.trips).toEqual([])
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/getTripList',
        { method: 'GET' }
      )
    })

    it('should handle fetch response error gracefully', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      }, { timeout: 3000 })

      // Should still have empty trips array after error
      expect(result.current.trips).toEqual([])
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/getTripList',
        { method: 'GET' }
      )
    })
  })

  describe('deleteTrip', () => {
    it('should delete trip successfully', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK'
      })

      await act(async () => {
        await result.current.deleteTrip('trip-1')
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/deleteTrip?tripId=trip-1',
        { method: 'DELETE' }
      )
    })

    it('should handle delete error gracefully', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      // Now mock the delete request to fail
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await act(async () => {
        await result.current.deleteTrip('trip-1')
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/deleteTrip?tripId=trip-1',
        { method: 'DELETE' }
      )
      expect(global.alert).toHaveBeenCalledWith('Failed to delete trip. Please try again.')
    })
  })

  describe('saveTrip', () => {
    it('should create new trip', async () => {
      const { result } = renderTripContext()
      
      const newTrip = {
        destination: 'London',
        startDate: '03/01/2024',
        endDate: '03/03/2024',
        itinerary: []
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      await act(async () => {
        await result.current.saveTrip(newTrip)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/createTrip',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...newTrip,
            id: 'mock-uuid-123',
            itinerary: [
              { date: '01/01/2024', activities: [] },
              { date: '01/01/2024', activities: [] }
            ]
          })
        }
      )

      expect(global.alert).toHaveBeenCalledWith('Trip created successfully!')
    })

    it('should update existing trip', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      const updatedTrip = {
        ...result.current.trips[0],
        destination: 'Updated Paris'
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      await act(async () => {
        await result.current.saveTrip(updatedTrip)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/updateTrip?tripId=trip-1',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attributeName: 'destination',
            newValue: 'Updated Paris'
          })
        }
      )
    })

    it('should handle create trip error gracefully', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      const newTrip = {
        destination: 'London',
        startDate: '03/01/2024',
        endDate: '03/03/2024',
        itinerary: []
      }

      // Mock the create trip request to fail
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      await act(async () => {
        await result.current.saveTrip(newTrip)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/createTrip',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
      )
      expect(global.alert).toHaveBeenCalledWith('Failed to create trip.')
    })

    it('should handle update trip API error gracefully', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      const updatedTrip = {
        ...result.current.trips[0],
        destination: 'Updated Paris'
      }

      // Mock the update trip request to fail
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server Error')
      })

      await act(async () => {
        await result.current.saveTrip(updatedTrip)
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('updateTrip?tripId=trip-1'),
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' }
        })
      )
    })
  })

  describe('getTripById', () => {
    it('should return trip by id', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      const trip = result.current.getTripById('trip-1')
      expect(trip).toBeDefined()
      expect(trip.id).toBe('trip-1')
      expect(trip.destination).toBe('Paris')
    })

    it('should return undefined for non-existent id', async () => {
      const { result } = renderTripContext()

      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      const trip = result.current.getTripById('non-existent')
      expect(trip).toBeUndefined()
    })
  })

  describe('time conversion and sorting', () => {
    it('should sort activities by time when saving trip', async () => {
      const { result } = renderTripContext()

      const tripWithUnsortedTimes = {
        destination: 'Test City',
        startDate: '01/01/2024',
        endDate: '01/01/2024',
        itinerary: [{
          date: '01/01/2024',
          activities: [
            { name: 'Late Activity', time: '11:30 PM' },
            { name: 'Early Activity', time: '8:00 AM' },
            { name: 'Noon Activity', time: '12:00 PM' },
            { name: 'Midnight Activity', time: '12:00 AM' }
          ]
        }]
      }

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })

      await act(async () => {
        await result.current.saveTrip(tripWithUnsortedTimes)
      })

      // Verify the fetch was called with sorted activities
      const callArgs = global.fetch.mock.calls.find(call => 
        call[0].includes('createTrip')
      )
      expect(callArgs).toBeDefined()
      
      const requestBody = JSON.parse(callArgs[1].body)
      const activities = requestBody.itinerary[0].activities
      
      // Should be sorted: 12:00 AM, 8:00 AM, 12:00 PM, 11:30 PM
      expect(activities[0].name).toBe('Midnight Activity')
      expect(activities[1].name).toBe('Early Activity')
      expect(activities[2].name).toBe('Noon Activity')
      expect(activities[3].name).toBe('Late Activity')
    })
  })

  describe('fetchTrips integration', () => {
    it('should call fetchTrips on mount', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      
      renderTripContext()

      expect(fetchSpy).toHaveBeenCalledWith(
        'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/getTripList',
        { method: 'GET' }
      )
    })

    it('should refresh trips after successful delete', async () => {
      const { result } = renderTripContext()
      
      await waitFor(() => {
        expect(result.current.trips).toHaveLength(2)
      })

      // Mock successful delete, then successful refresh
      global.fetch
        .mockResolvedValueOnce({ ok: true, status: 200 }) // delete response
        .mockResolvedValueOnce({ // refresh response
          ok: true,
          json: () => Promise.resolve([mockTripsResponse[1]]) // only second trip remains
        })

      await act(async () => {
        await result.current.deleteTrip('trip-1')
      })

      // Should have called delete and then getTripList
      expect(global.fetch).toHaveBeenCalledTimes(3) // initial fetch + delete + refresh
    })

    it('should refresh trips after successful save', async () => {
      const { result } = renderTripContext()
      
      const newTrip = {
        destination: 'London',
        startDate: '03/01/2024',
        endDate: '03/03/2024',
        itinerary: []
      }

      // Mock successful create, then successful refresh
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ success: true }) }) // create response
        .mockResolvedValueOnce({ // refresh response
          ok: true,
          json: () => Promise.resolve([...mockTripsResponse, { pk: 'trip-3', ...newTrip }])
        })

      await act(async () => {
        await result.current.saveTrip(newTrip)
      })

      // Should have called create and then getTripList
      expect(global.fetch).toHaveBeenCalledTimes(3) // initial fetch + create + refresh
    })
  })
})