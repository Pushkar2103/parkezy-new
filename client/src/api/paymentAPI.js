import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

export const createOrder = async (orderData) => {
  const token = localStorage.getItem('parkezy_token');
  const response = await axios.post(
    `${API_BASE_URL}/payments/create-order`,
    orderData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const verifyPayment = async (orderId) => {
  const token = localStorage.getItem('parkezy_token');
  const response = await axios.post(
    `${API_BASE_URL}/payments/verify`,
    { orderId },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
