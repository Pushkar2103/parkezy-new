import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api/apiService';

const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>; 
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const Spinner = () => <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;

const ParkingDetailsSkeleton = () => (
    <div className="container mx-auto animate-pulse">
        <div className="inline-block h-6 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="md:flex">
                <div className="md:flex-shrink-0">
                    <div className="h-64 w-full bg-gray-200 md:w-64"></div>
                </div>
                <div className="p-8 w-full">
                    <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="h-5 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
            <div className="p-8 border-t border-gray-200">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="flex flex-wrap justify-center bg-gray-100 p-4 rounded-lg">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-20 h-20 m-2 rounded-lg bg-gray-200"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const ParkingSlot = ({ slot, onSelect }) => {
    const isAvailable = slot.isAvailable;
    const baseClasses = "flex flex-col items-center justify-center w-20 h-20 m-2 rounded-lg border-2 transition-transform duration-200 transform";
    const availableClasses = "bg-green-100 border-green-400 text-green-800 hover:bg-green-200 hover:scale-105 cursor-pointer";
    const unavailableClasses = "bg-red-100 border-red-400 text-red-800 cursor-not-allowed opacity-60";

    return (
        <div
            onClick={() => isAvailable && onSelect(slot)}
            className={`${baseClasses} ${isAvailable ? availableClasses : unavailableClasses}`}
        >
            <span className="font-bold text-lg">{slot.slotNumber}</span>
            <span className="text-xs">{isAvailable ? 'Available' : 'Booked'}</span>
        </div>
    );
};

const BookingModal = ({ isOpen, onClose, slot, area, onBookingSuccess }) => {
    const [bookingDetails, setBookingDetails] = useState({ carNumber: '', startTime: '', endTime: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (slot) {
            setBookingDetails({ carNumber: '', startTime: '', endTime: '' });
            setError('');
        }
    }, [slot]);

    if (!isOpen || !slot || !area) return null;

    const handleInputChange = (e) => {
        setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
    };

    const handleBookingConfirm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await apiService.bookSlot({
                slotId: slot._id,
                ...bookingDetails
            });
            onBookingSuccess(response.data.booking);
        } catch (err) {
            setError(err.response?.data?.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl font-bold mb-2">Confirm Your Booking</h2>
                <p className="text-gray-600 mb-6">You are booking slot <span className="font-bold text-blue-600">{slot.slotNumber}</span> at <span className="font-bold">{area.name}</span>.</p>
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

                <form onSubmit={handleBookingConfirm} className="space-y-4">
                    <div>
                        <label htmlFor="carNumber" className="block text-sm font-medium text-gray-700 mb-1">Car Number</label>
                        <input type="text" name="carNumber" id="carNumber" value={bookingDetails.carNumber} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" placeholder="e.g., UP32-AB-1234" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input type="datetime-local" name="startTime" id="startTime" value={bookingDetails.startTime} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input type="datetime-local" name="endTime" id="endTime" value={bookingDetails.endTime} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500" />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 flex items-center justify-center">
                        {loading && <Spinner />}
                        {loading ? 'Confirming...' : 'Confirm & Book Slot'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const SuccessNotification = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed top-20 right-5 bg-white p-4 rounded-lg shadow-lg flex items-center border-l-4 border-green-500 z-50">
            <CheckCircleIcon />
            <div>
                <p className="font-bold">Success!</p>
                <p className="text-sm text-gray-600">{message}</p>
            </div>
            <button onClick={onDismiss} className="ml-4 text-gray-400 hover:text-gray-600">
                <CloseIcon />
            </button>
        </div>
    );
};

const ParkingDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [area, setArea] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingSuccessMessage, setBookingSuccessMessage] = useState('');

    const fetchDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiService.getParkingAreaDetails(id);
            setArea(response.data.area);
            setSlots(response.data.slots);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not fetch parking details.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchDetails();
    }, [fetchDetails]);

    const handleSlotSelection = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleBookingSuccess = (booking) => {
        setIsModalOpen(false);
        setSelectedSlot(null);
        setBookingSuccessMessage(`Your booking for slot ${booking.parkingSlot?.slotNumber} is confirmed!`);
        fetchDetails();
    };

    if (loading) return <ParkingDetailsSkeleton />;
    if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto">
            {bookingSuccessMessage && (
                <SuccessNotification message={bookingSuccessMessage} onDismiss={() => setBookingSuccessMessage('')} />
            )}

            <BookingModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slot={selectedSlot}
                area={area}
                onBookingSuccess={handleBookingSuccess}
            />

            <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:underline mb-6">
                <BackArrowIcon />
                Back to Dashboard
            </Link>

            {area && (
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="md:flex">
                        <div className="md:flex-shrink-0">
                            <img 
                                className="h-64 w-full object-cover md:w-64" 
                                src={area.image || 'https://placehold.co/600x400/e2e8f0/4a5568?text=Parkezy'} 
                                alt={area.name}
                            />
                        </div>
                        <div className="p-8">
                            <h1 className="text-4xl font-bold text-gray-800">{area.name}</h1>
                            <div className="flex items-center text-gray-500 mt-2">
                                <MapPinIcon />
                                <span className="ml-2">{area.locationId.name}, {area.locationId.city}</span>
                            </div>
                            <p className="mt-4 text-gray-600">Select an available slot to proceed with your booking.</p>
                        </div>
                    </div>
                    
                    <div className="p-8 border-t border-gray-200">
                        <h2 className="text-2xl font-bold mb-4">Available Slots</h2>
                        <div className="flex flex-wrap justify-center bg-gray-50 p-4 rounded-lg">
                            {slots.map(slot => (
                                <ParkingSlot key={slot._id} slot={slot} onSelect={handleSlotSelection} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParkingDetailsPage;