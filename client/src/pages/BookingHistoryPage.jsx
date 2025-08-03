import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/apiService';
import { Link, useNavigate } from 'react-router-dom';

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const RepeatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.18-3.182m-3.182-4.991v4.99" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


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


const RepeatBookingModal = ({ isOpen, onClose, slotId, showNotification }) => {
    const [availability, setAvailability] = useState({ loading: true, isAvailable: false, areaId: null });
    const [bookingDetails, setBookingDetails] = useState({ carNumber: '', startTime: '', endTime: '' });
    const [bookingLoading, setBookingLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && slotId) {
            const checkAvailability = async () => {
                setAvailability({ loading: true, isAvailable: false, areaId: null });
                try {
                    const response = await apiService.getSlotAvailability(slotId);
                    setAvailability({ loading: false, ...response });
                } catch (error) {
                    setAvailability({ loading: false, isAvailable: false, areaId: null });
                    showNotification('Could not check slot availability.', 'error');
                }
            };
            checkAvailability();
        }
    }, [isOpen, slotId, showNotification]);

    const handleBookingConfirm = async (e) => {
        e.preventDefault();
        setBookingLoading(true);
        try {
            const response = await apiService.bookSlot({ slotId, ...bookingDetails });
            if (response.booking) {
                showNotification('Booking successful!', 'success');
                onClose();
                navigate('/my-bookings');
            } else {
                showNotification(response.message || 'Failed to book slot.', 'error');
            }
        } catch (error) {
            showNotification('A server error occurred.', 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1001] p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon /></button>
                <h2 className="text-3xl font-bold mb-4">Repeat Booking</h2>
                
                {availability.loading ? (
                    <p>Checking slot availability...</p>
                ) : availability.isAvailable ? (
                    <form onSubmit={handleBookingConfirm} className="space-y-4">
                        <p className="text-gray-600">This slot is available. Please confirm your details to book again.</p>
                        <div>
                            <label htmlFor="carNumber" className="block text-sm font-medium text-gray-700 mb-1">Car Number</label>
                            <input type="text" name="carNumber" value={bookingDetails.carNumber} onChange={(e) => setBookingDetails({...bookingDetails, carNumber: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g., UP32-AB-1234" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <input type="datetime-local" name="startTime" value={bookingDetails.startTime} onChange={(e) => setBookingDetails({...bookingDetails, startTime: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <input type="datetime-local" name="endTime" value={bookingDetails.endTime} onChange={(e) => setBookingDetails({...bookingDetails, endTime: e.target.value})} required className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <button type="submit" disabled={bookingLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg disabled:bg-blue-400">{bookingLoading ? 'Booking...' : 'Confirm & Book'}</button>
                    </form>
                ) : (
                    <div>
                        <p className="text-red-600 font-semibold mb-4">This slot is currently unavailable.</p>
                        <p className="text-gray-600 mb-6">Would you like to view other available slots at this location?</p>
                        <Link to={`/parking/${availability.areaId}`} className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">View Parking Area</Link>
                    </div>
                )}
            </div>
        </div>
    );
};


const HistoryCard = ({ booking, onRepeatBooking }) => {
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
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center">
                <img src={parkingArea.image || 'https://placehold.co/100x100/e2e8f0/4a5568?text=No+Img'} alt={parkingArea.name} className="w-24 h-24 rounded-md object-cover mr-4 hidden sm:block" />
                <div>
                    <h3 className="font-bold text-xl text-gray-800">{parkingArea.name} - Slot {booking.parkingSlot.slotNumber}</h3>
                    <p className="text-sm text-gray-500 flex items-center mt-1"><MapPinIcon /> {location.name}, {location.city}</p>
                    <div className="text-sm text-gray-600 flex items-center mt-2"><CalendarIcon /><span>{formatDateTime(booking.startTime)}</span></div>
                </div>
            </div>
            <div className="flex flex-col items-start sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                {getStatusChip(booking.status)}
                <button 
                    onClick={() => onRepeatBooking(booking.parkingSlot._id)}
                    className="mt-2 text-sm bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition flex items-center cursor-pointer"
                >
                    <RepeatIcon /> Repeat Booking
                </button>
            </div>
        </div>
    );
};


const BookingHistoryPage = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [notification, setNotification] = useState({ isVisible: false, message: '', type: '' });

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

    const handleRepeatBookingClick = (slotId) => {
        setSelectedSlotId(slotId);
        setIsModalOpen(true);
    };

    const showNotification = (message, type) => {
        setNotification({ isVisible: true, message, type });
    };

    if (loading) return <div className="text-center py-10">Loading booking history...</div>;
    if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

    return (
        <div className="container mx-auto">
            {notification.isVisible && <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ isVisible: false, message: '', type: '' })} />}
            <RepeatBookingModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slotId={selectedSlotId}
                showNotification={showNotification}
            />

            <h1 className="text-4xl font-bold mb-6">Booking History</h1>
            {bookings.length > 0 ? (
                <div className="space-y-6">
                    {bookings.map(booking => <HistoryCard key={booking._id} booking={booking} onRepeatBooking={handleRepeatBookingClick} />)}
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
