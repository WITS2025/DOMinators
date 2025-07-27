import React, { useState, useEffect } from "react";

function formatDate(date) {
  // Format date as MM/DD/YYYY
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

function getDateRange(start, end) {
  // Returns array of dates (Date objects) between start and end inclusive
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export default function TripForm({ initialData = null, onSave }) {
  // initialData is optional for editing existing trips

  const [destination, setDestination] = useState(initialData?.destination || "");
  const [startDate, setStartDate] = useState(
    initialData?.startDate
      ? initialData.startDate.split("/").reverse().join("-") // from MM/DD/YYYY to YYYY-MM-DD for input
      : ""
  );
  const [endDate, setEndDate] = useState(
    initialData?.endDate
      ? initialData.endDate.split("/").reverse().join("-")
      : ""
  );
  const [itinerary, setItinerary] = useState(
    initialData?.itinerary || []
  );
  const [error, setError] = useState("");

  // When startDate or endDate changes, regenerate itinerary dates if empty or mismatch
  useEffect(() => {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError("Start Date cannot be after End Date");
      return;
    } else {
      setError("");
    }

    const dates = getDateRange(start, end).map((d) => formatDate(d));

    // Build itinerary days with default empty activities and photos if missing
    setItinerary((oldItinerary) => {
      // Map old itinerary for quick access
      const oldMap = {};
      oldItinerary.forEach((day) => (oldMap[day.date] = day));

      return dates.map((date) => oldMap[date] || {
        date,
        activities: [],
        photoUrls: [],
        photosToUpload: [] // for new uploads (files, not URLs)
      });
    });
  }, [startDate, endDate]);

  // Handle activity changes
  const updateActivity = (date, index, field, value) => {
    setItinerary((oldItinerary) =>
      oldItinerary.map((day) => {
        if (day.date !== date) return day;
        const activities = [...day.activities];
        activities[index] = { ...activities[index], [field]: value };
        return { ...day, activities };
      })
    );
  };

  // Add activity to a date
  const addActivity = (date) => {
    setItinerary((oldItinerary) =>
      oldItinerary.map((day) => {
        if (day.date !== date) return day;
        return {
          ...day,
          activities: [...day.activities, { time: "", name: "" }],
        };
      })
    );
  };

  // Remove activity from a date
  const removeActivity = (date, index) => {
    setItinerary((oldItinerary) =>
      oldItinerary.map((day) => {
        if (day.date !== date) return day;
        const activities = [...day.activities];
        activities.splice(index, 1);
        return { ...day, activities };
      })
    );
  };

  // Handle photo file selection per day
  const onPhotoChange = (date, files) => {
    setItinerary((oldItinerary) =>
      oldItinerary.map((day) => {
        if (day.date !== date) return day;
        return {
          ...day,
          photosToUpload: Array.from(files),
        };
      })
    );
  };

  // Upload photos for a specific date
  const uploadPhotosForDate = async (date) => {
    const day = itinerary.find((d) => d.date === date);
    if (!day || !day.photosToUpload || day.photosToUpload.length === 0) return;

    // Upload each photo, get S3 url from backend (adjust your API here)
    const uploadedUrls = [];

    for (const file of day.photosToUpload) {
      try {
        // Get signed URL from backend
        const res = await fetch(
          "https://0xi0ck7hti.execute-api.us-east-1.amazonaws.com/getSignedUrl",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileType: file.type }),
          }
        );

        if (!res.ok) {
          throw new Error("Failed to get signed URL");
        }

        const { uploadUrl, imageUrl } = await res.json();

        // Upload file to S3
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload file to S3");
        }

        uploadedUrls.push(imageUrl);
      } catch (err) {
        alert(`Error uploading file ${file.name}: ${err.message}`);
      }
    }

    // Update itinerary photoUrls and clear photosToUpload
    setItinerary((oldItinerary) =>
      oldItinerary.map((d) => {
        if (d.date !== date) return d;
        return {
          ...d,
          photoUrls: [...(d.photoUrls || []), ...uploadedUrls],
          photosToUpload: [],
        };
      })
    );
  };

  // Remove photo URL from itinerary day
  const removePhoto = (date, url) => {
    setItinerary((oldItinerary) =>
      oldItinerary.map((d) => {
        if (d.date !== date) return d;
        return {
          ...d,
          photoUrls: (d.photoUrls || []).filter((u) => u !== url),
        };
      })
    );
  };

  // Save full trip data
  const saveTrip = async () => {
    if (!destination || !startDate || !endDate) {
      alert("Please fill destination, start and end dates.");
      return;
    }

    // Compose trip ID: e.g. TRIP# + timestamp or UUID (adjust to your app)
    const tripId = initialData?.pk || `TRIP#${Date.now()}`;

    // Build trip payload with dates in MM/DD/YYYY format
    const tripPayload = {
      pk: tripId,
      destination,
      startDate: formatDate(new Date(startDate)),
      endDate: formatDate(new Date(endDate)),
      itinerary: itinerary.map((day) => ({
        date: day.date,
        activities: day.activities,
        photoUrls: day.photoUrls || [],
      })),
    };

    try {
      const res = await fetch(
        "https://0xi0ck7hti.execute-api.us-east-1.amazonaws.com/createTrip",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(tripPayload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save trip");
      }

      alert("Trip saved successfully!");
      if (onSave) onSave(tripPayload);
    } catch (err) {
      alert(`Error saving trip: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", fontFamily: "Arial" }}>
      <h2>{initialData ? "Edit Trip" : "Add Trip"}</h2>

      <label>
        Destination:
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{ width: "100%", marginBottom: 12 }}
        />
      </label>

      <label>
        Start Date:
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ marginRight: 12, marginBottom: 12 }}
        />
      </label>

      <label>
        End Date:
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ marginBottom: 12 }}
        />
      </label>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <h3>Itinerary</h3>

      {itinerary.map((day) => (
        <div
          key={day.date}
          style={{
            border: "1px solid #ccc",
            padding: 12,
            marginBottom: 12,
            borderRadius: 6,
          }}
        >
          <h4>{day.date}</h4>

          {day.activities.map((activity, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 8,
                alignItems: "center",
              }}
            >
              <input
                type="time"
                value={activity.time}
                onChange={(e) =>
                  updateActivity(day.date, idx, "time", e.target.value)
                }
                style={{ width: "120px" }}
              />
              <input
                type="text"
                placeholder="Activity description"
                value={activity.name}
                onChange={(e) =>
                  updateActivity(day.date, idx, "name", e.target.value)
                }
                style={{ flexGrow: 1 }}
              />
              <button
                onClick={() => removeActivity(day.date, idx)}
                style={{ color: "red" }}
                title="Remove activity"
              >
                &times;
              </button>
            </div>
          ))}

          <button onClick={() => addActivity(day.date)} style={{ marginBottom: 12 }}>
            + Add Activity
          </button>

          <div>
            <label>
              Upload Photos for {day.date}:{" "}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onPhotoChange(day.date, e.target.files)}
              />
            </label>
            <button
              onClick={() => uploadPhotosForDate(day.date)}
              disabled={!day.photosToUpload || day.photosToUpload.length === 0}
              style={{ marginLeft: 8 }}
            >
              Upload Photos
            </button>
          </div>

          {/* Show uploaded photos */}
          <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
            {(day.photoUrls || []).map((url, i) => (
              <div key={i} style={{ position: "relative" }}>
                <img
                  src={url}
                  alt={`Trip photo ${i + 1}`}
                  style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 4 }}
                />
                <button
                  onClick={() => removePhoto(day.date, url)}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "rgba(255,255,255,0.7)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  title="Remove photo"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={saveTrip} style={{ padding: "10px 20px", fontSize: 16 }}>
        Save Trip
      </button>
    </div>
  );
}
