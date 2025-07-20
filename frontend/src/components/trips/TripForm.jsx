// src/components/trips/TripForm.jsx
/*import { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { format, eachDayOfInterval, parse } from 'date-fns';

export default function TripForm({ trip, onSave, onCancel }) {
  const [destination, setDestination] = useState(trip.destination || '');
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [itinerary, setItinerary] = useState(trip.itinerary || []);
  const [newActivityTime, setNewActivityTime] = useState({});
  const [newActivityName, setNewActivityName] = useState({});
  const [error, setError] = useState('');

  // Convert MM/DD/YYYY → yyyy-MM-dd (for date input)
  const toInputDate = (display) => {
    if (!display) return '';
    const [m, d, y] = display.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  // Convert yyyy-MM-dd → MM/DD/YYYY (from date input)
  const fromInputDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  };

  const parseMDY = (str) => parse(str, 'MM/dd/yyyy', new Date());

  useEffect(() => {
    if (startDate && endDate) {
      const start = parseMDY(startDate);
      const end = parseMDY(endDate);

      if (end >= start) {
        const days = eachDayOfInterval({ start, end });
        setItinerary(prev => {
          const prevMap = Object.fromEntries(prev.map(day => [day.date, day]));
          return days.map(date => {
            const dateStr = format(date, 'MM/dd/yyyy');
            return prevMap[dateStr] || { date: dateStr, activities: [] };
          });
        });
      } else {
        setItinerary([]);
      }
    } else {
      setItinerary([]);
    }
  }, [startDate, endDate]);

  const handleAddActivity = (date) => {
    const time = newActivityTime[date];
    const name = newActivityName[date];
    if (!time || !name) return;

    const formattedTime = formatTime12Hour(time);

    setItinerary(prev =>
      prev.map(day => {
        if (day.date !== date) return day;

        const updatedActivities = [...day.activities, { time: formattedTime, name }].sort((a, b) => {
          const parseTime = (str) => {
            const [t, mod] = str.split(' ');
            let [h, m] = t.split(':');
            if (mod === 'PM' && h !== '12') h = String(+h + 12);
            if (mod === 'AM' && h === '12') h = '00';
            return `${h.padStart(2, '0')}:${m}`;
          };
          return parseTime(a.time).localeCompare(parseTime(b.time));
        });

        return { ...day, activities: updatedActivities };
      })
    );

    setNewActivityTime({ ...newActivityTime, [date]: '' });
    setNewActivityName({ ...newActivityName, [date]: '' });
  };

  const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };

  const handleRemoveActivity = (date, index) => {
    setItinerary(prev =>
      prev.map(day =>
        day.date === date
          ? { ...day, activities: day.activities.filter((_, i) => i !== index) }
          : day
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }
    const itineraryToSave = itinerary.map(day => ({
      date: day.date,
      activities: [...day.activities]
    }));
    onSave({
      ...trip,
      destination,
      startDate,
      endDate,
      itinerary: itineraryToSave
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white-custom p-4 rounded shadow-sm mb-4">
      <h4 className="text-forest-green mb-3">Add / Edit Trip</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Destination</label>
        <input
          type="text"
          className="form-control"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={startDate ? toInputDate(startDate) : ''}
            onChange={(e) => setStartDate(fromInputDate(e.target.value))}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={endDate ? toInputDate(endDate) : ''}
            min={startDate ? toInputDate(startDate) : ''}
            onChange={(e) => setEndDate(fromInputDate(e.target.value))}
          />
        </div>
      </div>

      {itinerary.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Itinerary</label>
          {itinerary.map((day, i) => (
            <div key={i} className="border rounded p-3 mb-3">
              <strong>{day.date}</strong>
              <ul className="list-unstyled">
                {day.activities.map((activity, j) => (
                  <li key={j}>
                    {activity.time} — {activity.name}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleRemoveActivity(day.date, j)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="d-flex flex-wrap gap-2 mt-2">
                <TimePicker
                  disableClock={true}
                  clearIcon={null}
                  format="h:mm a"
                  value={newActivityTime[day.date] || ''}
                  onChange={(val) => setNewActivityTime({ ...newActivityTime, [day.date]: val })}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Activity Description"
                  value={newActivityName[day.date] || ''}
                  onChange={(e) => setNewActivityName({ ...newActivityName, [day.date]: e.target.value })}
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
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}*/




import { useState } from 'react'
import { parse } from 'date-fns'

