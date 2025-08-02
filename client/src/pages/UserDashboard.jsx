import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { apiService } from '../api/apiService';

// --- ICONS ---
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

const ParkingCard = ({ area }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 group">
            <div className="relative">
                <img 
                    src={area.image || 'https://placehold.co/600x400/e2e8f0/4a5568?text=Parkezy'} 
                    alt={area.name} 
                    className="w-full h-48 object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/e2e8f0/4a5568?text=Image+Error'; }}
                />
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-sm font-bold px-3 py-1 m-2 rounded-full">
                    {area.availableSlots} / {area.totalSlots} Free
                </div>
            </div>
            <div className="p-5">
                <h3 className="text-xl font-bold mb-2 truncate">{area.name}</h3>
                <div className="flex items-center text-gray-500 mb-4 text-sm">
                    <MapPinIcon />
                    <span className="ml-2">{area.location.name}, {area.location.city}</span>
                </div>
                {/* Updated this button to a Link */}
                <Link to={`/parking/${area._id}`} className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 group-hover:scale-105">
                    View Details & Book
                </Link>
            </div>
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
        <div className="bg-gray-300 h-48 w-full"></div>
        <div className="p-5">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-5"></div>
            <div className="h-10 bg-gray-300 rounded w-full"></div>
        </div>
    </div>
);

const UserDashboard = () => {
    const [parkingAreas, setParkingAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchParkingAreas = useCallback(async (query) => {
        setLoading(true);
        setError('');
        try {
            const data = await apiService.getParkingAreas(query);
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

    useEffect(() => {
        fetchParkingAreas('');
    }, [fetchParkingAreas]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchParkingAreas(searchTerm);
    };

    return (
        <div className="container mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h1 className="text-3xl font-bold mb-2">Find Your Perfect Spot</h1>
                <p className="text-gray-600 mb-4">Search for parking areas by city, location, or name.</p>
                <form onSubmit={handleSearch} className="flex items-center">
                    <input 
                        type="text" 
                        placeholder="e.g., 'Downtown' or 'Lucknow'"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg flex items-center h-[50px]">
                        <SearchIcon />
                    </button>
                </form>
            </div>

            {error && <p className="text-red-500 text-center">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                ) : parkingAreas.length > 0 ? (
                    parkingAreas.map(area => <ParkingCard key={area._id} area={area} />)
                ) : (
                    <div className="col-span-full text-center py-10">
                        <h3 className="text-2xl font-semibold text-gray-700">No Parking Areas Found</h3>
                        <p className="text-gray-500 mt-2">Try adjusting your search or check back later.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
