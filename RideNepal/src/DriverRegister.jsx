import React, { useState } from 'react';
import './DriverRegister.css';
export default function DriverRegister()  {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    vehicleType: 'motorcycle',
    vehicleModel: '',
    vehicleYear: '',
    licensePlate: '',
    licenseNumber: '',
    licenseExpiry: '',
    insurance: '',
    terms: false
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);
  return (
    <div className="signup-container">
      <div className="signup-content">
        <div className="signup-header">
          <h1 className="signup-title">Join RideNepal as a Driver</h1>
          <p className="signup-subtitle">Complete the form below to get started</p>
        </div>
        <div className="signup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            Personal Info
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            Vehicle Details
          </div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            Documents
          </div>
        </div>
        <form className="signup-form">
          {step === 1 && (
            <div className="form-step">
              <h2 className="step-title">Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="form-step">
              <h2 className="step-title">Vehicle Information</h2>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Model</label>
                  <input
                    type="text"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Manufacturing Year</label>
                  <input
                    type="number"
                    name="vehicleYear"
                    value={formData.vehicleYear}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">License Plate Number</label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="form-step">
              <h2 className="step-title">Documents</h2>
              <div className="form-group">
                <label className="form-label">Driver's License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">License Expiry Date</label>
                <input
                  type="date"
                  name="licenseExpiry"
                  value={formData.licenseExpiry}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Driver's License</label>
                <div className="upload-area">
                  <span>📄 Click to upload or drag and drop</span>
                  <input type="file" className="file-input" accept="image/*,application/pdf" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Upload Vehicle Insurance</label>
                <div className="upload-area">
                  <span>📄 Click to upload or drag and drop</span>
                  <input type="file" className="file-input" accept="image/*,application/pdf" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={formData.terms}
                    onChange={handleChange}
                  />
                  <span>I agree to the Terms and Conditions</span>
                </label>
              </div>
            </div>
          )}
          <div className="form-buttons">
            {step > 1 && (
              <button type="button" onClick={prevStep} className="button-secondary">
                Back
              </button>
            )}
            {step < 3 ? (
              <button type="button" onClick={nextStep} className="button-primary">
                Next
              </button>
            ) : (
              <button type="submit" className="button-primary">
                Submit Application
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};