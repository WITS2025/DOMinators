import { useState, useEffect } from 'react'
import { format, isAfter, isBefore, parse } from 'date-fns'

export default function TripForm({ trip, onSave, onCancel }) {
  const [localTrip, setLocalTrip] = useState(trip)

  const parseDate = str => parse(str, 'MM/dd/yyyy', new Date())

  useEffect(() => {
    if (localTrip.startDate && localTrip.endDate) {
      const start = parseDate(localTrip.startDate)
      const end = parseDate(localTrip.endDate)
      if (isAfter(start, end)) {
        alert('End date must be after start date.')
      } else {
        const itinerary = []
        let current = start
        while (!isAfter(current, end)) {
          const dateStr = format(current, 'MM/dd/yyyy')
          const existingDay = localTrip.itinerary.find(d => d.date === dateStr)
          itinerary.push(existingDay || { date: dateStr, activities: [] })
          current.setDate(current.getDate() + 1)
        }
        setLocalTrip({ ...localTrip, itinerary })
      }
    }
  }, [localTrip.startDate, localTrip.endDate])

  const handleChange = (field, value) => {
    setLocalTrip({ ...localTrip, [field]: value })
  }

  const updateDayActivities = (date, updatedActivities) => {
    const updatedItinerary = localTrip.itinerary.map(day =>
      day.date === date ? { ...day, activities: updatedActivities } : day
    )
    setLocalTrip({ ...localTrip, itinerary: updatedItinerary })
  }

  const handleAddActivity = date => {
    const updatedItinerary = localTrip.itinerary.map(day =>
      day.date === date
        ? {
            ...day,
            activities: [...day.activities, { time: '', name: '' }]
          }
        : day
    )
    setLocalTrip({ ...localTrip, itinerary: updatedItinerary })
  }

  const handleActivityDelete = (date, index) => {
    const activity = localTrip.itinerary.find(d => d.date === date)?.activities?.[index]
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the activity "${activity?.name}" at ${activity?.time} on ${date}?`
    )
    if (!confirmDelete) return

    const updatedItinerary = localTrip.itinerary.map(day =>
      day.date === date
        ? {
            ...day,
            activities: day.activities.filter((_, i) => i !== index),
          }
        : day
    )

    setLocalTrip({ ...localTrip, itinerary: updatedItinerary })
  }

  const handleSubmit = () => {
    const errors = []
    if (!localTrip.destination.trim()) errors.push('Destination is required.')
    if (!localTrip.startDate.trim()) errors.push('Start date is required.')
    if (!localTrip.endDate.trim()) errors.push('End date is required.')

    const start = parseDate(localTrip.startDate)
    const end = parseDate(localTrip.endDate)
    if (isBefore(end, start)) {
      errors.push('End date must be after start date.')
    }

    localTrip.itinerary.forEach(day => {
      day.activities.forEach((activity, index) => {
        if (!activity.name.trim()) {
          errors.push(`Activity name is required on ${day.date} (activity ${index + 1})`)
        }
        if (!activity.time.trim()) {
          errors.push(`Activity time is required on ${day.date} for "${activity.name || 'Unnamed activity'}"`)
        }
      })
    })

    if (errors.length > 0) {
      alert('Please fix the following issues:\n\n' + errors.join('\n'))
      return
    }

    if (localTrip.itinerary.every(day => day.activities.length === 0)) {
      const proceed = window.confirm('No activities were added. Are you sure you want to save this trip?')
      if (!proceed) return
    }

    onSave(localTrip)
  }

  return (
    <div className="bg-white-custom p-4 rounded shadow-sm mx-auto" style={{ maxWidth: '600px' }}>
      <div className="mb-3">
        <label className="form-label">Destination</label>
        <input
          className="form-control"
          value={localTrip.destination}
          onChange={e => handleChange('destination', e.target.value)}
        />
      </div>

      <div className="row mb-3">
        <div className="col">
          <label className="form-label">Start Date</label>
          <input
            type="date"
            className="form-control"
            value={convertToInputDate(localTrip.startDate)}
            onChange={e =>
              handleChange('startDate', convertToDisplayDate(e.target.value))
            }
          />
        </div>
        <div className="col">
          <label className="form-label">End Date</label>
          <input
            type="date"
            className="form-control"
            value={convertToInputDate(localTrip.endDate)}
            onChange={e =>
              handleChange('endDate', convertToDisplayDate(e.target.value))
            }
          />
        </div>
      </div>

      {localTrip.itinerary.map(day => (
        <div key={day.date} className="mb-4">
          <h5 className="text-forest-green d-flex justify-content-between align-items-center">
            {day.date}
            <button className="btn btn-sm btn-outline-primary" onClick={() => handleAddActivity(day.date)}>
              + Add Activity
            </button>
          </h5>
          {day.activities.map((activity, index) => (
            <div key={index} className="d-flex align-items-center mb-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Time"
                value={activity.time}
                onChange={e => {
                  const updated = [...day.activities]
                  updated[index].time = e.target.value
                  updateDayActivities(day.date, updated)
                }}
              />
              <input
                type="text"
                className="form-control me-2"
                placeholder="Activity"
                value={activity.name}
                onChange={e => {
                  const updated = [...day.activities]
                  updated[index].name = e.target.value
                  updateDayActivities(day.date, updated)
                }}
              />
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleActivityDelete(day.date, index)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      ))}

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-terra" onClick={handleSubmit}>
          Save Trip
        </button>
      </div>
    </div>
  )
}

function convertToInputDate(mdy) {
  if (!mdy) return ''
  const [month, day, year] = mdy.split('/')
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

function convertToDisplayDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-')
  return `${month}/${day}/${year}`
}
