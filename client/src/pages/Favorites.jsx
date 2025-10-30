import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../api/apiService';
import { useAuth } from '../contexts/AuthContext';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refreshFavorites } = useAuth();

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await apiService.getFavorites();
            setFavorites(response.data);
        } catch (error) {
            console.error('Failed to fetch favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (parkingAreaId) => {
        try {
            await apiService.removeFromFavorites(parkingAreaId);
            setFavorites(favorites.filter(f => f._id !== parkingAreaId));
            await refreshFavorites();
        } catch (error) {
            console.error('Failed to remove favorite:', error);
        }
    };

    if (loading) {
        return <div className="container mx-auto py-8">Loading...</div>;
    }

    if (favorites.length === 0) {
        return (
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600 mb-4">You haven't saved any favorite parking spots yet.</p>
                    <Link to="/dashboard" className="text-blue-600 font-semibold hover:underline">Browse parking areas</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">My Favorites ({favorites.length})</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map(area => (
                    <div key={area._id} className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-md transition">
                        <img
                            src={area.image || 'https://placehold.co/400x200/e2e8f0/4a5568?text=No+Image'}
                            alt={area.name}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="font-bold text-lg mb-2">{area.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{area.location.name}, {area.location.city}</p>
                            <div className="flex items-center justify-between mb-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${area.availableSlots > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {area.availableSlots} / {area.totalSlots} available
                                </span>
                                <span className="text-blue-600 font-bold">₹{area.pricePerHour}/hr</span>
                            </div>
                            <div className="flex gap-2">
                                <Link
                                    to={`/parking/${area._id}`}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 rounded-lg font-medium transition"
                                >
                                    Book Now
                                </Link>
                                <button
                                    onClick={() => handleRemoveFavorite(area._id)}
                                    className="px-4 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Favorites;
