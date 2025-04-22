import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "./RiderProfile.css";

const RiderProfile = () => {
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRiderDetails = async () => {
      try {
        const token = localStorage.getItem('riderToken');
        if (!token) {
          navigate('/riderlogin');
          return;
        }

        const response = await axios.get('http://localhost:4000/riders/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setRider(response.data.rider);
        } else {
          setError('Failed to fetch rider details');
        }
      } catch (err) {
        console.error('Error fetching rider details:', err);
        setError('Failed to fetch rider details');
      } finally {
        setLoading(false);
      }
    };

    fetchRiderDetails();
  }, [navigate]);

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  if (loading) {
    return (
      <div className="rider-home-container">
        <header className="rider-header">
          <div className="rider-header-logo"></div>
          <div className="rider-status">
            <button className={`rider-status-toggle ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          <Link to="/riderprofile" className="rider-nav-link">Profile</Link>
          <Link to="/riderwallet" className="rider-nav-link">Wallet</Link>
          <Link to="/riderhistory" className="rider-nav-link">History</Link>
          <Link to="/about" className="rider-nav-link">About</Link>
          <Link to="/help" className="rider-nav-link">Help</Link>
          <Link to="/riderhome" className="rider-nav-link">Home</Link>
        </header>
        <div className="rider-dashboard">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading rider details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rider-home-container">
        <header className="rider-header">
          <div className="rider-header-logo"></div>
          <div className="rider-status">
            <button className={`rider-status-toggle ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          <Link to="/riderprofile" className="rider-nav-link">Profile</Link>
          <Link to="/riderwallet" className="rider-nav-link">Wallet</Link>
          <Link to="/riderhistory" className="rider-nav-link">History</Link>
          <Link to="/about" className="rider-nav-link">About</Link>
          <Link to="/help" className="rider-nav-link">Help</Link>
          <Link to="/riderhome" className="rider-nav-link">Home</Link>
        </header>
        <div className="rider-dashboard">
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rider-home-container">
      <header className="rider-header">
        <div className="rider-header-logo"></div>
        <div className="rider-status">
          <button 
            className={`rider-status-toggle ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleOnlineStatus}
          >
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
        <Link to="/riderprofile" className="rider-nav-link">Profile</Link>
        <Link to="/riderwallet" className="rider-nav-link">Wallet</Link>
        <Link to="/riderhistory" className="rider-nav-link">History</Link>
        <Link to="/about" className="rider-nav-link">About</Link>
        <Link to="/help" className="rider-nav-link">Help</Link>
        <Link to="/riderhome" className="rider-nav-link">Home</Link>
      </header>

      <div className="rider-dashboard">
        <div className="rider-profile-card">
          <div className="rider-profile-header">
            <div className="rider-profile-image">
              {rider?.image ? (
                <img src={rider.image} alt="Profile" className="rider-profile-img" />
              ) : (
                <div className="rider-profile-placeholder">No Image</div>
              )}
            </div>
            <h2>Rider Profile</h2>
          </div>
          
          <div className="rider-profile-details">
            <div className="rider-detail-row">
              <span className="rider-detail-label">Name:</span>
              <span className="rider-detail-value">{rider?.firstName} {rider?.lastName}</span>
            </div>
            
            <div className="rider-detail-row">
              <span className="rider-detail-label">Email:</span>
              <span className="rider-detail-value">{rider?.email}</span>
            </div>
            
            <div className="rider-detail-row">
              <span className="rider-detail-label">Phone:</span>
              <span className="rider-detail-value">{rider?.phone}</span>
            </div>
            
            <div className="rider-detail-row">
              <span className="rider-detail-label">License Number:</span>
              <span className="rider-detail-value">{rider?.licenseNumber}</span>
            </div>
            
            <div className="rider-detail-row">
              <span className="rider-detail-label">Vehicle Type:</span>
              <span className="rider-detail-value">{rider?.vehicleType}</span>
            </div>
            
            <div className="rider-detail-row">
              <span className="rider-detail-label">Vehicle Number:</span>
              <span className="rider-detail-value">{rider?.licensePlate}</span>
            </div>

            <div className="rider-document-section">
              <h3>Documents</h3>
              <div className="rider-document-images">
                <div className="rider-document-item">
                  <h4>Driver's License</h4>
                  {rider?.licenseImage ? (
                    <img src={rider.licenseImage} alt="Driver's License" className="rider-document-img" />
                  ) : (
                    <div className="rider-document-placeholder">No License Image</div>
                  )}
                </div>
                <div className="rider-document-item">
                  <h4>Insurance</h4>
                  {rider?.insuranceImage ? (
                    <img src={rider.insuranceImage} alt="Insurance" className="rider-document-img" />
                  ) : (
                    <div className="rider-document-placeholder">No Insurance Image</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rider-profile-actions">
            <button 
              className="rider-edit-profile-btn"
              onClick={() => navigate('/rider/editprofile')}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderProfile;