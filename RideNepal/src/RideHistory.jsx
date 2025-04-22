import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./RideHistory.css";

// Import icons for the menu
import personalDetailsIcon from './assets/images/menu_pd.png';
import walletIcon from './assets/images/wallet.png';
import historyIcon from './assets/images/ridehistory.png';
import driverIcon from './assets/images/menu_bike.png';
import helpIcon from './assets/images/menu_help.png';
import logoutIcon from './assets/images/menu_logout.png';

export default function RideHistory() {
  const navigate = useNavigate();
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllRides, setShowAllRides] = useState(false);
  
  // Number of rides to show initially
  const initialRideCount = 3;

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:4000/api/ridehistories/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setRideHistory(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        if (error.response && error.response.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError('Failed to load ride history. ' + (error.response?.data?.message || error.message));
          setLoading(false);
        }
      }
    };

    fetchRideHistory();
  }, [navigate]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }) + ' at ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };
  
  // Toggle between showing limited and all rides
  const toggleShowAllRides = () => {
    setShowAllRides(!showAllRides);
  };
  
  // Get rides to display based on showAllRides state
  const getDisplayedRides = () => {
    if (showAllRides || rideHistory.length <= initialRideCount) {
      return rideHistory;
    }
    return rideHistory.slice(0, initialRideCount);
  };

  if (loading) {
    return (
      <div className="rh_loading-container">
        <h2>Loading ride history...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rh_error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  const displayedRides = getDisplayedRides();

  return (
    <div className="rh_simple-history-container">
      <div className="rh_history-title-bar">
        <div className="rh_back-icon" onClick={() => navigate('/home')}>
          ←
        </div>
        <h1>Ride History</h1>
        {rideHistory.length > initialRideCount && (
          <button 
            className="rh_simple-see-all" 
            onClick={toggleShowAllRides}
          >
            {showAllRides ? 'Show Less' : 'See All'}
          </button>
        )}
      </div>
      
      {rideHistory.length === 0 ? (
        <div className="rh_no-rides">
          <p>No ride history available</p>
        </div>
      ) : (
        <div className="rh_simple-rides-list">
          {displayedRides.map((ride, index) => (
            <div key={ride._id || ride.id || index} className={`rh_simple-ride-card ${ride.status}`}>
              <div className="rh_simple-ride-header">
                <div className="rh_simple-route">
                  <span className="rh_simple-pickup">
                    {ride.pickup?.address || 
                    (ride.pickup?.coordinates ? 
                      `${ride.pickup.coordinates.lat.toFixed(4)}, ${ride.pickup.coordinates.lng.toFixed(4)}` : 
                      'Unknown pickup location')}
                  </span>
                  <span className="rh_simple-arrow">→</span>
                  <span className="rh_simple-destination">
                    {ride.destination?.address || 
                    (ride.destination?.coordinates ? 
                      `${ride.destination.coordinates.lat.toFixed(4)}, ${ride.destination.coordinates.lng.toFixed(4)}` : 
                      'Unknown destination')}
                  </span>
                </div>
                <div className="rh_simple-fare">Rs. {ride.fare || 0}</div>
              </div>
              <div className="rh_simple-ride-footer">
                <div className="rh_simple-date">
                  {formatDate(ride.completedAt || ride.createdAt || ride.bookingTime)}
                </div>
                <div className={`rh_simple-status ${ride.status}`}>
                  {ride.status || 'Unknown'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