export default function TripForm({ trip, onSave, onCancel }) {
  const [localTrip, setLocalTrip] = useState(trip)

  // Helper to parse MM/dd/yyyy → Date
  const parseMDY = (str) => parse(str, 'MM/dd/yyyy', new Date())

  const handleChange = (field, value) => {
    setLocalTrip({ ...localTrip, [field]: value })
  }

  const handleActivityDelete = (date, index) => {
    const activity = localTrip.itinerary
      .find(d => d.date === date)
      ?.activities?.[index]

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the activity "${activity?.name}" at ${activity?.time} on ${date}?`
    )
    if (!confirmDelete) return

    const updatedItinerary = localTrip.itinerary.map(day =>
      day.date === date
        ? {
            ...day,
            activities: day.activities.filter((_, i) => i !== index),
          }
        : day
    )

    setLocalTrip({ ...localTrip, itinerary: updatedItinerary })
  }

  function updateDayActivities(date, updatedActivities) {
    const updatedItinerary = localTrip.itinerary.map(day =>
      day.date === date
        ? { ...day, activities: updatedActivities }
        : day
    )
    setLocalTrip({ ...localTrip, itinerary: updatedItinerary })
  }

  const handleSubmit = () => {
    const errors = []

    if (!localTrip.destination.trim()) errors.push('Destination is required.')
    if (!localTrip.startDate.trim()) errors.push('Start date is required.')
    if (!localTrip.endDate.trim()) errors.push('End date is required.')

    // parse dates properly
    const start = parseMDY(localTrip.startDate)
    const end = parseMDY(localTrip.endDate)

    if (start.getTime() >= end.getTime()) {
      errors.push('Please enter valid start and end dates (End date must be after start date).')
    }

    localTrip.itinerary.forEach(day => {
      day.activities.forEach((activity, index) => {
        if (!activity.name.trim()) {
          errors.push(`Activity name is required on ${day.date} (activity ${index + 1})`)
        }
        if (!activity.time.trim()) {
          errors.push(`Activity time is required on ${day.date} for "${activity.name || 'Unnamed activity'}"`)
        }
      })
    })

    if (errors.length > 0) {
      alert('Please fix the following issues:\n\n' + errors.join('\n'))
      return
    }

    onSave(localTrip)
  }

  return (
    <div className="bg-white-custom p-4 rounded shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
      <div className="mb-3">
        <label className="form-label">Destination</label>
        <input
          className="form-control"
          value={localTrip.destination}
          onChange={e => handleChange('destination', e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Start Date</label>
          <input
            className="form-control"
            type="date"
            value={localTrip.startDate ? formatDateISO(localTrip.startDate) : ''}
            onChange={e => handleChange('startDate', formatDateMDY(e.target.value))}
          />
        </div>
        <div className="col">
          <label className="form-label">End Date</label>
          <input
            className="form-control"
            type="date"
            value={localTrip.endDate ? formatDateISO(localTrip.endDate) : ''}
            onChange={e => handleChange('endDate', formatDateMDY(e.target.value))}
          />
        </div>
      </div>

      {localTrip.itinerary.map(day => (
        <div key={day.date} className="mb-4">
          <h5 className="text-forest-green">{day.date}</h5>
          {day.activities.map((activity, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Time"
                value={activity.time}
                onChange={e => {
                  const updated = [...day.activities]
                  updated[index].time = e.target.value
                  updateDayActivities(day.date, updated)
                }}
              />
              <input
                type="text"
                className="form-control me-2"
                placeholder="Activity"
                value={activity.name}
                onChange={e => {
                  const updated = [...day.activities]
                  updated[index].name = e.target.value
                  updateDayActivities(day.date, updated)
                }}
              />
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleActivityDelete(day.date, index)}
              >
                Delete
              </button>
            </div>
          ))}

          <button
            className="btn btn-sm btn-outline-terra mt-2"
            onClick={() => {
              const updated = [...day.activities, { time: '', name: '' }]
              updateDayActivities(day.date, updated)
            }}
          >
            + Add Activity
          </button>
        </div>
      ))}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-terra" onClick={handleSubmit}>
          Save Trip
        </button>
      </div>
    </div>
  )
}

// Helpers for date formatting to keep MM/dd/yyyy strings while using type="date" inputs

function formatDateISO(mdyString) {
  // input: "07/20/2025" → output: "2025-07-20"
  if (!mdyString) return ''
  const [month, day, year] = mdyString.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function formatDateMDY(isoString) {
  // input: "2025-07-20" → output: "07/20/2025"
  if (!isoString) return ''
  const [year, month, day] = isoString.split('-')
  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`
}
