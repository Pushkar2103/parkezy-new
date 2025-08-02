import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';

export const EditParkingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', image: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchParking = async () => {
            const parkings = await apiService.getOwnerParkingAreas();
            const parkingToEdit = parkings.find(p => p._id === id);
            if (parkingToEdit) {
                setFormData({ name: parkingToEdit.name, image: parkingToEdit.image || '' });
            } else {
                setError('Parking area not found.');
            }
            setLoading(false);
        };
        fetchParking();
    }, [id]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiService.updateParkingArea(id, formData);
            if (response._id) navigate('/owner-dashboard/parkings');
            else setError(response.message || 'Failed to update parking area.');
        } catch (err) {
            setError('A server error occurred.');
        } finally {
            setLoading(false);
        }
    };
    
    if (loading) return <div>Loading...</div>;

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-6">Edit Parking Area</h2>
            {error && <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <InputField name="name" label="Parking Area Name" value={formData.name} onChange={handleChange} required />
                <InputField name="image" label="Image URL" value={formData.image} onChange={handleChange} />
                <div className="flex items-center space-x-4 pt-4">
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center">
                        <PencilIcon /> {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => navigate('/owner-dashboard/parkings')} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg">Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditParkingPage;