/*
// src/components/TripForm.jsx
import { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { format, eachDayOfInterval, parse } from 'date-fns';
import { useTripContext } from '../context/TripContext';

export default function TripForm({ trip, onSave, onCancel }) {
  const { uploadTripImage } = useTripContext();
  const [imageUrl, setImageUrl] = useState(trip.imageUrl || '');
  const [destination, setDestination] = useState(trip.destination || '');
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [itinerary, setItinerary] = useState(trip.itinerary || []);
  const [newActivityTime, setNewActivityTime] = useState({});
  const [newActivityName, setNewActivityName] = useState({});
  const [error, setError] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null); // NEW

  const toInputDate = (display) => {
    if (!display) return '';
    const [m, d, y] = display.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }

    let finalImageUrl = imageUrl;

    if (selectedImageFile) {
      finalImageUrl = await uploadTripImage(
        selectedImageFile,
        destination || 'trip',
        trip?.id || null
      );
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
      itinerary: itineraryToSave,
      imageUrl: finalImageUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white-custom p-4 rounded shadow-sm mb-4 d-flex flex-column">
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

      <div className="mb-3">
        <label className="form-label">Trip Photo</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setSelectedImageFile(file);
              setImageUrl(URL.createObjectURL(file));
            }
          }}
        />
        {imageUrl && (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={trip?.destination || 'Trip image'}
            style={{ maxWidth: '100%', marginTop: 10 }}
            onError={() => console.error('Image failed to load:', imageUrl)}
          />
        )}
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
}
*/

// src/components/TripForm.jsx
import { useState, useEffect } from 'react';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import { format, eachDayOfInterval, parse } from 'date-fns';
import { useTripContext } from '../context/TripContext';
import imageCompression from 'browser-image-compression'; // NEW

export default function TripForm({ trip, onSave, onCancel }) {
  const { uploadTripImage } = useTripContext();
  const [imageUrl, setImageUrl] = useState(trip.imageUrl || '');
  const [destination, setDestination] = useState(trip.destination || '');
  const [startDate, setStartDate] = useState(trip.startDate || '');
  const [endDate, setEndDate] = useState(trip.endDate || '');
  const [itinerary, setItinerary] = useState(trip.itinerary || []);
  const [newActivityTime, setNewActivityTime] = useState({});
  const [newActivityName, setNewActivityName] = useState({});
  const [error, setError] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null); // NEW

  const toInputDate = (display) => {
    if (!display) return '';
    const [m, d, y] = display.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) {
      setError('Please fill in all fields.');
      return;
    }

    let finalImageUrl = imageUrl;

    if (selectedImageFile) {
      finalImageUrl = await uploadTripImage(
        selectedImageFile,
        destination || 'trip',
        trip?.id || null
      );
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
      itinerary: itineraryToSave,
      imageUrl: finalImageUrl
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white-custom p-4 rounded shadow-sm mb-4 d-flex flex-column">
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

      <div className="mb-3">
        <label className="form-label">Trip Photo</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files[0];
            if (file) {
              try {
                const options = {
                  maxSizeMB: 0.5,
                  maxWidthOrHeight: 1024,
                  useWebWorker: true,
                };
                const compressedFile = await imageCompression(file, options);
                setSelectedImageFile(compressedFile);
                setImageUrl(URL.createObjectURL(compressedFile));
              } catch (err) {
                console.error('Image compression failed:', err);
                setSelectedImageFile(file);
                setImageUrl(URL.createObjectURL(file));
              }
            }
          }}
        />
        {imageUrl && (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={trip?.destination || 'Trip image'}
            style={{ maxWidth: '100%', marginTop: 10 }}
            onError={() => console.error('Image failed to load:', imageUrl)}
          />
        )}
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
}
