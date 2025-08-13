import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyPayment } from '../api/paymentAPI'; 

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Spinner = () => (
  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
);

const StatusCard = ({ status, message }) => {
  const statusConfig = {
    loading: {
      icon: <Spinner />,
      title: 'Verifying Payment...',
      message: 'Please wait while we confirm your transaction. Do not close this page.',
      color: 'text-gray-800',
      button: null,
    },
    success: {
      icon: <CheckCircleIcon />,
      title: 'Payment Successful!',
      message: message || 'Your booking is confirmed. You can view it in your bookings section.',
      color: 'text-green-600',
      button: <Link to="/my-bookings" className="mt-8 inline-block bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700">View My Bookings</Link>,
    },
    failed: {
      icon: <XCircleIcon />,
      title: 'Payment Failed',
      message: message || 'Unfortunately, we could not process your payment. Please try again.',
      color: 'text-red-600',
      button: <Link to="/parking-slots" className="mt-8 inline-block bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700">Try Again</Link>,
    },
    error: {
      icon: <XCircleIcon />,
      title: 'An Error Occurred',
      message: message || 'Something went wrong. Please contact support if the problem persists.',
      color: 'text-red-600',
      button: <Link to="/" className="mt-8 inline-block bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700">Go Home</Link>,

    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center max-w-lg w-full">
      <div className="mb-6">{currentStatus.icon}</div>
      <h1 className={`text-4xl font-bold mb-3 ${currentStatus.color}`}>{currentStatus.title}</h1>
      <p className="text-gray-600 text-lg">{currentStatus.message}</p>
      {currentStatus.button}
    </div>
  );
};


const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!orderId) {
      setStatus('error');
      setMessage('Invalid payment URL: missing order ID.');
      return;
    }

    const processVerification = async () => {
      try {
        const data = await verifyPayment(orderId);
        if (data.paymentStatus === 'PAID') {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment was not successful.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to connect to the server.');
      }
    };

    const timer = setTimeout(() => {
        processVerification();
    }, 2000);

    return () => clearTimeout(timer);
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <StatusCard status={status} message={message} />
      
    </div>
  );
};

export default PaymentSuccess;
