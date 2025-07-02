import React, { useState } from "react";

const API_BASE_URL = "https://8897l70kc2.execute-api.us-east-1.amazonaws.com/dev/trip";

export default function TripFetcher() {
  const [tripId, setTripId] = useState("");
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTrip = async () => {
    setLoading(true);
    setError(null);
    setTrip(null);
    try {
      const res = await fetch(`${API_BASE_URL}?tripId=${encodeURIComponent(tripId)}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to fetch trip");
      }
      const data = await res.json();
      setTrip(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Get Trip by ID</h2>
      <input
        type="text"
        placeholder="Enter Trip ID"
        value={tripId}
        onChange={(e) => setTripId(e.target.value)}
      />
      <button onClick={fetchTrip} disabled={!tripId || loading}>
        {loading ? "Loading..." : "Fetch Trip"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {trip && (
        <div>
          <h3>Trip Details</h3>
          <p><strong>Destination:</strong> {trip.destination}</p>
          <p><strong>Start Date:</strong> {trip.startDate}</p>
          <p><strong>End Date:</strong> {trip.endDate}</p>
          <h4>Days:</h4>
          <ul>
            {trip.days.map((day, i) => (
              <li key={i}>
                <strong>{day.date}:</strong> {day.activities.join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
