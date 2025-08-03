import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../../api/apiService';
import { useAuth } from '../../contexts/AuthContext';


const RequestList = ({ title, requests, type, onResponse }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {requests.length > 0 ? (
            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req._id} className="border p-4 rounded-lg bg-gray-50">
                        <p className="font-semibold text-gray-800">User: {req.userId.name} <span className="text-gray-500 font-normal">({req.userId.email})</span></p>
                        <p className="text-sm text-gray-600">Slot: {req.parkingSlot.slotNumber}</p>
                        <p className="text-sm text-gray-600">Car No: {req.carNumber}</p>
                        <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={() => onResponse(type, req._id, 'deny')} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 cursor-pointer rounded-md">Deny</button>
                            <button onClick={() => onResponse(type, req._id, 'approve')} className="text-sm bg-green-500 hover:bg-green-600 text-white cursor-pointer font-bold py-1 px-3 rounded-md">Approve</button>
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
    const { refreshRequestCount } = useAuth();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const [cancelData, completeData] = await Promise.all([
                apiService.getCancellationRequests(),
                apiService.getCompletionRequests()
            ]);
            setCancellations(Array.isArray(cancelData) ? cancelData : []);
            setCompletions(Array.isArray(completeData) ? completeData : []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleResponse = async (type, bookingId, decision) => {
        try {
            const apiCall = type === 'cancel' ? apiService.respondToCancellation : apiService.respondToCompletion;
            await apiCall(bookingId, decision);
            fetchRequests();
            refreshRequestCount(); // Notify context to update the badge
        } catch (error) {
            alert('Failed to process request.');
        }
    };

    if (loading) return <div className="text-center py-10">Loading requests...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RequestList title="Cancellation Requests" requests={cancellations} type="cancel" onResponse={handleResponse} />
            <RequestList title="Early Completion Requests" requests={completions} type="complete" onResponse={handleResponse} />
        </div>
    );
};

export default RequestsPage;
