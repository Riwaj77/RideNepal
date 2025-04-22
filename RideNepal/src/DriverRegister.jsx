import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 

import './DriverRegister.css';

export default function DriverRegister() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', address: '',
    vehicleType: 'motorcycle', vehicleModel: '', vehicleYear: '', licensePlate: '',
    licenseNumber: '', licenseExpiry: '', terms: false
  });
  const [licenseImage, setLicenseImage] = useState(null);
  const [insuranceImage, setInsuranceImage] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e, setter) => setter(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataObj = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
    });

    // Ensure files are added correctly
    if (licenseImage) formDataObj.append("licenseImage", licenseImage);
    if (insuranceImage) formDataObj.append("insuranceImage", insuranceImage);

    try {
        const response = await axios.post("http://localhost:4000/riders", formDataObj, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log(response.data);
        setMessage(response.data.message);

         // Show success alert
      alert("Registered Successfully");

      // Optionally, you can reset the form or navigate to another page
      setFormData({
        firstName: '', lastName: '', email: '', phone: '', address: '',
        vehicleType: 'motorcycle', vehicleModel: '', vehicleYear: '', licensePlate: '',
        licenseNumber: '', licenseExpiry: '', terms: false
      });
      setLicenseImage(null);
      setInsuranceImage(null);

      navigate('/login');
    } catch (error) {
        console.error("Error:", error.response?.data || error);
        setMessage(error.response?.data?.message || "Error submitting application");
    }
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
        {message && <p className="message">{message}</p>}
        <div className="signup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>Personal Info</div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>Vehicle Details</div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>Documents</div>
        </div>
        <form className="signup-form" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h2 className="step-title">Personal Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-input" required />
              </div>
              {/* <button type="button" onClick={() => setStep(2)} className="button-primary">Next</button> */}
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2 className="step-title">Vehicle Information</h2>
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="form-input">
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="scooter">Scooter</option>
                </select>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Vehicle Model</label>
                  <input type="text" name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Manufacturing Year</label>
                  <input type="number" name="vehicleYear" value={formData.vehicleYear} onChange={handleChange} className="form-input" required />
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
              {/* <button type="button" onClick={() => setStep(1)} className="button-secondary">Back</button>
              <button type="button" onClick={() => setStep(3)} className="button-primary">Next</button> */}
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
             
                <input type="file" onChange={(e) => handleFileChange(e, setLicenseImage)} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Vehicle Insurance</label>
                <input type="file" onChange={(e) => handleFileChange(e, setInsuranceImage)} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-checkbox">
                  <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} />
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
}
