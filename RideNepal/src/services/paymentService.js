import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

export const initiatePayment = async (userId, amount) => {
  try {
    // Create payment record through API
    const response = await axios.post(`${API_URL}/payments`, {
      userId,
      amount
    });

    const payment = response.data;

    // Initialize Khalti payment
    const config = {
      publicKey: import.meta.env.VITE_KHALTI_PUBLIC_KEY,
      productIdentity: payment.pidx,
      productName: "Wallet Load",
      productUrl: "http://localhost:5173",
      eventHandler: {
        onSuccess: async (payload) => {
          // Verify payment with Khalti
          await verifyPayment(payment.pidx);
        },
        onError: async (error) => {
          await updatePaymentStatus(payment.pidx, 'failed');
        },
        onClose: async () => {
          await updatePaymentStatus(payment.pidx, 'canceled');
        }
      }
    };

    return config;
  } catch (error) {
    console.error('Payment initiation error:', error);
    throw error;
  }
};

export const verifyPayment = async (pidx) => {
  try {
    const response = await axios.post(`${API_URL}/payments/verify`, { pidx });
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

const updatePaymentStatus = async (pidx, status) => {
  try {
    await axios.post(`${API_URL}/payments/verify`, { pidx });
  } catch (error) {
    console.error('Payment status update error:', error);
    throw error;
  }
};

export const getPaymentHistory = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await axios.get(`${API_URL}/payments/history/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Payment history fetch error:', error);
    throw error;
  }
}; 