import axios from 'axios';

// Get environment variables with fallbacks
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || import.meta.env.VITE_KHALTI_SECRET_KEY;
const KHALTI_GATEWAY_URL = process.env.KHALTI_GATEWAY_URL || import.meta.env.VITE_KHALTI_GATEWAY_URL || 'https://a.khalti.com';

// Function to verify Khalti Payment
export async function verifyKhaltiPayment(pidx) {
  if (!pidx) {
    throw new Error('Payment ID (pidx) is required for verification');
  }

  if (!KHALTI_SECRET_KEY) {
    console.error('KHALTI_SECRET_KEY is not defined in environment variables');
    throw new Error('Missing Khalti configuration');
  }

  const headersList = {
    "Authorization": `Key ${KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify({ pidx });

  const reqOptions = {
    url: `${KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    return response.data;
  } catch (error) {
    console.error("Error verifying Khalti payment:", error.response?.data || error.message);
    throw error;
  }
}

// Function to initialize Khalti Payment
export async function initializeKhaltiPayment(details) {
  if (!details.amount || !details.purchase_order_id) {
    throw new Error('Amount and purchase_order_id are required');
  }

  if (!KHALTI_SECRET_KEY) {
    console.error('KHALTI_SECRET_KEY is not defined in environment variables');
    throw new Error('Missing Khalti configuration');
  }

  const headersList = {
    "Authorization": `Key ${KHALTI_SECRET_KEY}`,
    "Content-Type": "application/json",
  };

  const bodyContent = JSON.stringify(details);

  const reqOptions = {
    url: `${KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
    method: "POST",
    headers: headersList,
    data: bodyContent,
  };

  try {
    const response = await axios.request(reqOptions);
    return response.data;
  } catch (error) {
    console.error("Error initializing Khalti payment:", error.response?.data || error.message);
    throw error;
  }
} 