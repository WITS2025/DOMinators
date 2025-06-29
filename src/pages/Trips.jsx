// src/pages/Trips.jsx
import { useState } from 'react'
import TripForm from '../components/trips/TripForm'
import TripList from '../components/trips/TripList'
import { format, eachDayOfInterval, parse } from 'date-fns'

export default function Trips() {
  const [trips, setTrips] = useState([
    {
      id: 1,
      destination: 'Venice',
      startDate: '07/01/2025',
      endDate:   '07/02/2025',
      itinerary: [
        {
          date: '07/01/2025',
          events: [
            { time: '10:00 AM', name: 'Gondola Ride' },
            { time: '2:00 PM', name: 'Piazza San Marco' }
          ]
        },
        {
          date: '07/02/2025',
          events: [
            { time: '9:00 AM', name: 'Doge’s Palace' },
            { time: '12:00 PM', name: 'Murano Glass Tour' }
          ]
        }
      ]
    },
    {
      id: 2,
      destination: 'Reykjavík',
      startDate: '07/10/2025',
      endDate:   '07/11/2025',
      itinerary: [
        {
          date: '07/10/2025',
          events: [
            { time: '11:00 AM', name: 'Blue Lagoon' },
            { time: '3:00 PM',  name: 'Sun Voyager Sculpture' }
          ]
        },
        {
          date: '07/11/2025',
          events: [
            { time: '8:00 AM',  name: 'Golden Circle Tour' },
            { time: '1:00 PM',  name: 'Perlan Museum' }
          ]
        }
      ]
    }
  ])

  const [selectedTrip, setSelectedTrip] = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)

  // DELETE
  const handleDelete = (id) => {
    setTrips(trips.filter(t => t.id !== id))
    setSelectedTrip(null)
  }

  // helper to parse MM/DD/YYYY → Date
  const parseMDY = str => parse(str, 'MM/dd/yyyy', new Date())

  // helper to convert 12h → 24h HH:mm
  const convertTo24Hour = timeStr => {
    const [time, mod] = timeStr.split(' ')
    let [h, m] = time.split(':')
    if (mod === 'PM' && h !== '12') h = String(+h + 12)
    if (mod === 'AM' && h === '12') h = '00'
    return `${h.padStart(2, '0')}:${m}`
  }

  // SAVE (new or edit)
  const handleSave = trip => {
    // regenerate the complete itinerary with every date from start → end
    const days = eachDayOfInterval({
      start: parseMDY(trip.startDate),
      end:   parseMDY(trip.endDate)
    })

    const itinerary = days.map(date => {
      const dateStr = format(date, 'MM/dd/yyyy')
      // find any existing events for that day
      const dayEvents =
        trip.itinerary.find(d => d.date === dateStr)?.events || []

      // sort events by time ascending
      const sortedEvents = [...dayEvents].sort((a, b) => {
        const a24 = convertTo24Hour(a.time)
        const b24 = convertTo24Hour(b.time)
        return a24.localeCompare(b24)
      })

      return { date: dateStr, events: sortedEvents }
    })

    const finalTrip = { ...trip, itinerary }

    if (trip.id) {
      // update existing
      setTrips(trips.map(t => (t.id === trip.id ? finalTrip : t)))
    } else {
      // new trip
      finalTrip.id = Date.now()
      setTrips([...trips, finalTrip])
    }

    setEditingTrip(null)
    setSelectedTrip(null)
  }

  return (
    <div className="container bg-light-sand py-5 text-slate-gray">
      <h2 className="mb-4 text-forest-green">
        {selectedTrip && !editingTrip ? 'Itinerary' : 'Destinations'}
      </h2>

      {!selectedTrip && !editingTrip && (
        <>
          <button
            className="btn btn-terra mb-4"
            onClick={() =>
              setEditingTrip({
                destination: '',
                startDate: '',
                endDate: '',
                itinerary: []
              })
            }
          >
            + New Trip
          </button>

          <div className="mx-auto" style={{ maxWidth: '500px' }}>
            <TripList
              trips={trips}
              onSelect={setSelectedTrip}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {editingTrip && (
        <TripForm
          trip={editingTrip}
          onSave={handleSave}
          onCancel={() => setEditingTrip(null)}
        />
      )}

      {selectedTrip && !editingTrip && (
        <div>
          <button
            className="btn btn-secondary mb-3 me-2"
            onClick={() => setSelectedTrip(null)}
          >
            &larr; Back
          </button>
          <button
            className="btn btn-terra mb-3 me-2"
            onClick={() => setEditingTrip(selectedTrip)}
          >
            Edit
          </button>

          <h4 className="text-forest-green mb-3">
            {selectedTrip.destination} — {selectedTrip.startDate} to{' '}
            {selectedTrip.endDate}
          </h4>

          {selectedTrip.itinerary.map((dayPlan, idx) => (
            <div
              key={idx}
              className="mb-4 p-4 bg-white-custom rounded shadow-sm"
            >
              <h5 className="text-forest-green">{dayPlan.date}</h5>
              {dayPlan.events.length > 0 && (
                <ul className="list-unstyled">
                  {dayPlan.events.map((ev, i) => (
                    <li key={i} className="d-flex mb-1">
                      <div
                        className="me-3 text-end"
                        style={{ width: '80px' }}
                      >
                        <strong>{ev.time}</strong>
                      </div>
                      <div>{ev.name}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}