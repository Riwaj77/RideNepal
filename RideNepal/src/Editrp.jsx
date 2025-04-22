import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import "./Editrp.css";

const Editrp = () => {
  const navigate = useNavigate();
  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: 'motorcycle',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    licenseNumber: '',
    licenseExpiry: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewProfile, setPreviewProfile] = useState('');
  const [licenseImage, setLicenseImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [previewLicense, setPreviewLicense] = useState('');
  const [previewInsurance, setPreviewInsurance] = useState('');

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
          setFormData({
            firstName: response.data.rider.firstName,
            lastName: response.data.rider.lastName,
            email: response.data.rider.email,
            phone: response.data.rider.phone,
            address: response.data.rider.address,
            vehicleType: response.data.rider.vehicleType,
            vehicleModel: response.data.rider.vehicleModel,
            vehicleYear: response.data.rider.vehicleYear,
            licensePlate: response.data.rider.licensePlate,
            licenseNumber: response.data.rider.licenseNumber,
            licenseExpiry: response.data.rider.licenseExpiry.split('T')[0],
          });
          setPreviewProfile(response.data.rider.image);
          setPreviewLicense(response.data.rider.licenseImage);
          setPreviewInsurance(response.data.rider.insuranceImage);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'profile') {
        setProfileImage(file);
        setPreviewProfile(URL.createObjectURL(file));
      } else if (type === 'license') {
        setLicenseImage(file);
        setPreviewLicense(URL.createObjectURL(file));
      } else {
        setInsuranceImage(file);
        setPreviewInsurance(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('riderToken');
      if (!token) {
        navigate('/riderlogin');
        return;
      }

      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      if (profileImage) formDataObj.append('image', profileImage);
      if (licenseImage) formDataObj.append('licenseImage', licenseImage);
      if (insuranceImage) formDataObj.append('insuranceImage', insuranceImage);

      const response = await axios.put('http://localhost:4000/riders/profile', formDataObj, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.message === 'Rider updated successfully!') {
        alert('Profile updated successfully!');
        navigate('/riderprofile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  if (loading) {
    return (
      <div className="editrp-container">
        <header className="editrp-header">
          <div className="editrp-header-logo"></div>
          <div className="editrp-status">
            <button className={`editrp-status-toggle ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </button>
          </div>
          <Link to="/riderprofile" className="editrp-nav-link">Profile</Link>
          <Link to="/riderwallet" className="editrp-nav-link">Wallet</Link>
          <Link to="/riderhistory" className="editrp-nav-link">History</Link>
          <Link to="/about" className="editrp-nav-link">About</Link>
          <Link to="/help" className="editrp-nav-link">Help</Link>
          <Link to="/riderhome" className="editrp-nav-link">Home</Link>
        </header>
        <div className="editrp-dashboard">
          <div className="editrp-loading-container">
            <div className="editrp-loading-spinner"></div>
            <p>Loading rider details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editrp-container">
      <header className="editrp-header">
        <div className="editrp-header-logo"></div>
        <div className="editrp-status">
          <button 
            className={`editrp-status-toggle ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleOnlineStatus}
          >
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
        <Link to="/riderprofile" className="editrp-nav-link">Profile</Link>
        <Link to="/riderwallet" className="editrp-nav-link">Wallet</Link>
        <Link to="/riderhistory" className="editrp-nav-link">History</Link>
        <Link to="/about" className="editrp-nav-link">About</Link>
        <Link to="/help" className="editrp-nav-link">Help</Link>
        <Link to="/riderhome" className="editrp-nav-link">Home</Link>
      </header>

      <div className="editrp-dashboard">
        <div className="editrp-profile-card">
          <div className="editrp-profile-header">
            <h2>Edit Profile</h2>
          </div>

          <form onSubmit={handleSubmit} className="editrp-form">
            <div className="editrp-profile-image-section">
              <div className="editrp-profile-image-container">
                <label className="editrp-form-label">Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'profile')}
                  className="editrp-form-input"
                />
                {previewProfile && (
                  <img src={previewProfile} alt="Profile Preview" className="editrp-profile-preview" />
                )}
              </div>
            </div>

            <div className="editrp-form-grid">
              <div className="editrp-form-group">
                <label className="editrp-form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Vehicle Model</label>
                <input
                  type="text"
                  name="vehicleModel"
                  value={formData.vehicleModel}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">Vehicle Year</label>
                <input
                  type="number"
                  name="vehicleYear"
                  value={formData.vehicleYear}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">License Plate</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>

              <div className="editrp-form-group">
                <label className="editrp-form-label">License Expiry Date</label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleInputChange}
                  className="editrp-form-input"
                  required
                />
              </div>
            </div>

            <div className="editrp-document-upload-section">
              <div className="editrp-document-upload">
                <label className="editrp-form-label">Driver's License</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'license')}
                  className="editrp-form-input"
                />
                {previewLicense && (
                  <img src={previewLicense} alt="License Preview" className="editrp-document-preview" />
                )}
              </div>

              <div className="editrp-document-upload">
                <label className="editrp-form-label">Insurance Document</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'insurance')}
                  className="editrp-form-input"
                />
                {previewInsurance && (
                  <img src={previewInsurance} alt="Insurance Preview" className="editrp-document-preview" />
                )}
              </div>
            </div>

            <div className="editrp-form-actions">
              <button type="submit" className="editrp-save-button" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="editrp-cancel-button" onClick={() => navigate('/riderprofile')}>
                Cancel
              </button>
            </div>
          </form>

          {error && <div className="editrp-error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default Editrp; 