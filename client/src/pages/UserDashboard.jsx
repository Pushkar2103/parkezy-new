import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiService } from '../api/apiService';
import GeoSearchField from '../components/GeoSearchField';
import { useAuth } from '../contexts/AuthContext';

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CrosshairsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const parkingIcon = new L.DivIcon({
    html: `<div class="bg-blue-600 p-1 rounded-full shadow-lg border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg></div>`,
    className: 'bg-transparent border-0',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

const userLocationIcon = new L.DivIcon({
    html: `<div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
    className: 'bg-transparent border-0', iconSize: [20, 20], iconAnchor: [10, 10]
});

const ParkingListSkeleton = () => (
    <div className="space-y-3 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-3 bg-white border rounded-lg">
                <div className="w-20 h-20 rounded-md bg-gray-200 mr-4"></div>
                <div className="flex-grow space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        ))}
    </div>
);

const Notification = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className={`fixed top-20 right-5 bg-white p-4 rounded-lg shadow-lg flex items-center border-l-4 ${type === 'error' ? 'border-red-500' : 'border-green-500'} z-[1001]`}>
            {type === 'error' && <XCircleIcon />}
            <span className="text-gray-700">{message}</span>
        </div>
    );
};

const MapEvents = ({ onMove }) => {
    const map = useMap();
    useEffect(() => {
        map.on('moveend', onMove);
        return () => { map.off('moveend', onMove); };
    }, [map, onMove]);
    return null;
};

const TrackUserLocation = ({ onLocationUpdate, showNotification, searchTerm }) => {
    const map = useMap();
    const [marker, setMarker] = useState(null);

    useEffect(() => {
        map.locate({ watch: true, setView: false });

        const handleLocationFound = (e) => {
            const latlng = e.latlng;
            if (marker) marker.setLatLng(latlng);
            else setMarker(L.marker(latlng, { icon: userLocationIcon }).addTo(map));

            map.flyTo(latlng, 15);
            onLocationUpdate(latlng, searchTerm);
        };

        const handleLocationError = () => {
            showNotification('Could not access your location. Please enable location services in your browser.', 'error');
            map.stopLocate();
        };

        map.on('locationfound', handleLocationFound);
        map.on('locationerror', handleLocationError);

        return () => {
            map.stopLocate();
            map.off('locationfound', handleLocationFound);
            map.off('locationerror', handleLocationError);
            if (marker) map.removeLayer(marker);
        };
    }, [map, marker, onLocationUpdate, showNotification, searchTerm]);

    return null;
};

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { func.apply(this, args); }, delay);
    };
};

const UserDashboard = () => {
    const { favorites, refreshFavorites } = useAuth();
    const [parkingAreas, setParkingAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '', isVisible: false });
    const [mapCenter, setMapCenter] = useState([26.8467, 80.9462]);
    const [zoom, setZoom] = useState(13);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        parkingType: '',
        evCharging: false,
        securityFeatures: [],
        vehicleType: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const isInitialLoad = useRef(true);
    const mapRef = useRef();

    const showNotification = (message, type) => {
        setNotification({ message, type, isVisible: true });
    };

    const handleToggleFavorite = async (parkingAreaId, isFavorite) => {
        try {
            if (isFavorite) {
                await apiService.removeFromFavorites(parkingAreaId);
                showNotification('Removed from favorites', 'success');
            } else {
                await apiService.addToFavorites(parkingAreaId);
                showNotification('Added to favorites', 'success');
            }
            await refreshFavorites();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update favorites', 'error');
        }
    };

    const fetchParkingAreas = useCallback(async (lat, lng, search) => {
        if (isInitialLoad.current) {
            setLoading(true);
            isInitialLoad.current = false;
        }
        setNotification(prev => ({ ...prev, isVisible: false }));
        try {
            const response = await apiService.getParkingAreas(search, lat, lng, filters);
            setParkingAreas(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            showNotification(err.response?.data?.message || 'Could not connect to the server.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const debouncedFetch = useMemo(() => debounce(fetchParkingAreas, 500), [fetchParkingAreas]);

    useEffect(() => {
        fetchParkingAreas(mapCenter[0], mapCenter[1], searchTerm);
    }, []);

    useEffect(() => {
        if (!isInitialLoad.current) {
            fetchParkingAreas(mapCenter[0], mapCenter[1], searchTerm);
        }
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        isInitialLoad.current = true;
        fetchParkingAreas(mapCenter[0], mapCenter[1], searchTerm);
    };

    const handleMapMove = useCallback((e) => {
        if (!isTracking) {
            const center = e.target.getCenter();
            debouncedFetch(center.lat, center.lng, searchTerm);
        }
    }, [debouncedFetch, searchTerm, isTracking]);

    const handleLocationUpdate = useCallback((latlng, search) => {
        setMapCenter([latlng.lat, latlng.lng]);
        fetchParkingAreas(latlng.lat, latlng.lng, search);
    }, [fetchParkingAreas]);

    return (
        <div className="container mx-auto">
            <style>{`.leaflet-tooltip-permanent { background-color: #10B981; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.2); white-space: nowrap; } .leaflet-tooltip-top:before { border-top-color: #10B981; }`}</style>
            {notification.isVisible && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ ...notification, isVisible: false })} />}
            <h1 className="text-4xl font-bold mb-6">Find Parking Near You</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[75vh]">
                <div className="lg:col-span-1 flex flex-col h-full bg-white rounded-xl shadow-lg p-4">
                    <form onSubmit={handleSearch} className="flex items-center mb-4">
                        <input type="text" placeholder="Filter results by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg"><SearchIcon /></button>
                    </form>
                    <button onClick={() => setIsTracking(prev => !prev)} className={`w-full flex items-center justify-center font-bold py-2 px-4 rounded-lg mb-4 transition ${isTracking ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                        <CrosshairsIcon />
                        <span className="ml-2">{isTracking ? 'Stop Live Tracking' : 'Use My Current Location'}</span>
                    </button>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-center font-semibold py-2 px-4 rounded-lg mb-4 bg-white border-2 border-gray-300 hover:border-blue-500 text-gray-700 transition"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                        {(filters.minPrice || filters.maxPrice || filters.parkingType || filters.evCharging || filters.securityFeatures.length > 0 || filters.vehicleType) &&
                            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">Active</span>
                        }
                    </button>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4 border border-gray-200">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range (₹/hour)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Parking Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Parking Type</label>
                                <select
                                    value={filters.parkingType}
                                    onChange={(e) => setFilters({...filters, parkingType: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Types</option>
                                    <option value="covered">Covered</option>
                                    <option value="open-air">Open Air</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            {/* EV Charging */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="evCharging"
                                    checked={filters.evCharging}
                                    onChange={(e) => setFilters({...filters, evCharging: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="evCharging" className="ml-2 text-sm font-medium text-gray-700">EV Charging Available</label>
                            </div>

                            {/* Security Features */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Security Features</label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'cctv', label: 'CCTV' },
                                        { value: 'securityGuard', label: 'Security Guard' },
                                        { value: 'gatedAccess', label: 'Gated Access' },
                                        { value: 'lighting', label: 'Lighting' }
                                    ].map(feature => (
                                        <div key={feature.value} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={feature.value}
                                                checked={filters.securityFeatures.includes(feature.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters({...filters, securityFeatures: [...filters.securityFeatures, feature.value]});
                                                    } else {
                                                        setFilters({...filters, securityFeatures: filters.securityFeatures.filter(f => f !== feature.value)});
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <label htmlFor={feature.value} className="ml-2 text-sm text-gray-700">{feature.label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Vehicle Type */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                                <select
                                    value={filters.vehicleType}
                                    onChange={(e) => setFilters({...filters, vehicleType: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Vehicles</option>
                                    <option value="bike">Bike</option>
                                    <option value="car">Car</option>
                                    <option value="compact-suv">Compact SUV</option>
                                    <option value="full-suv">Full-Size SUV</option>
                                    <option value="truck">Truck</option>
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <button
                                onClick={() => setFilters({
                                    minPrice: '',
                                    maxPrice: '',
                                    parkingType: '',
                                    evCharging: false,
                                    securityFeatures: [],
                                    vehicleType: ''
                                })}
                                className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}

                    <div className="overflow-y-auto flex-grow">
                        {loading ? <ParkingListSkeleton /> :
                            parkingAreas.length > 0 ? (
                                <div className="space-y-3">
                                    {parkingAreas.map(area => (
                                        <ParkingListCard
                                            key={area._id}
                                            area={area}
                                            favorites={favorites}
                                            onToggleFavorite={handleToggleFavorite}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center mt-10">No parking areas found in this vicinity. Try searching or moving the map.</p>
                            )
                        }
                    </div>
                </div>
                <div className="lg:col-span-2 h-full rounded-xl shadow-lg overflow-hidden">
                    <MapContainer ref={mapRef} center={mapCenter} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <GeoSearchField />
                        <MapEvents onMove={handleMapMove} />
                        {isTracking && <TrackUserLocation onLocationUpdate={handleLocationUpdate} showNotification={showNotification} searchTerm={searchTerm} />}
                        {parkingAreas.map(area => (
                            <Marker key={area._id} position={[area.location.coordinates.lat, area.location.coordinates.lng]} icon={parkingIcon}>
                                <Tooltip permanent direction="top" offset={[0, -35]}>{area.name}</Tooltip>
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
    <Link to={`/parking/${area._id}`} className="group flex items-center p-3 bg-white border rounded-lg hover:shadow-md hover:border-blue-500 cursor-pointer transition">
        <img src={area.image || 'https://placehold.co/100x100/e2e8f0/4a5568?text=No+Img'} alt={area.name} className="w-20 h-20 rounded-md object-cover mr-4" />
        <div className="flex-grow">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition">{area.name}</h3>
            <div className="flex items-center text-sm text-gray-500 mt-1"><MapPinIcon /><span>{area.location.name}</span></div>
            <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`font-bold px-2 py-1 rounded-full text-xs ${area.availableSlots > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{area.availableSlots} available</span>
                <span className="text-gray-600 font-semibold">{area.distance ? `${area.distance.toFixed(1)} km away` : ''}</span>
            </div>
            <div className="mt-2">
                <span className="text-blue-600 font-bold text-sm">₹{area.pricePerHour}/hr</span>
                {area.evCharging && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">⚡ EV</span>}
                {area.parkingType === 'covered' && <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">🏠 Covered</span>}
            </div>
        </div>
        <ChevronRightIcon />
    </Link>
);

export default UserDashboard;
