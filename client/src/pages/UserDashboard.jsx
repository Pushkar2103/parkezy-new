import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiService } from '../api/apiService';
import GeoSearchField from '../components/GeoSearchField'; 

// --- ICONS ---
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CrosshairsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const MapEvents = ({ onMove }) => {
    const map = useMap();
    useEffect(() => {
        const handleMoveEnd = () => onMove(map.getCenter());
        map.on('moveend', handleMoveEnd);
        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map, onMove]);
    return null;
};

const UserDashboard = () => {
    const [parkingAreas, setParkingAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [mapCenter, setMapCenter] = useState([26.8467, 80.9462]); // Default to Lucknow
    const [zoom, setZoom] = useState(13);
    const [searchTerm, setSearchTerm] = useState('');
    const mapRef = useRef();

    const fetchParkingAreas = useCallback(async (lat, lng, search) => {
        setLoading(true);
        setError('');
        try {
            const data = await apiService.getParkingAreas(search, lat, lng);
            if (Array.isArray(data)) {
                setParkingAreas(data);
            } else {
                setError(data.message || 'Failed to fetch parking areas.');
                setParkingAreas([]);
            }
        } catch (err) {
            setError('Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    }, []);
    
    const handleLocateMe = () => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setMapCenter([latitude, longitude]);
            setZoom(15);
            fetchParkingAreas(latitude, longitude, searchTerm);
        }, () => {
            alert('Could not access your location.');
        });
    };

    useEffect(() => {
        fetchParkingAreas(mapCenter[0], mapCenter[1], searchTerm);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchParkingAreas(mapCenter[0], mapCenter[1], searchTerm);
    };

    const handleMarkerClick = (area) => {
        setMapCenter([area.location.coordinates.lat, area.location.coordinates.lng]);
        setZoom(16);
    };

    const handleMapMove = useCallback((center) => {
        setMapCenter([center.lat, center.lng]);
        fetchParkingAreas(center.lat, center.lng, searchTerm);
    }, [fetchParkingAreas, searchTerm]);

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-6">Find Parking Near You</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
                <div className="lg:col-span-1 flex flex-col h-full bg-white rounded-xl shadow-lg p-4">
                    <form onSubmit={handleSearch} className="flex items-center mb-4">
                        <input 
                            type="text" 
                            placeholder="Filter results by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg">
                            <SearchIcon />
                        </button>
                    </form>
                    <button onClick={handleLocateMe} className="w-full flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg mb-4">
                        <CrosshairsIcon />
                        <span className="ml-2">Use My Current Location</span>
                    </button>
                    
                    <div className="overflow-y-auto flex-grow">
                        {loading && <p className="text-center text-gray-500">Searching for parkings...</p>}
                        {error && <p className="text-red-500">{error}</p>}
                        {!loading && parkingAreas.length > 0 && (
                            <div className="space-y-3">
                                {parkingAreas.map(area => (
                                    <ParkingListCard key={area._id} area={area} onSelect={() => handleMarkerClick(area)} />
                                ))}
                            </div>
                        )}
                        {!loading && parkingAreas.length === 0 && (
                            <p className="text-gray-500 text-center mt-10">No parking areas found in this vicinity. Try searching or moving the map.</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 h-full rounded-xl shadow-lg overflow-hidden">
                    <MapContainer ref={mapRef} center={mapCenter} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <GeoSearchField />
                        <MapEvents onMove={handleMapMove} />
                        {parkingAreas.map(area => (
                            <Marker key={area._id} position={[area.location.coordinates.lat, area.location.coordinates.lng]}>
                                <Popup>
                                    <div className="font-bold">{area.name}</div>
                                    <div>{area.availableSlots} / {area.totalSlots} available</div>
                                    <Link to={`/parking/${area._id}`} className="text-blue-600 font-semibold">View Details</Link>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

const ParkingListCard = ({ area }) => (
    <Link to={`/parking/${area._id}`} className="block p-3 bg-white border rounded-lg hover:shadow-md hover:border-blue-500 cursor-pointer transition">
        <h3 className="font-bold text-gray-800">{area.name}</h3>
        <div className="flex items-center text-sm text-gray-500 mt-1">
            <MapPinIcon />
            <span>{area.location.name}</span>
        </div>
        <div className="flex justify-between items-center mt-2 text-sm">
            <span className={`font-bold ${area.availableSlots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {area.availableSlots} available
            </span>
            <span className="text-gray-600">
                {area.distance ? `${area.distance.toFixed(1)} km away` : ''}
            </span>
        </div>
    </Link>
);

export default UserDashboard;
