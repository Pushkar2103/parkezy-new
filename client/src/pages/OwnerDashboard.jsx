import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';
import MapPicker from '../components/MapPicker';

const BuildingStorefrontIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A.75.75 0 0114.25 12h.75c.414 0 .75.336.75.75v7.5m0 0v-7.5m0 7.5h-12v-7.5m12 7.5v-7.5a.75.75 0 00-.75-.75h-.75a.75.75 0 00-.75.75v7.5m-6-15l-3-3m0 0l-3 3m3-3v12.75" /></svg>;
const ChartBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;

const OwnerDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [contentKey, setContentKey] = useState(Date.now());

    const handleTabChange = (tabName) => {
        setActiveTab(tabName);
        setContentKey(Date.now());
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats setActiveTab={handleTabChange} />;
            case 'myParkings':
                return <MyParkingsList />;
            case 'addParking':
                return <CreateParkingForm setActiveTab={handleTabChange} />;
            default:
                return <DashboardStats setActiveTab={handleTabChange} />;
        }
    };

    const TabButton = ({ tabName, label }) => (
        <button
            onClick={() => handleTabChange(tabName)}
            className={`px-4 py-2 font-semibold rounded-md transition-colors ${activeTab === tabName ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-100'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-6">Owner Dashboard</h1>
            <div className="flex space-x-2 border-b mb-6 pb-2">
                <TabButton tabName="dashboard" label="Dashboard" />
                <TabButton tabName="myParkings" label="My Parkings" />
                <TabButton tabName="addParking" label="Add New Parking" />
            </div>
            <div key={contentKey}>{renderContent()}</div>
        </div>
    );
};

const DashboardStats = ({ setActiveTab }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const data = await apiService.getOwnerStats();
                if (data.totalAreas !== undefined) {
                    setStats(data);
                } else {
                    setError(data.message || 'Failed to load stats.');
                }
            } catch (err) {
                setError('A server error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="text-center py-10">Loading stats...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    if (stats && stats.totalAreas === 0) {
        return (
            <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700">Welcome to your Dashboard!</h2>
                <p className="text-gray-500 mt-2 mb-6">You haven't listed any parking areas yet. Get started now!</p>
                <button
                    onClick={() => setActiveTab('addParking')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center mx-auto"
                >
                    <PlusCircleIcon />
                    List Your First Parking Area
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Parkings" value={stats.totalAreas} icon={<BuildingStorefrontIcon />} />
            <StatCard title="Total Slots" value={stats.totalSlots} icon={<ChartBarIcon />} />
            <StatCard title="Occupied Slots" value={stats.occupiedSlots} icon={<ChartBarIcon />} />
            <StatCard title="Occupancy Rate" value={`${stats.currentOccupancy.toFixed(1)}%`} icon={<ChartBarIcon />} />
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const MyParkingsList = () => {
    const [parkings, setParkings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchParkings = async () => {
            setLoading(true);
            try {
                const data = await apiService.getOwnerParkingAreas();
                if (Array.isArray(data)) {
                    setParkings(data);
                } else {
                    setError(data.message || 'Failed to load parking areas.');
                }
            } catch (err) {
                setError('A server error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchParkings();
    }, []);

    if (loading) return <div className="text-center py-10">Loading your parking areas...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">My Parking Areas</h2>
            {parkings.length > 0 ? (
                <div className="space-y-4">
                    {parkings.map(p => (
                        <div key={p._id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50 transition-colors">
                            <div className="flex items-center">
                                <img src={p.image || 'https://placehold.co/100x100/e2e8f0/4a5568?text=No+Img'} alt={p.name} className="w-16 h-16 rounded-md object-cover mr-4" />
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center"><MapPinIcon /> {p.locationId.name}, {p.locationId.city}</p>
                                </div>
                            </div>
                            <div>
                                <button className="text-sm bg-blue-500 text-white py-1 px-3 rounded-md hover:bg-blue-600">Edit</button>
                                <button className="text-sm bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 ml-2">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">You haven't listed any parking areas yet. Click the "Add New Parking" tab to get started.</p>
            )}
        </div>
    );
};

const CreateParkingForm = ({ setActiveTab }) => {
    const [formData, setFormData] = useState({
        name: '', totalSlots: '', image: '',
        locationName: '', city: '', lat: '', lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLocationSelect = (location) => {
        setFormData(prevData => ({
            ...prevData,
            lat: location.lat,
            lng: location.lng,
            city: location.city,
            locationName: location.locationName
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiService.createParkingArea(formData);
            if (response._id) {
                setActiveTab('myParkings');
            } else {
                setError(response.message || 'Failed to create parking area.');
            }
        } catch (err) {
            setError('A server error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Add a New Parking Area</h2>
            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField name="name" label="Parking Area Name" value={formData.name} onChange={handleChange} placeholder="e.g., Downtown Central Parking" required />
                    <InputField name="totalSlots" label="Total Number of Slots" type="number" value={formData.totalSlots} onChange={handleChange} placeholder="e.g., 50" required />
                    <InputField name="image" label="Image URL" value={formData.image} onChange={handleChange} placeholder="https://example.com/image.png" />
                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-2">Location Details</h3>
                        <p className="text-sm text-gray-500 mb-2">Fields below are auto-filled from the map. You can edit them if needed.</p>
                        <InputField name="locationName" label="Location Name / Street" value={formData.locationName} onChange={handleChange} placeholder="Auto-filled from map" required />
                        <InputField name="city" label="City" value={formData.city} onChange={handleChange} placeholder="Auto-filled from map" required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField name="lat" label="Latitude" value={formData.lat} onChange={handleChange} placeholder="Auto-filled" readOnly />
                            <InputField name="lng" label="Longitude" value={formData.lng} onChange={handleChange} placeholder="Auto-filled" readOnly />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 flex items-center justify-center mt-4">
                        <PlusCircleIcon />
                        {loading ? 'Creating...' : 'Create Parking Area'}
                    </button>
                </form>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Pin Location on Map</h3>
                    <p className="text-sm text-gray-500 mb-2">Search, use your current location, or click on the map to set the pin.</p>
                    <MapPicker onLocationSelect={handleLocationSelect} />
                </div>
            </div>
        </div>
    );
};

const InputField = ({ name, label, value, onChange, type = 'text', placeholder, required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
    </div>
);

export default OwnerDashboard;
