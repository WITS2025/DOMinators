export default function TripList({ trips, onSelect, onDelete }) {
  return (
    <div className="list-group">
    
      {trips.length === 0 && (
        <div className="text-center">No trips planned yet. Start trekking!</div>
      )}

  
      {trips.map((trip) => (
        <div
          key={trip.id}
          className="list-group-item list-group-item-action d-flex justify-content-between align-items-center mb-3 py-3"
        >
  
          <div
            className="flex-grow-1 text-center"
            onClick={() => onSelect(trip)}
            style={{ cursor: "pointer" }}
          >
            <strong>{trip.destination}</strong>
            <br />
            <small>{trip.startDate} – {trip.endDate}</small>
          </div>

          {/* Delete button with confirmation */}
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this trip?')) {
                onDelete(trip.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

