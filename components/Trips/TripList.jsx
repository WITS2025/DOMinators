// src/components/Trips/TripList.jsx
import React from 'react';

export default function TripList({ trips, onSelect, onDelete }) {
  return (
    <div className="list-group">
      {trips.map(trip => (
        <div key={trip.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
          <div onClick={() => onSelect(trip)} style={{ cursor: 'pointer' }}>
            <strong>{trip.destination}</strong><br />
            <small>{trip.startDate} to {trip.endDate}</small>
          </div>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(trip.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}