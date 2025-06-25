// src/pages/TripsPage.jsx
import React, { useState } from 'react';
import TripForm from '../components/Trips/TripForm';
import TripList from '../components/Trips/TripList';
import { format, eachDayOfInterval, parseISO } from 'date-fns';

export default function TripsPage() {
  const [trips, setTrips] = useState([
    {
      id: 1,
      destination: 'Venice',
      startDate: '2025-07-01',
      endDate: '2025-07-02',
      itinerary: [
        {
          date: '2025-07-01',
          events: [
            { time: '10:00 AM', name: 'Gondola Ride' },
            { time: '2:00 PM', name: 'Piazza San Marco' }
          ]
        },
        {
          date: '2025-07-02',
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
      startDate: '2025-07-10',
      endDate: '2025-07-11',
      itinerary: [
        {
          date: '2025-07-10',
          events: [
            { time: '11:00 AM', name: 'Blue Lagoon' },
            { time: '3:00 PM', name: 'Sun Voyager Sculpture' }
          ]
        },
        {
          date: '2025-07-11',
          events: [
            { time: '8:00 AM', name: 'Golden Circle Tour' },
            { time: '1:00 PM', name: 'Perlan Museum' }
          ]
        }
      ]
    }
  ]);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [editingTrip, setEditingTrip] = useState(null);

  const handleDelete = (id) => {
    setTrips(trips.filter(t => t.id !== id));
    setSelectedTrip(null);
  };

  const handleSave = (trip) => {
    const days = eachDayOfInterval({
      start: parseISO(trip.startDate),
      end: parseISO(trip.endDate)
    });

    const itinerary = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayEvents = trip.itinerary.find(day => day.date === dateStr)?.events || [];
      const sortedEvents = [...dayEvents].sort((a, b) => {
        const aDate = new Date(`1970-01-01T${convertTo24Hour(a.time)}`);
        const bDate = new Date(`1970-01-01T${convertTo24Hour(b.time)}`);
        return aDate - bDate;
      });
      return { date: dateStr, events: sortedEvents };
    });

    const finalTrip = { ...trip, itinerary };

    if (trip.id) {
      setTrips(trips.map(t => t.id === trip.id ? finalTrip : t));
    } else {
      finalTrip.id = Date.now();
      setTrips([...trips, finalTrip]);
    }
    setEditingTrip(null);
    setSelectedTrip(null);
  };

  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    if (modifier === 'PM' && hours !== '12') hours = String(+hours + 12);
    if (modifier === 'AM' && hours === '12') hours = '00';
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  return (
    <div className="container py-4" style={{ backgroundColor: '#F0EBE3', color: '#37474F' }}>
      <h2 className="mb-4" style={{ color: '#2E7D32' }}>Your Itinerary</h2>

      {!selectedTrip && !editingTrip && (
        <>
          <button className="btn btn-success mb-3" onClick={() => setEditingTrip({ destination: '', startDate: '', endDate: '', itinerary: [] })}>
            + New Trip
          </button>
          <TripList trips={trips} onSelect={setSelectedTrip} onDelete={handleDelete} />
        </>
      )}

      {editingTrip && (
        <TripForm trip={editingTrip} onSave={handleSave} onCancel={() => setEditingTrip(null)} />
      )}

      {selectedTrip && !editingTrip && (
        <div>
          <button className="btn btn-secondary mb-3 me-2" onClick={() => setSelectedTrip(null)}>&larr; Back</button>
          <button className="btn btn-outline-success mb-3" onClick={() => setEditingTrip(selectedTrip)}>Edit</button>
          <h4 style={{ color: '#2E7D32' }}>{selectedTrip.destination} — {selectedTrip.startDate} to {selectedTrip.endDate}</h4>
          {selectedTrip.itinerary.map((dayPlan, index) => (
            <div key={index} className="mb-3 p-3 rounded" style={{ backgroundColor: '#81D4FA' }}>
              <h5 style={{ color: '#2E7D32' }}>{format(parseISO(dayPlan.date), 'EEEE, MMM d')}</h5>
              {dayPlan.events.map((event, i) => (
                <div key={i}><strong>{event.time}</strong> — {event.name}</div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
