import { useEffect, useState } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';

const TripMapInner = ({ coords, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (map && bounds) {
      const ne = new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng);
      const sw = new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng);
      const googleBounds = new google.maps.LatLngBounds(sw, ne);
      map.fitBounds(googleBounds);
    }
  }, [map, bounds]);

  return (
    <Map
      defaultCenter={coords}
      defaultZoom={10} // required fallback value; will be overridden
      style={{ height: '400px', width: '100%' }}
    />
  );
};

const TripMap = ({ destination }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [coords, setCoords] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === 'OK') {
          const result = data.results[0];
          const { lat, lng } = result.geometry.location;
          const { viewport } = result.geometry;
          setCoords({ lat, lng });
          setBounds(viewport); // viewport has northeast and southwest bounds
        } else {
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchCoords();
  }, [destination, apiKey]);

  if (error) return <p className="text-danger">Map error: {error}</p>;
  if (!coords || !bounds) return <p className="text-muted">Loading map for "{destination}"...</p>;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="card shadow-sm mb-4">
        <div className="rounded overflow-hidden">
          <TripMapInner coords={coords} bounds={bounds} />
        </div>
      </div>
    </APIProvider>
  );
};

export default TripMap;
