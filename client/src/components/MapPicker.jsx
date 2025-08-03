import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios'; 
import GeoSearchField from './GeoSearchField';


const CrosshairsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;

const ErrorBanner = ({ message }) => {
    if (!message) return null;
    return (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-md shadow-lg">
            {message}
        </div>
    );
};


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


function LocationMarker({ position, setPosition, onLocationSelect, setMapError }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
      const fetchAddress = async () => {
        setMapError(null); // Clear previous errors on new action
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`, { timeout: 5000 }); // Added a 5-second timeout
          const address = response.data.address || {};
          onLocationSelect({
            lat: position.lat.toFixed(6),
            lng: position.lng.toFixed(6),
            city: address.city || address.town || address.village || '',
            locationName: address.road || address.suburb || address.neighbourhood || 'Unknown Location'
          });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          setMapError("Location service is unavailable. Please try again later.");
          onLocationSelect({ lat: position.lat.toFixed(6), lng: position.lng.toFixed(6), city: '', locationName: '' });
        }
      };
      fetchAddress();
    }
  }, [position, map, onLocationSelect, setMapError]);

  return position === null ? null : <Marker position={position}></Marker>;
}

function LocateControl({ setPosition, setMapError }) {
    const map = useMap();
    const handleLocateMe = () => {
        setMapError(null); // Clear previous errors
        map.locate().on('locationfound', (e) => {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 16);
        }).on('locationerror', (error) => {
            console.error("Location error:", error);
            setMapError('Could not access your location. Please enable location services.');
        });
    };

    return (
        <button onClick={handleLocateMe} className="absolute bottom-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition cursor-pointer" title="Locate Me">
            <CrosshairsIcon />
        </button>
    );
}

// --- MAIN MAP COMPONENT ---

const MapPicker = ({ onLocationSelect }) => {
  const initialCenter = [26.8467, 80.9462]; // Lucknow, India
  const [position, setPosition] = useState(null);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    if (mapError) {
        const timer = setTimeout(() => {
            setMapError(null);
        }, 7000); // Error message will disappear after 7 seconds

        return () => clearTimeout(timer);
    }
  }, [mapError]);

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-md z-0 relative">
      <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ErrorBanner message={mapError} />
        <GeoSearchField />
        <LocateControl setPosition={setPosition} setMapError={setMapError} />
        <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationSelect={onLocationSelect} 
            setMapError={setMapError}
        />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
