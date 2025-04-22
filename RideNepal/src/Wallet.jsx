import React, { useState, useEffect } from 'react';
import { initiatePayment, getPaymentHistory } from './services/paymentService';
import { jwtDecode } from 'jwt-decode';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import './Wallet.css';

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showAllPayments, setShowAllPayments] = useState(false);
  const RECENT_PAYMENTS_COUNT = 3;
  const location = useLocation();

  // Parse URL parameters for Khalti redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get('status');
    const errorMessage = queryParams.get('message');
    const amount = queryParams.get('amount');
    const transactionId = queryParams.get('transaction_id');

    if (status === 'success' && amount) {
      setSuccessMessage(`Successfully loaded NPR ${amount} to your wallet. Transaction ID: ${transactionId}`);
      // Refresh payment history to show the new balance
      fetchPaymentHistory();
      // Clear the URL parameters after showing the message
      window.history.replaceState({}, document.title, '/wallet');
    } else if (status === 'error' && errorMessage) {
      setError(decodeURIComponent(errorMessage));
      // Clear the URL parameters after showing the error
      window.history.replaceState({}, document.title, '/wallet');
    }
  }, [location.search]);

  // Get userId from JWT token
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to access wallet');
      return null;
    }
    try {
      const decoded = jwtDecode(token);
      console.log('Decoded token:', decoded);
      return decoded.id; 
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Invalid session. Please login again.');
      return null;
    }
  };

  // Fetch payment history function (moved outside useEffect for reuse)
  const fetchPaymentHistory = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await getPaymentHistory(userId);
      console.log('Payment history response:', response);
      
      // Ensure we're setting an array
      if (response && response.payments) {
        setPaymentHistory(response.payments);
        
        // Calculate total balance from successful payments (convert from paisa to rupees)
        const totalBalance = response.payments
          .filter(payment => payment.status === 'success')
          .reduce((sum, payment) => {
            if (payment.paymentType === 'load') {
              // Add wallet loads
              return sum + (payment.amount / 100);
            } else if (payment.paymentType === 'ride' && payment.paymentGateway === 'wallet') {
              // Subtract ride payments
              return sum - (payment.amount / 100);
            }
            return sum;
          }, 0);
        setBalance(totalBalance);
      } else {
        setPaymentHistory([]);
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Failed to load payment history');
      setPaymentHistory([]);
      setBalance(0);
    }
  };

  // Fetch payment history on component mount
  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const handleLoadMoney = async () => {
    console.log('Load Money button clicked');
    
    // Clear previous messages
    setSuccessMessage(null);
    setError(null);
    
    // Validate amount
    if (!amount || parseInt(amount) < 10) {
      setError('Amount must be at least Rs. 10');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('Token present:', !!token);
    
    const userId = getUserId();
    console.log('User ID:', userId);
    
    if (!userId) {
      setError('Please login to access wallet');
      return;
    }

    setLoading(true);

    try {
      // Initialize payment with backend
      console.log('Initializing payment with backend...');
      
      const requestBody = {
        userId,
        amount: parseInt(amount)
      };
      console.log('Request body:', requestBody);

      // Make the POST request
      console.log('Making POST request to:', 'http://localhost:4000/api/payments/initialize');
      
      const response = await fetch('http://localhost:4000/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || `Failed to initialize payment (${response.status})`);
      }

      console.log('Backend response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Open payment URL in a new tab
      if (data.paymentInitiate && data.paymentInitiate.payment_url) {
        console.log('Opening payment URL in new tab:', data.paymentInitiate.payment_url);
        window.open(data.paymentInitiate.payment_url, '_blank');
        
        // Display message to user
        setSuccessMessage('A new window has opened with Khalti payment. After completing payment, you will be redirected back to this page.');
        // Clear amount field after successful initialization
        setAmount('');
      } else {
        throw new Error('Payment URL not received from server');
      }

    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayPayments = showAllPayments 
    ? paymentHistory 
    : paymentHistory.slice(0, RECENT_PAYMENTS_COUNT);

  return (
    <>
    <Header />
      <div className="page-container">
      <main className="main-content">
        <div className="wallet-container">
          <div className="wallet-card">
            <h2>My Wallet</h2>
            
            {/* Success message display */}
            {successMessage && (
              <div className="success-message">
                <p>{successMessage}</p>
              </div>
            )}
            
            <div className="balance-section">
              <h3>Current Balance</h3>
              <p className="balance">NPR {balance.toFixed(2)}</p>
            </div>
            
            <div className="load-money-section">
              <h3>Load Money</h3>
              <div className="input-group">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    console.log('Amount changed:', e.target.value);
                    setAmount(e.target.value);
                  }}
                  placeholder="Enter amount (min. Rs. 10)"
                  min="10"
                />
                <button 
                  onClick={handleLoadMoney}
                  disabled={loading}
                  className="load-btn"
                >
                  {loading ? 'Processing...' : 'Load Money'}
                </button>
              </div>
              {error && <p className="error">{error}</p>}
            </div>

            <div className="payment-history">
              <div className="history-header">
                <h3>Payment History</h3>
                {paymentHistory.length > RECENT_PAYMENTS_COUNT && (
                  <button 
                    className="see-all-btn"
                    onClick={() => setShowAllPayments(!showAllPayments)}
                  >
                    {showAllPayments ? 'Show Less' : 'See All'}
                  </button>
                )}
              </div>
              {!Array.isArray(paymentHistory) || paymentHistory.length === 0 ? (
                <p>No payment history found</p>
              ) : (
                <div className="history-list">
                  {displayPayments.map((payment) => (
                    <div key={payment.pidx} className={`history-item ${payment.status}`}>
                      <div className="payment-info">
                        <span className="amount">NPR {(payment.amount / 100).toFixed(2)}</span>
                        <span className="date">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="status">{payment.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
    </>
  );
}

