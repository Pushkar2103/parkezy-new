import { useState } from 'react';
import { createOrder } from '../api/paymentAPI';
import { load } from '@cashfreepayments/cashfree-js';
import CloseIcon from '@mui/icons-material/Close';

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const PaymentModal = ({ isOpen, onClose, bookingDetails, totalPrice, onBookingSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePaymentConfirm = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await createOrder({
        ...bookingDetails,
        amountPaid: totalPrice
      });

      console.log("createOrder response:", response);

      const { orderId, paymentSessionId } = response;

      if (!paymentSessionId) {
        throw new Error("Missing paymentSessionId from backend");
      }

      const cashfree = await load({
        mode: import.meta.env.REACT_APP_CASHFREE_MODE || 'sandbox',
      });

      console.log("Cashfree SDK loaded, starting checkout...");

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self', // change to '_blank' for debug if needed
      });

      // Note: cashfree.checkout redirects automatically on success/failure,
      // so this code after await checkout might not run.
      // But if it does, call onBookingSuccess here if you want.

    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon /></button>
        <h2 className="text-3xl font-bold mb-4">Complete Your Payment</h2>
        <div className="bg-gray-100 p-6 rounded-lg text-center mb-6">
          <p className="text-lg text-gray-600">Amount to Pay</p>
          <p className="text-5xl font-bold text-gray-800">₹{totalPrice.toLocaleString('en-IN')}</p>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-center">{error}</div>}
        <p className="text-center text-gray-500 text-sm mb-6">
          You will be redirected to our secure payment gateway to complete the transaction.
        </p>
        <button
          onClick={handlePaymentConfirm}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-indigo-400 flex items-center justify-center"
        >
          {loading ? <Spinner /> : 'Confirm Payment'}
        </button>
      </div>
    </div>
  );
};

export default PaymentModal;
