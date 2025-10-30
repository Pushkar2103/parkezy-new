import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import MapPicker from '../../components/MapPicker';

const PlusCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const LoadingSpinner = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const InputField = ({ name, label, value, onChange, type = 'text', placeholder, required = false, readOnly = false, ...props }) => (
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
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            {...props}
        />
    </div>
);

const AddParkingPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        totalSlots: '',
        locationName: '',
        city: '',
        lat: '',
        lng: '',
        pricePerHour: '',
        parkingImage: null,
        parkingType: 'open-air',
        evCharging: false,
        securityFeatures: {
            cctv: false,
            securityGuard: false,
            gatedAccess: false,
            lighting: false
        },
        vehicleTypes: []
    });
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;
        if (name === 'parkingImage' && files[0]) {
            setFormData({ ...formData, parkingImage: files[0] });
            setPreview(URL.createObjectURL(files[0]));
        } else if (type === 'checkbox' && name === 'evCharging') {
            setFormData({ ...formData, evCharging: checked });
        } else if (name.startsWith('security_')) {
            const feature = name.replace('security_', '');
            setFormData({
                ...formData,
                securityFeatures: {
                    ...formData.securityFeatures,
                    [feature]: checked
                }
            });
        } else if (name === 'vehicleType') {
            const vehicleTypes = formData.vehicleTypes.includes(value)
                ? formData.vehicleTypes.filter(t => t !== value)
                : [...formData.vehicleTypes, value];
            setFormData({ ...formData, vehicleTypes });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleLocationSelect = ({ lat, lng, city, locationName }) => {
        setFormData(prev => ({
            ...prev,
            lat,
            lng,
            city: city || prev.city,
            locationName: locationName || prev.locationName
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiService.createParkingArea(formData);
            if (response.data._id) {
                navigate('/owner-dashboard/parkings');
            } else {
                setError(response.data.message || 'Failed to create parking area.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'A server error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Add a New Parking Area</h2>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField name="name" label="Parking Area Name" value={formData.name} placeholder="e.g., Downtown Central Parking" onChange={handleChange} required />
                    <InputField name="totalSlots" label="Total Slots" type="number" value={formData.totalSlots} placeholder="e.g., 50" onChange={handleChange} required min="1" />
                    <InputField name="pricePerHour" label="Price Per Hour in INR(₹)" type="number" value={formData.pricePerHour} placeholder="e.g., 50" onChange={handleChange} min="0" />

                    {/* Parking Type */}
                    <div>
                        <label htmlFor="parkingType" className="block text-sm font-medium text-gray-700 mb-1">Parking Type</label>
                        <select
                            name="parkingType"
                            id="parkingType"
                            value={formData.parkingType}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="open-air">Open Air</option>
                            <option value="covered">Covered</option>
                            <option value="mixed">Mixed</option>
                        </select>
                    </div>

                    {/* EV Charging */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="evCharging"
                            id="evCharging"
                            checked={formData.evCharging}
                            onChange={handleChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="evCharging" className="ml-2 text-sm font-medium text-gray-700">EV Charging Available</label>
                    </div>

                    {/* Security Features */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Security Features</label>
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
                                        name={`security_${feature.value}`}
                                        id={`security_${feature.value}`}
                                        checked={formData.securityFeatures[feature.value]}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`security_${feature.value}`} className="ml-2 text-sm text-gray-700">{feature.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Vehicle Types */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Accepted Vehicle Types</label>
                        <div className="space-y-2">
                            {[
                                { value: 'bike', label: 'Bike' },
                                { value: 'car', label: 'Car' },
                                { value: 'compact-suv', label: 'Compact SUV' },
                                { value: 'full-suv', label: 'Full-Size SUV' },
                                { value: 'truck', label: 'Truck' }
                            ].map(vehicle => (
                                <div key={vehicle.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="vehicleType"
                                        value={vehicle.value}
                                        id={`vehicle_${vehicle.value}`}
                                        checked={formData.vehicleTypes.includes(vehicle.value)}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`vehicle_${vehicle.value}`} className="ml-2 text-sm text-gray-700">{vehicle.label}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Parking Image</label>
                        <div className="mt-1 flex items-center">
                            <span className="inline-block h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                                {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.993A2 2 0 002 18h20a2 2 0 002 2.993zM12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>}
                            </span>
                            <input type="file" name="parkingImage" ref={fileInputRef} onChange={handleChange} className="hidden" accept="image/*" />
                            <button type="button" onClick={() => fileInputRef.current.click()} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">Choose File</button>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold text-lg mb-2">Location Details</h3>
                        <InputField name="locationName" label="Location Name / Street" value={formData.locationName} placeholder="Auto-filled from map" onChange={handleChange} required />
                        <InputField name="city" label="City" value={formData.city} placeholder="Auto-filled from map" onChange={handleChange} required />
                        <div className="grid grid-cols-2 gap-4">
                            <InputField name="lat" label="Latitude" value={formData.lat} onChange={handleChange} readOnly />
                            <InputField name="lng" label="Longitude" value={formData.lng} onChange={handleChange} readOnly />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center mt-4 cursor-pointer disabled:bg-blue-400">
                        {loading && <LoadingSpinner />}
                        <PlusCircleIcon /> {loading ? 'Creating...' : 'Create Parking Area'}
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

export default AddParkingPage;
