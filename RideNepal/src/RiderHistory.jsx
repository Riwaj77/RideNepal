import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RiderHistory.css';

export default function RiderHistory() {
  const navigate = useNavigate();
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const token = localStorage.getItem('riderToken');
        const riderData = localStorage.getItem('rider');
        
        console.log('Current token:', token);
        console.log('Current rider data:', riderData);

        if (!token || !riderData) {
          console.log('No token or rider data found, redirecting to login');
          navigate('/riderlogin');
          return;
        }

        // Parse rider data to get rider ID
        const rider = JSON.parse(riderData);
        console.log('Rider ID:', rider.id);

        const response = await axios.get('http://localhost:4000/api/ridehistories/rider', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('Ride history response:', response.data);
        
        if (response.data) {
          setRideHistory(response.data);
        } else {
          setRideHistory([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ride history:', error);
        if (error.response && error.response.status === 403) {
          alert('Your session has expired. Please log in again.');
          localStorage.clear();
          navigate('/riderlogin');
        } else {
          setError('Failed to load ride history');
          setLoading(false);
        }
      }
    };

    fetchRideHistory();
  }, [navigate]);

  const filteredRides = rideHistory.filter(ride => 
    ride.pickup.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ride.destination.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="rider-history-container">
        <h2 className="rider-history-title">Loading ride history...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rider-history-container">
        <h2 className="rider-history-title">{error}</h2>
        <button onClick={() => navigate('/riderhome')} className="back-button">Go Back</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} at ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="rider-history-container">
      <h1 className="rider-history-title">Ride History</h1>
      
      <input
        type="text"
        placeholder="Search by location..."
        className="search-bar"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {filteredRides.length === 0 ? (
        <div className="no-rides">
          <p>No ride history available</p>
        </div>
      ) : (
        <div className="rides-list">
          {filteredRides.map((ride) => (
            <div key={ride._id} className="ride-card">
              <div className="ride-route">
                {ride.pickup.address}
                <span className="route-arrow">→</span>
                {ride.destination.address}
              </div>
              <div className="ride-details">
                <span className="ride-time">{formatDate(ride.createdAt)}</span>
                <span className="ride-fare">Rs. {ride.fare}</span>
                <span className={`ride-status ${ride.status}`}>
                  {ride.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 