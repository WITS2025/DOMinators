// src/pages/Trips.jsx
import { useState } from 'react'
import TripForm from '../components/trips/TripForm'
import TripList from '../components/trips/TripList'
import { useTripContext } from '../context/TripContext'

export default function Trips() {
  console.log('Trips component is rendering!') // Add this line
  const { trips, loading, deleteTrip, saveTrip } = useTripContext() // Error happens here
  console.log('useTripContext worked!', { trips, loading }) // Add this line
  const [editingTrip, setEditingTrip] = useState(null)

  const handleSave = async (trip) => {
    await saveTrip(trip)
    setEditingTrip(null)
  }

  return (
    <div className="container bg-light-sand py-5 text-slate-gray">
      <h2 className="text-center mb-4 text-forest-green">
        {!editingTrip ? 'Destinations' : editingTrip.destination || 'New Trip'}
      </h2>

      {loading && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050 }}>
          <div className="spinner-border text-terra" role="status"></div>
        </div>
      )}

      {!editingTrip && !loading && (
        <>
          <button
            className="btn btn-terra mb-4 d-block mx-auto"
            onClick={() =>
              setEditingTrip({
                destination: '',
                startDate: '',
                endDate: '',
                itinerary: []
              })
            }
          >
            + New Trip
          </button>

          <div className="mx-auto" style={{ maxWidth: '500px' }}>
            <TripList
              trips={trips}
              onDelete={deleteTrip}
            />
          </div>
        </>
      )}

      {editingTrip && (
        <TripForm
          trip={editingTrip}
          onSave={handleSave}
          onCancel={() => setEditingTrip(null)}
        />
      )}
    </div>
  )
}