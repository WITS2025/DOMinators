export default function TripList({ trips, onSelect, onDelete }) {
  return (
    <ul className="list-group">
      {trips.map(trip => (
        <li
          key={trip.id}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <div onClick={() => onSelect(trip)} style={{ cursor: 'pointer' }}>
            <strong>{trip.destination}</strong> <br />
            <small>{trip.startDate} – {trip.endDate}</small>
          </div>
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this trip?')) {
                onDelete(trip.id)
              }
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  )
}
