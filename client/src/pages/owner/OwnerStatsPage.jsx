import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import HalfScreenLoader from '../../components/HalfScreenLoader';

const BuildingStorefrontIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.75c.414 0 .75.336.75.75v7.5m0 0v-7.5m0 7.5h-12v-7.5m12 7.5v-7.5a.75.75 0 00-.75-.75h-.75a.75.75 0 00-.75.75v7.5m-6-15l-3-3m0 0l-3 3m3-3v12.75" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const OwnerStatsPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await apiService.getOwnerStats();
                setStats(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'A server error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-10"><HalfScreenLoader/> <div>Loading stats...</div></div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    if (stats && stats.totalAreas === 0) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700">Welcome to your Dashboard!</h2>
                <p className="text-gray-500 mt-2 mb-6">You haven't listed any parking areas yet. Get started now!</p>
                <button 
                    onClick={() => navigate('/owner-dashboard/add-parking')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center mx-auto cursor-pointer"
                >
                    <PlusCircleIcon /> List Your First Parking Area
                </button>
            </div>
        );
    }

    if (stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Parkings" value={stats.totalAreas} icon={<BuildingStorefrontIcon />} />
                <StatCard title="Total Slots" value={stats.totalSlots} icon={<ChartBarIcon />} />
                <StatCard title="Occupied Slots" value={stats.occupiedSlots} icon={<ChartBarIcon />} />
                <StatCard title="Occupancy Rate" value={`${stats.currentOccupancy.toFixed(1)}%`} icon={<ChartBarIcon />} />
            </div>
        );
    }

    return null;
};

export default OwnerStatsPage;
