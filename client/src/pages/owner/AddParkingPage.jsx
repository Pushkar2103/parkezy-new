import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import MapPicker from '../../components/MapPicker';

// --- ICONS ---
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

// --- Reusable Input Field Component ---
const InputField = ({ name, label, value, onChange, type = 'text', placeholder, required = false, readOnly = false }) => (
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
            readOnly={readOnly}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
    </div>
);

// --- Main Page Component ---
const AddParkingPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        totalSlots: '',
        image: '',
        locationName: '',
        city: '',
        lat: '',
        lng: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Callback function to update form with data from the map
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
                // On success, navigate to the list of parkings
                navigate('/owner-dashboard/parkings');
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
                {/* Left Side: Form Fields */}
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

                {/* Right Side: Map */}
                <div>
                    <h3 className="font-semibold text-lg mb-2">Pin Location on Map</h3>
                    <p className="text-sm text-gray-500 mb-2">Search, use your current location, or click on the map to set the pin.</p>
                    <MapPicker onLocationSelect={handleLocationSelect} />
                </div>
            </div>
        </div>
    );
};

export default AddParkingPage;
