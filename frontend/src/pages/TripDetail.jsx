// src/pages/TripDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TripForm from '../components/TripForm'
import { useTripContext } from '../context/TripContext'
import TripMap from '../components/TripMap'

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function TripDetail() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { trips, loading, saveTrip, getTripById } = useTripContext()
  
  const [trip, setTrip] = useState(null)
  const [editingTrip, setEditingTrip] = useState(null)
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    if (trips.length > 0) {
      const foundTrip = getTripById(tripId)
      setTrip(foundTrip)
    }
  }, [trips, tripId, getTripById])

  const toggleMap = () => {
    setShowMap(prev => !prev);
  };

  const handleSave = async (updatedTrip) => {
    await saveTrip(updatedTrip)
    setEditingTrip(null)
    // Update local trip state with the saved data
    const refreshedTrip = getTripById(tripId)
    setTrip(refreshedTrip)
  }

  if (loading) {
    return (
      <div className="container bg-light-sand py-5 text-slate-gray">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-terra" role="status"></div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="container bg-light-sand py-5 text-slate-gray">
        <div className="text-center">
          <h2 className="text-forest-green mb-4">Trip Not Found</h2>
          <p className="mb-4">The requested trip could not be found.</p>
          <button
            className="btn btn-terra"
            onClick={() => navigate('/trips')}
          >
            Back to Trips
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container bg-light-sand py-5 text-slate-gray">
      <h2 className="text-center mb-4 text-forest-green">
        {`${trip.destination}`}
      </h2>
      <h5 className="text-forest-green mb-3 text-center">
        {trip.startDate} — {trip.endDate}
      </h5>

      {editingTrip ? (
        <TripForm
          trip={editingTrip}
          onSave={handleSave}
          onCancel={() => setEditingTrip(null)}
        />
      ) : (
        <div>
          <div className="d-flex justify-content-center mb-3">
            <button
              className="btn btn-secondary mb-3 me-2"
              onClick={() => navigate('/trips')}
            >
              &larr; Back to Trips
            </button>
            <button
              className="btn btn-terra mb-3 me-2"
              onClick={() => {
                setEditingTrip(trip);
                setShowMap(false); // because if map is on page, mapData won't reset
              }}
            >
              Edit Trip
            </button>
            { apiKey && (
              <button 
                className="btn btn-terra mb-3"
                onClick={toggleMap}>
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>)}
          </div>

          {trip.itinerary && trip.itinerary.length > 0 ? (
            trip.itinerary.map((dayPlan, idx) => (
              <div
                key={idx}
                className="mb-4 p-4 bg-white-custom rounded shadow-sm"
              >
                <h5 className="text-forest-green">{dayPlan.date}</h5>
                {Array.isArray(dayPlan.activities) && dayPlan.activities.length > 0 ? (
                  <ul className="list-unstyled">
                    {dayPlan.activities.map((ev, i) => (
                      <li key={i} className="d-flex mb-1">
                        <div
                          className="me-3 text-end"
                          style={{ width: '80px' }}
                        >
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
            ))
          ) : (
            <div className="text-center text-muted">
              <p>No itinerary available for this trip.</p>
            </div>
          )}
          {apiKey && showMap && <TripMap
            trip={trip}
            onMapDataReady={(mapData) => {
              const updatedTrip = {
                ...trip,
                mapData
              };
              //setTrip(updatedTrip);
              handleSave(updatedTrip); // <-- saves and refreshes
            }}
          />}
        </div>
      )}
    </div>
  )
}