// src/components/Trips/TripForm.jsx
import { useState, useEffect } from 'react';
import { eachDayOfInterval, format, parseISO } from 'date-fns';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

export default function TripForm({ trip, onSave, onCancel }) {
  const [destination, setDestination] = useState(trip.destination || '');
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [itinerary, setItinerary] = useState(trip.itinerary || []);
  const [newEventTime, setNewEventTime] = useState({});
  const [newEventName, setNewEventName] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (startDate && endDate && new Date(endDate) >= new Date(startDate)) {
      const days = eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      });

      setItinerary(prev => {
        const prevMap = Object.fromEntries(prev.map(day => [day.date, day]));
        return days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          return prevMap[dateStr] || { date: dateStr, events: [] };
        });
      });
    } else if (!startDate || !endDate) {
      setItinerary([]);
    }
  }, [startDate, endDate]);

  // const handleAddEvent = (date) => {
  //   const time = newEventTime[date];
  //   const name = newEventName[date];
  //   if (!time || !name) return;
  //   const formattedTime = new Date(`1970-01-01T${time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  //   // setItinerary(prev =>
  //   //   prev.map(day =>
  //   //     day.date === date
  //   //       ? { ...day, events: [...day.events, { time: formattedTime, name }] }
  //   //       : day
  //   //   )
  //   // );
  //     setItinerary(prev =>
  //       prev.map(day => {
  //         if (day.date !== date) return day;

  //         const updatedEvents = [...day.events, { time, name }];

  //         const sortedEvents = updatedEvents.sort((a, b) => {
  //           const parseTime = (str) => {
  //             const [t, mod] = str.split(' ');
  //             let [h, m] = t.split(':');
  //             if (mod === 'PM' && h !== '12') h = String(+h + 12);
  //             if (mod === 'AM' && h === '12') h = '00';
  //             return `${h.padStart(2, '0')}:${m}`;
  //           };
  //           return parseTime(a.time).localeCompare(parseTime(b.time));
  //         });

  //         return { ...day, events: sortedEvents };
  //       })
  //     );
  //   setNewEventTime({ ...newEventTime, [date]: '' });
  //   setNewEventName({ ...newEventName, [date]: '' });
  // };

    const handleAddEvent = (date) => {
    const time = newEventTime[date];
    const name = newEventName[date];
    if (!time || !name) return;

    const formattedTime = formatTime12Hour(time);

    setItinerary(prev =>
      prev.map(day => {
        if (day.date !== date) return day;

        const updatedEvents = [...day.events, { time: formattedTime, name }].sort((a, b) => {
          const parseTime = (str) => {
            const [t, mod] = str.split(' ');
            let [h, m] = t.split(':');
            if (mod === 'PM' && h !== '12') h = String(+h + 12);
            if (mod === 'AM' && h === '12') h = '00';
            return `${h.padStart(2, '0')}:${m}`;
          };
          return parseTime(a.time).localeCompare(parseTime(b.time));
        });

        return { ...day, events: updatedEvents };
      })
    );

    setNewEventTime({ ...newEventTime, [date]: '' });
    setNewEventName({ ...newEventName, [date]: '' });
  };

  const formatTime12Hour = (timeStr) => {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minute} ${suffix}`;
  };

  const handleRemoveEvent = (date, index) => {
    setItinerary(prev =>
      prev.map(day =>
        day.date === date
          ? { ...day, events: day.events.filter((_, i) => i !== index) }
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
      events: [...day.events]
    }));
    onSave({ ...trip, destination, startDate, endDate, itinerary: itineraryToSave });
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-3 bg-light rounded">
      <h4>Add / Edit Trip</h4>
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

      <div className="mb-3">
        <label className="form-label">Start Date</label>
        <input
          type="date"
          className="form-control"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">End Date</label>
        <input
          type="date"
          className="form-control"
          value={endDate}
          min={startDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {itinerary.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Itinerary</label>
          {itinerary.map((day, i) => (
            <div key={i} className="border p-2 mb-3 rounded">
              <strong>{format(parseISO(day.date), 'EEEE, MMM d')}</strong>
              <ul className="list-unstyled">
                {day.events.map((event, j) => (
                  <li key={j}>
                    <span>{event.time} — {event.name}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger ms-2"
                      onClick={() => handleRemoveEvent(day.date, j)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="d-flex gap-2 align-items-center mt-2">
                <TimePicker
                  disableClock={true}
                  clearIcon={null}
                  format="h:mm a"
                  value={newEventTime[day.date] || ''}
                  onChange={(val) => setNewEventTime({ ...newEventTime, [day.date]: val })}
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Event Description"
                  value={newEventName[day.date] || ''}
                  onChange={(e) => setNewEventName({ ...newEventName, [day.date]: e.target.value })}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => handleAddEvent(day.date)}>
                  + Add Event
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button type="submit" className="btn btn-success me-2">Save</button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
    </form>
  );
}