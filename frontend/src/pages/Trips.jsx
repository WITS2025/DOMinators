/*import { useState, useEffect } from 'react'
import TripForm from '../components/trips/TripForm'
import TripList from '../components/trips/TripList'
import { format, eachDayOfInterval, parse } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

export default function Trips() {
  const API_Endpoint = 'https://3b82f55n6d.execute-api.us-east-1.amazonaws.com/'
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)

  const parseMDY = (str) => parse(str, 'MM/dd/yyyy', new Date())

  const convertTo24Hour = timeStr => {
    const [time, mod] = timeStr.split(' ')
    let [h, m] = time.split(':')
    if (mod === 'PM' && h !== '12') h = String(+h + 12)
    if (mod === 'AM' && h === '12') h = '00'
    return `${h.padStart(2, '0')}:${m}`
  }

  const fetchTrips = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_Endpoint}getTripList`)
      if (!response.ok) throw new Error(`Failed to load trips: ${response.status}`)

      const data = await response.json()

      const tripsWithSortedItinerary = data.map(trip => ({
        ...trip,
        id: trip.pk,
        itinerary: trip.itinerary?.map(day => ({
          ...day,
          activities: [...(day.activities || [])].sort((a, b) => {
            const aTime = convertTo24Hour(a.time)
            const bTime = convertTo24Hour(b.time)
            return aTime.localeCompare(bTime)
          })
        })) || []
      }))

      setTrips(tripsWithSortedItinerary)
    } catch (err) {
      console.error('Error fetching trips:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTrips() }, [])

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_Endpoint}deleteTrip?tripId=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error(`Failed to delete trip. Status: ${response.status}`)
      await fetchTrips()
      setSelectedTrip(null)
    } catch (err) {
      console.error('Error deleting trip:', err)
      alert('Failed to delete trip. Please try again.')
    }
  }

  const updateTripAPI = async (tripId, attributeName, newValue) => {
    try {
      const res = await fetch(`${API_Endpoint}updateTrip?tripId=${encodeURIComponent(tripId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attributeName, newValue })
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`API error: ${res.status} ${errText}`)
      }

      return await res.json()
    } catch (err) {
      console.error('API call failed:', err)
    }
  }

  const handleSave = async (trip) => {
    const days = eachDayOfInterval({
      start: parseMDY(trip.startDate),
      end: parseMDY(trip.endDate)
    })

    const itinerary = days.map(date => {
      const dateStr = format(date, 'MM/dd/yyyy')
      const dayActivities = trip.itinerary.find(d => d.date === dateStr)?.activities || []
      const sortedActivities = [...dayActivities].sort((a, b) => {
        const a24 = convertTo24Hour(a.time)
        const b24 = convertTo24Hour(b.time)
        return a24.localeCompare(b24)
      })

      return { date: dateStr, activities: sortedActivities }
    })

    const finalTrip = { ...trip, itinerary }

    if (trip.id) {
      const existingTrip = trips.find(t => t.id === trip.id)
      if (existingTrip) {
        if (existingTrip.destination !== trip.destination) {
          await updateTripAPI(trip.id, 'destination', finalTrip.destination)
        }
        if (existingTrip.startDate !== trip.startDate) {
          await updateTripAPI(trip.id, 'startDate', trip.startDate)
        }
        if (existingTrip.endDate !== trip.endDate) {
          await updateTripAPI(trip.id, 'endDate', trip.endDate)
        }
        if (JSON.stringify(existingTrip.itinerary) !== JSON.stringify(finalTrip.itinerary)) {
          await updateTripAPI(trip.id, 'itinerary', finalTrip.itinerary)
        }
      }
    } else {
      finalTrip.id = uuidv4()
      try {
        const response = await fetch(`${API_Endpoint}createTrip`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(finalTrip)
        })
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
        alert('Trip created successfully!')
      } catch (error) {
        console.error('Error creating trip:', error)
        alert('Failed to create trip.')
      }
    }

    await fetchTrips()
    setEditingTrip(null)
    setSelectedTrip(null)
  }

  return (
    <div className="container bg-light-sand py-5 text-slate-gray">
      <h2 className="text-center mb-4 text-forest-green">
        {!selectedTrip && !editingTrip && 'Destinations'}
        {selectedTrip && !editingTrip && 'Itinerary'}
        {selectedTrip && editingTrip && editingTrip.destination}
      </h2>

      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
          <div className="spinner-border text-terra" role="status"></div>
        </div>
      )}

      {!selectedTrip && !editingTrip && !loading && (
        <>
          <button
            className="btn btn-terra mb-4 d-block mx-auto"
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
          <div className="d-flex justify-content-center mb-3">
            <button className="btn btn-secondary mb-3 me-2" onClick={() => setSelectedTrip(null)}>
              &larr; Back
            </button>
            <button className="btn btn-terra mb-3 me-2" onClick={() => setEditingTrip(selectedTrip)}>
              Edit
            </button>
          </div>

          <h4 className="text-forest-green mb-3 text-center">
            {selectedTrip.destination} — {selectedTrip.startDate} to {selectedTrip.endDate}
          </h4>

          {selectedTrip.itinerary.map((dayPlan, idx) => (
            <div key={idx} className="mb-4 p-4 bg-white-custom rounded shadow-sm">
              <h5 className="text-forest-green">{dayPlan.date}</h5>
              {Array.isArray(dayPlan.activities) && dayPlan.activities.length > 0 ? (
                <ul className="list-unstyled">
                  {dayPlan.activities.map((ev, i) => (
                    <li key={i} className="d-flex mb-1">
                      <div className="me-3 text-end" style={{ width: '80px' }}>
                        <strong>{ev.time}</strong>
                      </div>
                      <div>{ev.name}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">No activities planned for this day.</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}*/
import { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { format, eachDayOfInterval, parse, isAfter, isBefore } from 'date-fns';

export default function TripForm({ trip = {}, onSave, onCancel }) {
  const [localTrip, setLocalTrip] = useState({
    destination: trip.destination || '',
    startDate: trip.startDate || '',
    endDate: trip.endDate || '',
    itinerary: trip.itinerary || [],
  });
  const [newActivityTime, setNewActivityTime] = useState({});
  const [newActivityName, setNewActivityName] = useState({});
  const [error, setError] = useState('');

  const toInputDate = display => {
    if (!display) return '';
    const [m, d, y] = display.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  const fromInputDate = iso => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  };

  const parseMDY = str => parse(str, 'MM/dd/yyyy', new Date());

  // Regenerate itinerary when dates change
  useEffect(() => {
    const { startDate, endDate } = localTrip;
    if (startDate && endDate) {
      const start = parseMDY(startDate);
      const end = parseMDY(endDate);
      if (isAfter(start, end)) {
        setError('End date must be after start date.');
        return;
      } else {
        setError('');
      }

      const days = eachDayOfInterval({ start, end });
      const prevMap = Object.fromEntries(
        localTrip.itinerary.map(day => [day.date, day])
      );
      const newIt = days.map(date => {
        const dateStr = format(date, 'MM/dd/yyyy');
        return prevMap[dateStr] || { date: dateStr, activities: [] };
      });
      setLocalTrip(trip => ({ ...trip, itinerary: newIt }));
    }
  }, [localTrip.startDate, localTrip.endDate]);

  const formatTime12Hour = timeStr => {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };

  const handleAddActivity = date => {
    const time = newActivityTime[date];
    const name = newActivityName[date];
    if (!time || !name) return;
    const formattedTime = formatTime12Hour(time);
    const updatedItinerary = localTrip.itinerary.map(d =>
      d.date !== date
        ? d
        : {
            ...d,
            activities: [...d.activities, { time: formattedTime, name }],
          }
    );
    setLocalTrip({ ...localTrip, itinerary: updatedItinerary });
    setNewActivityTime({ ...newActivityTime, [date]: '' });
    setNewActivityName({ ...newActivityName, [date]: '' });
  };

  const handleRemoveActivity = (date, index) => {
    const updatedItinerary = localTrip.itinerary.map(d =>
      d.date !== date
        ? d
        : {
            ...d,
            activities: d.activities.filter((_, i) => i !== index),
          }
    );
    setLocalTrip({ ...localTrip, itinerary: updatedItinerary });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errors = [];
    const { destination, startDate, endDate, itinerary } = localTrip;

    if (!destination.trim()) errors.push('Destination is required.');
    if (!startDate) errors.push('Start date is required.');
    if (!endDate) errors.push('End date is required.');
    const start = parseMDY(startDate);
    const end = parseMDY(endDate);
    if (isAfter(start, end)) errors.push('End date must be after start date.');

    itinerary.forEach(day =>
      day.activities.forEach((act, ix) => {
        if (!act.name.trim())
          errors.push(`Activity name required on ${day.date} (#${ix + 1}).`);
        if (!act.time.trim())
          errors.push(`Activity time required on ${day.date}, "${act.name}".`);
      })
    );

    if (errors.length > 0) {
      alert('Please fix the following:\n' + errors.join('\n'));
      return;
    }

    if (itinerary.every(day => day.activities.length === 0)) {
      if (!window.confirm('No activities added. Save this trip anyway?')) return;
    }

    onSave({ ...trip, ...localTrip });
  };

  const handleFieldChange = (field, value) =>
    setLocalTrip({ ...localTrip, [field]: value });

  return (
    <form onSubmit={handleSubmit} className="bg-white-custom p-4 rounded shadow-sm mb-4">
      <h4 className="text-forest-green mb-3">Add / Edit Trip</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Destination</label>
        <input
          type="text"
          className="form-control"
          value={localTrip.destination}
          onChange={e => handleFieldChange('destination', e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={toInputDate(localTrip.startDate)}
            onChange={e =>
              handleFieldChange('startDate', fromInputDate(e.target.value))
            }
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            min={toInputDate(localTrip.startDate)}
            value={toInputDate(localTrip.endDate)}
            onChange={e =>
              handleFieldChange('endDate', fromInputDate(e.target.value))
            }
          />
        </div>
      </div>

      {localTrip.itinerary.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Itinerary</label>
          {localTrip.itinerary.map(day => (
            <div key={day.date} className="border rounded p-3 mb-3">
              <strong>{day.date}</strong>
              <ul className="list-unstyled">
                {day.activities.map((activity, idx) => (
                  <li key={idx}>
                    {activity.time} — {activity.name}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleRemoveActivity(day.date, idx)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <TimePicker
                  disableClock
                  clearIcon={null}
                  format="h:mm a"
                  value={newActivityTime[day.date] || ''}
                  onChange={val =>
                    setNewActivityTime({ ...newActivityTime, [day.date]: val })
                  }
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Activity Description"
                  value={newActivityName[day.date] || ''}
                  onChange={e =>
                    setNewActivityName({ ...newActivityName, [day.date]: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleAddActivity(day.date)}
                >
                  + Add Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 d-flex justify-content-center">
        <button type="submit" className="btn btn-terra me-2">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

