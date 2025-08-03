import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../api/apiService';
import { useAuth } from '../../contexts/AuthContext';
import HalfScreenLoader from '../../components/HalfScreenLoader';

const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LoadingSpinner = () => <svg className="animate-spin h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;


const Notification = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const isSuccess = type === 'success';
    return (
        <div className={`fixed top-20 right-5 bg-white p-4 rounded-lg shadow-lg flex items-center border-l-4 ${isSuccess ? 'border-green-500' : 'border-red-500'} z-[1002]`}>
            {isSuccess ? <CheckCircleIcon /> : <XCircleIcon />}
            <span className="text-gray-700">{message}</span>
        </div>
    );
};

const RequestList = ({ title, requests, type, onResponse, processingId }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {requests.length > 0 ? (
            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req._id} className="border p-4 rounded-lg bg-gray-50">
                        <p className="font-semibold text-gray-800">User: {req.userId.name} <span className="text-gray-500 font-normal">({req.userId.email})</span></p>
                        <p className="text-sm text-gray-600">Parking: {req.parkingSlot?.areaId?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Slot: {req.parkingSlot.slotNumber}</p>
                        <p className="text-sm text-gray-600">Car No: {req.carNumber}</p>
                        <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={() => onResponse(type, req._id, 'deny')} disabled={processingId === req._id} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 cursor-pointer rounded-md disabled:opacity-50">
                                {processingId === req._id ? <LoadingSpinner /> : 'Deny'}
                            </button>
                            <button onClick={() => onResponse(type, req._id, 'approve')} disabled={processingId === req._id} className="text-sm bg-green-500 hover:bg-green-600 text-white cursor-pointer font-bold py-1 px-3 rounded-md flex items-center disabled:bg-green-300">
                                {processingId === req._id && <LoadingSpinner />}
                                {processingId === req._id ? 'Processing...' : 'Approve'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-500">No pending {title.toLowerCase()} found.</p>
        )}
    </div>
);

const RequestsPage = () => {
    const [cancellations, setCancellations] = useState([]);
    const [completions, setCompletions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [notification, setNotification] = useState({ isVisible: false, message: '', type: '' });
    const { refreshRequestCount } = useAuth();

    const fetchRequests = useCallback(async () => {
        try {
            const [cancelResponse, completeResponse] = await Promise.all([
                apiService.getCancellationRequests(),
                apiService.getCompletionRequests()
            ]);
            setCancellations(cancelResponse.data);
            setCompletions(completeResponse.data);
        } catch (err) {
            showNotification(err.response?.data?.message || "Error fetching requests.", 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const showNotification = (message, type) => {
        setNotification({ isVisible: true, message, type });
    };

    const handleResponse = async (type, bookingId, decision) => {
        setProcessingId(bookingId);
        try {
            const apiCall = type === 'cancel' ? apiService.respondToCancellation : apiService.respondToCompletion;
            const response = await apiCall(bookingId, decision);
            showNotification(response.data.message || 'Action successful!', 'success');
            fetchRequests();
            refreshRequestCount();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Failed to process request.', 'error');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <div className="text-center py-10"><HalfScreenLoader/>Loading requests...</div>;

    return (
        <>
            {notification.isVisible && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ isVisible: false, message: '', type: '' })} />}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RequestList title="Cancellation Requests" requests={cancellations} type="cancel" onResponse={handleResponse} processingId={processingId} />
                <RequestList title="Early Completion Requests" requests={completions} type="complete" onResponse={handleResponse} processingId={processingId} />
            </div>
        </>
    );
};

export default RequestsPage;
