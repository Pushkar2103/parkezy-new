import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../api/apiService';

// --- ICONS ---
const CarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h2a4 4 0 014 4v2m-6 4h-2a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2zm-6-10V7m0 4h.01" /></svg>;
const MapPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const BackArrowIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;

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

const ParkingDetailsPage = () => {
  const { id } = useParams(); // Get parking area ID from URL
  const [area, setArea] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await apiService.getParkingAreaDetails(id);
        if (data.area && data.slots) {
          setArea(data.area);
          setSlots(data.slots);
        } else {
          setError(data.message || 'Could not fetch parking details.');
        }
      } catch (err) {
        setError('A server error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleSlotSelection = (slot) => {
    setSelectedSlot(slot);
    // Here you would typically open a booking modal
    console.log("Selected slot:", slot);
  };

  if (loading) {
    return <div className="text-center py-10">Loading Parking Details...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto">
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

          {selectedSlot && (
            <div className="p-8 border-t border-gray-200 bg-blue-50">
                <h2 className="text-2xl font-bold text-center">Confirm Booking for {selectedSlot.slotNumber}</h2>
                {/* Booking Form will go here */}
                <p className="text-center mt-4">Booking form component to be added.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ParkingDetailsPage;
