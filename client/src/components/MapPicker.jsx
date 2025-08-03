import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios'; 
import GeoSearchField from './GeoSearchField';

const CrosshairsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition, onLocationSelect }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
      const fetchAddress = async () => {
        try {
          const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`);
          const address = response.data.address || {};
          onLocationSelect({
            lat: position.lat.toFixed(6),
            lng: position.lng.toFixed(6),
            city: address.city || address.town || address.village || '',
            locationName: address.road || address.suburb || address.neighbourhood || 'Unknown Location'
          });
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          onLocationSelect({ lat: position.lat.toFixed(6), lng: position.lng.toFixed(6), city: '', locationName: '' });
        }
      };
      fetchAddress();
    }
  }, [position, map, onLocationSelect]);

  return position === null ? null : <Marker position={position}></Marker>;
}

function LocateControl({ setPosition }) {
    const map = useMap();
    const handleLocateMe = () => {
        map.locate().on('locationfound', (e) => {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 16);
        }).on('locationerror', () => {
            alert('Could not access your location. Please ensure you have enabled location services in your browser.');
        });
    };

    return (
        <button onClick={handleLocateMe} className="absolute bottom-4 right-4 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition cursor-pointer" title="Locate Me">
            <CrosshairsIcon />
        </button>
    );
}

const MapPicker = ({ onLocationSelect }) => {
  const initialCenter = [26.8467, 80.9462];
  const [position, setPosition] = useState(null);

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-md z-0 relative">
      <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GeoSearchField />
        <LocateControl setPosition={setPosition} />
        <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onLocationSelect={onLocationSelect} 
        />
      </MapContainer>
    </div>
  );
};

export default MapPicker;