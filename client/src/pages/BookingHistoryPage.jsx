import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';
import { Link } from 'react-router-dom';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;

const HistoryCard = ({ booking }) => {
    const formatDateTime = (isoString) => new Date(isoString).toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const getStatusChip = (status) => {
        const styles = {
            cancelled: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status.toUpperCase()}</span>;
    };

    const parkingArea = booking.parkingSlot?.areaId;
    const location = parkingArea?.locationId;

    if (!parkingArea || !location) return null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex justify-between items-center">
            <div className="flex items-center">
                <img src={parkingArea.image || 'https://placehold.co/100x100/e2e8f0/4a5568?text=No+Img'} alt={parkingArea.name} className="w-24 h-24 rounded-md object-cover mr-4 hidden sm:block" />
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{parkingArea.name} - Slot {booking.parkingSlot.slotNumber}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1"><MapPinIcon /> {location.name}, {location.city}</p>
                    <div className="text-sm text-gray-600 flex items-center mt-2"><CalendarIcon /><span>{formatDateTime(booking.startTime)}</span></div>
                </div>
            </div>
            {getStatusChip(booking.status)}
        </div>
    );
};

const BookingHistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const data = await apiService.getUserBookingHistory();
                setBookings(Array.isArray(data) ? data : []);
            } catch (err) {
                setError('A server error occurred.');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div className="text-center py-10">Loading booking history...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold mb-6">Booking History</h1>
            {bookings.length > 0 ? (
                <div className="space-y-6">
                    {bookings.map(booking => <HistoryCard key={booking._id} booking={booking} />)}
                </div>
            ) : (
                <div className="text-center bg-white p-10 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-700">No Past Bookings</h2>
                    <p className="text-gray-500 mt-2">Your completed and cancelled bookings will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default BookingHistoryPage;
