import { useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const containerRef = useRef(null);
  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib || !window.google || !containerRef.current) return;

    const autocompleteEl = new google.maps.places.PlaceAutocompleteElement();
    autocompleteEl.placeholder = "Search for a place";
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(autocompleteEl);

    const handleSelect = async ({ placePrediction }) => {
      try {
        const place = placePrediction.toPlace();
        await place.fetchFields({
          fields: ["displayName", "formattedAddress", "location", "viewport"],
        });

        onPlaceSelect?.(place);
      } catch (err) {
        console.error("Place fetch failed:", err);
      }
    };

    autocompleteEl.addEventListener("gmp-select", handleSelect);

    return () => {
      autocompleteEl.removeEventListener("gmp-select", handleSelect);
      autocompleteEl.remove();
    };
  }, [placesLib, onPlaceSelect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 400,
        zIndex: 9999,
      }}
    />
  );
};

export default PlaceAutocomplete;
