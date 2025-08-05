// src/components/TripForm.jsx

import { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { format, eachDayOfInterval, parse } from 'date-fns';
import { useAuth } from '../context/AuthContext';

export default function TripForm({ trip, onSave, onCancel }) {
  // Initialize state with trip data or defaults
  const [destination, setDestination] = useState(trip.destination || '');
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [itinerary, setItinerary] = useState(trip.itinerary || []);
  const [newActivityTime, setNewActivityTime] = useState({});
  const [newActivityName, setNewActivityName] = useState({});
  const [error, setError] = useState('');

  const { user } = useAuth();

  // Convert MM/DD/YYYY → yyyy-MM-dd (for date input fields)
  const toInputDate = (display) => {
    if (!display) return '';
    const [m, d, y] = display.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

  // Convert yyyy-MM-dd → MM/DD/YYYY (from date input fields)
  const fromInputDate = (iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${m}/${d}/${y}`;
  };

  const parseMDY = (str) => parse(str, 'MM/dd/yyyy', new Date());

  // Automatically generate itinerary days based on start and end dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = parseMDY(startDate);
      const end = parseMDY(endDate);

      if (end >= start) {
        const days = eachDayOfInterval({ start, end });

        // Preserve existing activities for matching dates
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

  // Add a new activity to a specific day in the itinerary
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

    // Clear input fields after adding
    setNewActivityTime({ ...newActivityTime, [date]: '' });
    setNewActivityName({ ...newActivityName, [date]: '' });
  };

  // Format time to 12-hour format with AM/PM
  const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };

  // Remove an activity from a specific day
  const handleRemoveActivity = (date, index) => {
    setItinerary(prev =>
      prev.map(day =>
        day.date === date
          ? { ...day, activities: day.activities.filter((_, i) => i !== index) }
          : day
      )
    );
  };

  // Submit the form to create or update a trip
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

  // Include userId in the trip object for DynamoDB pk
  onSave({
    ...trip,
    destination,
    startDate,
    endDate,
    itinerary: itineraryToSave,
    user: {
      userId: user?.userId
    }
  });
};


  return (
    <form onSubmit={handleSubmit} className="bg-white-custom p-4 rounded shadow-sm mb-4 d-flex flex-column">
      <h4 className="text-forest-green mb-3">Add / Edit Trip</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Destination input */}
      <div className="mb-3">
        <label className="form-label">Destination</label>
        <input
          type="text"
          className="form-control"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {/* Start and End Date inputs */}
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

      {/* Itinerary section */}
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
                    {/* Delete activity */}
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

              {/* Add new activity */}
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

      {/* Save or Cancel buttons */}
      <div className="mt-3 d-flex justify-content-center">
        <button type="submit" className="btn btn-terra me-2">Save</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
