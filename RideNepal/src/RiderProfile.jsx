import React, { useState } from "react";
import "./RiderProfile.css";
export default function RiderProfile () {
  const [activeTab, setActiveTab] = useState("profile");
  return <div className="dashboard">
      <header className="header">
        <div className="container header-content">
          <h1 className="logo">RideNepal</h1>
          <div className="user-info">
            <div className="avatar"></div>
            <span>Barsha Maharjan</span>
          </div>
        </div>
      </header>
      <main className="container main-content">
        <nav className="sidebar">
          <button onClick={() => setActiveTab("profile")} className={`nav-button ${activeTab === "profile" ? "active" : ""}`}>
            ⚪ Profile
          </button>
          <button onClick={() => setActiveTab("kyc")} className={`nav-button ${activeTab === "kyc" ? "active" : ""}`}>
            📄 KYC Verification
          </button>
          <button onClick={() => setActiveTab("rides")} className={`nav-button ${activeTab === "rides" ? "active" : ""}`}>
            🕒 Ride History
          </button>
          <button onClick={() => setActiveTab("earnings")} className={`nav-button ${activeTab === "earnings" ? "active" : ""}`}>
            💰 Earnings
          </button>
          <button onClick={() => setActiveTab("settings")} className={`nav-button ${activeTab === "settings" ? "active" : ""}`}>
            ⚙️ Settings
          </button>
        </nav>
        <div className="content">
          {activeTab === "profile" && <div>
              <div className="content-header">
                <h2 className="title">Profile</h2>
                <button className="button-link">Edit Profile</button>
              </div>
              <div className="profile-header">
                <div className="profile-avatar">
                  <div className="profile-avatar-img"></div>
                  <button className="camera-button">📸</button>
                </div>
                <h3 className="title">Barsha Maharjan</h3>
                <p className="subtitle">Rider since January 2024</p>
              </div>
              <div className="profile-info">
                <div>
                  <div className="info-group">
                    <label className="info-label">Full Name</label>
                    <p className="info-value">Barsha Maharjan</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Email</label>
                    <p className="info-value">barsha12@gmail.com</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Phone</label>
                    <p className="info-value">+977 9841234567</p>
                  </div>
                </div>
                <div>
                  <div className="info-group">
                    <label className="info-label">Address</label>
                    <p className="info-value">Kathmandu, Nepal</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">Vehicle Type</label>
                    <p className="info-value">Motorcycle</p>
                  </div>
                  <div className="info-group">
                    <label className="info-label">License Number</label>
                    <p className="info-value">BA 12 PA 3456</p>
                  </div>
                </div>
              </div>
            </div>}
          {/* {activeTab === "settings" && <div>
              <div className="content-header">
                <h2 className="title">Settings</h2>
              </div>
              <div className="settings-card">
                <div className="settings-header">
                  <span>🔔</span>
                  <h3>Notifications</h3>
                </div>
                <div>
                  <div className="settings-item">
                    <span>Push Notifications</span>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-item">
                    <span>Email Notifications</span>
                    <label className="toggle-switch">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="settings-card">
                <div className="settings-header">
                  <span>🛡️</span>
                  <h3>Security</h3>
                </div>
                <div>
                  <button className="button-secondary">Change Password</button>
                  <button className="button-secondary">
                    Two-Factor Authentication
                  </button>
                </div>
              </div>
              <button className="button-danger">
                <span>🚪</span>
                <span>Sign Out</span>
              </button>
            </div>} */}
          {activeTab === "kyc" && <div>
              <div className="content-header">
                <h2 className="title">KYC Verification</h2>
                <span className="status-pending">✓ Pending Verification</span>
              </div>
              <form className="kyc-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input type="tel" className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Upload ID Document</label>
                  <div className="upload-area">
                    Drag and drop your document here, or click to browse
                  </div>
                </div>
                <button type="submit" className="button-primary">
                  Submit for Verification
                </button>
              </form>
            </div>}
        </div>
      </main>
    </div>;
};