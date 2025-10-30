import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import HalfScreenLoader from '../../components/HalfScreenLoader';

const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;

const EditParkingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
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
    const [currentImage, setCurrentImage] = useState('');
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchParking = async () => {
            try {
                const response = await apiService.getOwnerParkingAreas();
                const parkingToEdit = response.data.find(p => p._id === id);
                if (parkingToEdit) {
                    setFormData({
                        name: parkingToEdit.name,
                        pricePerHour: parkingToEdit.pricePerHour,
                        parkingImage: null,
                        parkingType: parkingToEdit.parkingType || 'open-air',
                        evCharging: parkingToEdit.evCharging || false,
                        securityFeatures: parkingToEdit.securityFeatures || {
                            cctv: false,
                            securityGuard: false,
                            gatedAccess: false,
                            lighting: false
                        },
                        vehicleTypes: parkingToEdit.vehicleTypes || []
                    });
                    setCurrentImage(parkingToEdit.image || '');
                } else {
                    setError('Parking area not found.');
                }
            } catch (err) {
                setError('Failed to fetch parking data.');
            } finally {
                setLoading(false);
            }
        };
        fetchParking();
    }, [id]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        setError('');
        try {
            const response = await apiService.updateParkingArea(id, formData);
            if (response.data._id) {
                navigate('/owner-dashboard/parkings');
            } else {
                setError(response.data.message || 'Failed to update parking area.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'A server error occurred.');
        } finally {
            setSubmitLoading(false);
        }
    };
    
    if (loading) return <div className="text-center py-10"><HalfScreenLoader/> <div>Loading...</div></div>;

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Parking Area</h2>
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Parking Area Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (₹)</label>
                    <input
                        id="pricePerHour"
                        name="pricePerHour"
                        type="number"
                        value={formData.pricePerHour}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Parking Image</label>
                    <div className="mt-1 flex items-center">
                        <span className="inline-block h-20 w-20 rounded-md overflow-hidden bg-gray-100">
                            <img src={preview || currentImage || 'https://placehold.co/200x200/e2e8f0/4a5568?text=No+Img'} alt="Preview" className="h-full w-full object-cover" />
                        </span>
                        <input type="file" name="parkingImage" ref={fileInputRef} onChange={handleChange} className="hidden" accept="image/*" />
                        <button type="button" onClick={() => fileInputRef.current.click()} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 cursor-pointer hover:bg-gray-50">Change Image</button>
                    </div>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                    <button type="submit" disabled={submitLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center cursor-pointer disabled:bg-blue-400">
                        {submitLoading && <HalfScreenLoader />}
                        <PencilIcon /> {submitLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => navigate('/owner-dashboard/parkings')} className="w-full bg-gray-200 hover:bg-gray-300 cursor-pointer text-gray-800 font-bold py-3 px-4 rounded-lg">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditParkingPage;
