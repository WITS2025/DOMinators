import { useEffect, useState } from 'react';
import {
  APIProvider,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import PlaceAutocomplete from './PlaceAutocomplete';

const TripMapInner = ({ coords, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (map && bounds) {
      const ne = new google.maps.LatLng(bounds.northeast.lat, bounds.northeast.lng);
      const sw = new google.maps.LatLng(bounds.southwest.lat, bounds.southwest.lng);
      const googleBounds = new google.maps.LatLngBounds(sw, ne);
      map.fitBounds(googleBounds, 3);
    }
  }, [map, bounds]);

  return (
    <Map
      defaultCenter={coords}
      defaultZoom={10}
      style={{ height: '400px', width: '100%' }}
    />
  );
};

const TripMap = ({ trip, onMapDataReady }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [coords, setCoords] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [noResults, setNoResults] = useState(false);
  const [error, setError] = useState(null);

  const destination = trip.destination;
  const [mapData, setMapData] = useState(trip.mapData || null);

  // Load saved mapData if present
  useEffect(() => {
    if (mapData) {
      setCoords(mapData.coords);
      setBounds(mapData.bounds);
    }
  }, [mapData]);

  // Geocode if mapData not present
  useEffect(() => {
    if (mapData) return;

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
          const newCoords = { lat, lng };

          setCoords(newCoords);
          setBounds(viewport);

          setMapData({
            coords: newCoords,
            bounds: viewport
          });
        } else if (data.status === 'ZERO_RESULTS') {
          setNoResults(true);
        } else {
          throw new Error(`Geocoding failed: ${data.status}`);
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchCoords();
  }, [destination, apiKey, trip]);

  const handlePlaceSelect = (placeResult) => {
    const location = placeResult.location;
    if (!location || typeof location.lat !== "function") return;

    const lat = location.lat();
    const lng = location.lng();

    const ne = placeResult.viewport?.getNorthEast?.();
    const sw = placeResult.viewport?.getSouthWest?.();

    const viewportBounds = ne && sw ? {
      northeast: { lat: ne.lat(), lng: ne.lng() },
      southwest: { lat: sw.lat(), lng: sw.lng() },
    } : null;

    const newCoords = { lat, lng };

    setCoords(newCoords);
    if (viewportBounds) setBounds(viewportBounds);
    setNoResults(false);

    setMapData({
      coords: newCoords,
      bounds: viewportBounds
    });
  };

  useEffect(() => {
    if (coords && bounds && !trip.mapData && onMapDataReady) {
      onMapDataReady({ coords, bounds });
    }
  }, [coords, bounds, mapData, onMapDataReady]);

  if (error) return <p className="text-danger">Map error: {error}</p>;

  return (
    <APIProvider apiKey={apiKey}>
      {noResults && (
        <div className="autocomplete-control">
          <PlaceAutocomplete onPlaceSelect={handlePlaceSelect} />
        </div>
      )}
      {coords && bounds && (
        <div className="card shadow-sm mb-4">
          <div className="rounded overflow-hidden">
            <TripMapInner coords={coords} bounds={bounds} />
          </div>
        </div>
      )}
    </APIProvider>
  );
};

export default TripMap;
