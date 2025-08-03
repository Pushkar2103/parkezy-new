import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../api/apiService';
import HalfScreenLoader from '../../components/HalfScreenLoader';

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <div className="flex justify-center mb-4"><ExclamationTriangleIcon /></div>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <div className="text-gray-600 mb-8">{children}</div>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition cursor-pointer">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition cursor-pointer flex items-center justify-center disabled:bg-red-400">
                        {loading && <LoadingSpinner />}
                        {loading ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MyParkingsPage = () => {
    const [parkings, setParkings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [parkingToDelete, setParkingToDelete] = useState(null);
    const navigate = useNavigate();

    const fetchParkings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiService.getOwnerParkingAreas();
            setParkings(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'A server error occurred.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchParkings(); }, [fetchParkings]);

    const handleDeleteClick = (parking) => {
        setParkingToDelete(parking);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!parkingToDelete) return;
        setDeleteLoading(true);
        try {
            await apiService.deleteParkingArea(parkingToDelete._id);
            setIsModalOpen(false);
            setParkingToDelete(null);
            fetchParkings();
        } catch (err) {
            setError(err.response?.data?.message || 'A server error occurred during deletion.');
            setIsModalOpen(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) return <div className="text-center py-10"><HalfScreenLoader /> <div>Loading...</div></div>;

    return (
        <>
            <ConfirmationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirmDelete} title="Are you sure?" loading={deleteLoading}>
                This action cannot be undone. This will permanently delete the <strong>{parkingToDelete?.name}</strong> parking area and all of its associated data.
            </ConfirmationModal>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">My Parking Areas</h2>
                {error && <div className="text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
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
                                <div className="flex space-x-2">
                                    <button onClick={() => navigate(`/owner-dashboard/parkings/edit/${p._id}`)} className="text-sm cursor-pointer bg-blue-500 text-white py-2 px-3 rounded-md hover:bg-blue-600 flex items-center"><PencilIcon /> Edit</button>
                                    <button onClick={() => handleDeleteClick(p)} className="text-sm bg-red-500 text-white py-2 px-3 rounded-md cursor-pointer hover:bg-red-600 flex items-center"><TrashIcon /> Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">You haven't listed any parking areas yet. Click the "Add New Parking" tab to get started.</p>
                )}
            </div>
        </>
    );
};

export default MyParkingsPage;
