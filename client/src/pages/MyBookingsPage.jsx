import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';
import { Link } from 'react-router-dom';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const ExclamationTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, confirmText, confirmColor }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                <div className="flex justify-center mb-4"><ExclamationTriangleIcon /></div>
                <h2 className="text-2xl font-bold mb-4">{title}</h2>
                <div className="text-gray-600 mb-8">{children}</div>
                <div className="flex justify-center space-x-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded-lg transition">Cancel</button>
                    <button onClick={onConfirm} className={`bg-${confirmColor}-500 hover:bg-${confirmColor}-600 text-white font-bold py-2 px-6 rounded-lg transition`}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

const Notification = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const isSuccess = type === 'success';
    return (
        <div className={`fixed top-20 right-5 bg-white p-4 rounded-lg shadow-lg flex items-center border-l-4 ${isSuccess ? 'border-green-500' : 'border-red-500'} z-50`}>
            {isSuccess ? <CheckCircleIcon /> : <XCircleIcon />}
            <span className="text-gray-700">{message}</span>
        </div>
    );
};

const BookingCard = ({ booking, onCancel, onComplete }) => {
    const formatDateTime = (isoString) => new Date(isoString).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const getStatusChip = (status) => {
        const styles = { booked: 'bg-blue-100 text-blue-800', cancellation_requested: 'bg-yellow-100 text-yellow-800', completion_requested: 'bg-orange-100 text-orange-800', cancelled: 'bg-red-100 text-red-800' };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ').toUpperCase()}</span>;
    };

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const canCancel = startTime > now && booking.status === 'booked';
    const canComplete = now >= startTime && now < endTime && booking.status === 'booked';
    const parkingArea = booking.parkingSlot?.areaId;
    const location = parkingArea?.locationId;

    if (!parkingArea || !location) return <div className="border p-4 rounded-lg bg-red-50 text-red-700">Booking data is incomplete.</div>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="flex items-center">
                <img src={parkingArea.image || 'https://placehold.co/100x100/e2e8f0/4a5568?text=No+Img'} alt={parkingArea.name} className="w-24 h-24 rounded-md object-cover mr-4 hidden sm:block" />
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{parkingArea.name} - Slot {booking.parkingSlot.slotNumber}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1"><MapPinIcon /> {location.name}, {location.city}</p>
                    <div className="text-sm text-gray-600 flex items-center mt-2"><CalendarIcon /><span>{formatDateTime(booking.startTime)} to {formatDateTime(booking.endTime)}</span></div>
                </div>
            </div>
            <div className="flex flex-col items-start md:items-end w-full md:w-auto mt-4 md:mt-0">
                {getStatusChip(booking.status)}
                {canCancel && <button onClick={() => onCancel(booking._id)} className="mt-2 text-sm bg-yellow-500 text-white py-1 px-3 rounded-md hover:bg-yellow-600 transition">Request Cancellation</button>}
                {canComplete && <button onClick={() => onComplete(booking._id)} className="mt-2 text-sm bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 transition">Request to Complete Early</button>}
            </div>
        </div>
    );
};

const MyBookingsPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalState, setModalState] = useState({ isOpen: false, type: null, bookingId: null });
    const [notification, setNotification] = useState({ isVisible: false, message: '', type: '' });

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getUserBookings();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            showNotification('Failed to load bookings.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const showNotification = (message, type) => {
        setNotification({ isVisible: true, message, type });
    };

    const handleRequest = (type, bookingId) => {
        setModalState({ isOpen: true, type, bookingId });
    };

    const handleConfirmAction = async () => {
        const { type, bookingId } = modalState;
        if (!type || !bookingId) return;

        try {
            const apiCall = type === 'cancel' ? apiService.requestBookingCancellation : apiService.requestBookingCompletion;
            const response = await apiCall(bookingId);
            if (response.booking) {
                showNotification(response.message || 'Request sent successfully!', 'success');
                fetchBookings();
            } else {
                showNotification(response.message || 'Request failed.', 'error');
            }
        } catch (err) {
            showNotification('A server error occurred.', 'error');
            console.log('Error:', err);
        } finally {
            setModalState({ isOpen: false, type: null, bookingId: null });
        }
    };

    if (loading) return <div className="text-center py-10">Loading your bookings...</div>;

    return (
        <div className="container mx-auto">
            {notification.isVisible && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ isVisible: false, message: '', type: '' })} />}
            <ConfirmationModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, type: null, bookingId: null })}
                onConfirm={handleConfirmAction}
                title={`Confirm ${modalState.type === 'cancel' ? 'Cancellation' : 'Completion'}`}
                confirmText={`Confirm ${modalState.type === 'cancel' ? 'Cancellation' : 'Completion'}`}
                confirmColor={modalState.type === 'cancel' ? 'yellow' : 'green'}
            >
                <p>Are you sure you want to request to {modalState.type === 'cancel' ? 'cancel' : 'complete'} this booking?</p>
            </ConfirmationModal>

            <h1 className="text-4xl font-bold mb-6">My Active Bookings</h1>
            {bookings.length > 0 ? (
                <div className="space-y-6">
                    {bookings.map(booking => (
                        <BookingCard key={booking._id} booking={booking} onCancel={(id) => handleRequest('cancel', id)} onComplete={(id) => handleRequest('complete', id)} />
                    ))}
                </div>
            ) : (
                <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700">No Active Bookings</h2>
                    <p className="text-gray-500 mt-2 mb-6">You don't have any upcoming or active bookings.</p>
                    <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition">Find Parking</Link>
                </div>
            )}
        </div>
    );
};

export default MyBookingsPage;
