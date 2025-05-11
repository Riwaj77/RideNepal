import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import "./Homepage.css"

// Import icons
import personalDetailsIcon from './assets/images/menu_pd.png';
import walletIcon from './assets/images/wallet.png';
import historyIcon from './assets/images/ridehistory.png';
import driverIcon from './assets/images/menu_bike.png';
import helpIcon from './assets/images/menu_help.png';
import logoutIcon from './assets/images/menu_logout.png';

// Promo icon component
const PromoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-item-icon">
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
    <path d="M7 7h.01"></path>
  </svg>
);

export default function Homepage({toggleMenu}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [promos, setPromos] = useState([]);
  const [showPromos, setShowPromos] = useState(false);

  // Check for authentication token when component mounts
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token check in Homepage:", token ? "Token exists" : "No token found");
    
    if (!token) {
      console.warn("No authentication token found. User might need to login.");
      
    }
  }, []);

  // Handle click outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function fetchPromos() {
      try {
        // Try a different URL for public access to active promos
        // We use the /api/promos/active endpoint for public access
        const res = await fetch('http://localhost:4000/api/promos/active');
        
        if (!res.ok) {
          // Fallback to authenticated endpoint if public one fails
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('User not authenticated, cannot fetch promos');
            return;
          }
          
          const authRes = await fetch('http://localhost:4000/api/promos', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!authRes.ok) {
            throw new Error(`Error ${authRes.status}: ${authRes.statusText}`);
          }
          
          const authData = await authRes.json();
          if (authData.success && authData.promos) {
            const activePromos = authData.promos.filter(promo => 
              promo.status === 'active' && 
              (!promo.expiryDate || new Date(promo.expiryDate) > new Date())
            );
            setPromos(activePromos);
          } else {
            setPromos([]);
          }
          return;
        }
        
        const data = await res.json();
        if (data.success && data.promos) {
          setPromos(data.promos);
        } else {
          setPromos([]);
        }
      } catch (err) {
        console.error('Error fetching promos:', err);
        setPromos([]);
      }
    }
    fetchPromos();
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="home-main-container">
      {/* Header Section */}
      <header className="header">
        <div className="black-blue-logo"></div>
        
        {/* Menu Button and Dropdown */}
        <div className="home-menu-container" ref={menuRef}>
          <button 
            className="home-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="menu-icon">☰</span>
          </button>
          
          {isMenuOpen && (
            <div className="home-menu-dropdown">
              <Link to="/personaldetails" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                <img src={personalDetailsIcon} alt="Personal Details" className="menu-item-icon" />
                <span>Personal Details</span>
              </Link>
              <Link to="/wallet" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                <img src={walletIcon} alt="Wallet" className="menu-item-icon" />
                <span>Wallet</span>
              </Link>
              <Link to="/ridehistory" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                <img src={historyIcon} alt="Ride History" className="menu-item-icon" />
                <span>Ride History</span>
              </Link>
              <Link to="/DriverRegister" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                <img src={driverIcon} alt="Become a Driver" className="menu-item-icon" />
                <span>Become a Driver</span>
              </Link>
              <Link to="/help" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                <img src={helpIcon} alt="Help" className="menu-item-icon" />
                <span>Help</span>
              </Link>
              <button
                className="menu-item"
                onClick={() => { setShowPromos(true); setIsMenuOpen(false); }}
              >
                <PromoIcon />
                <span>Offers & Promos</span>
              </button>
              <button className="menu-item logout" onClick={handleLogout}>
                <img src={logoutIcon} alt="Logout" className="menu-item-icon" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
        
        <Link to="/book-ride" className="book-ride">Book a Ride</Link>
        <Link to="/about" className="about">About</Link>
        <Link to="/contact-us" className="contact-us">Contact Us</Link>
        <Link to="/home" className="home">Home</Link>
      </header>

      {/* Main Section */}

    <div className="home-booking-section">
      <div className="home-booking-segment">
        <div className="home-booking-form">
          <span className="home-ride-nepal">RideNepal</span>
          <div className="home-form-title">
            <span className="home-form-subtitle">
              Ready, set, go 
              in just a few quick taps
            </span>
          </div>
          <button className="home-button-group">
  
          </button>
          <div className="home-bicycle-bike" />
          <span className="home-reliable-ride">
            Get a reliable ride in minutes
          </span>
          <div className="home-wallet" />
          <span className="home-digital-wallet">
            Get a digital wallet feature for secure and convenient payments
          </span>
          <div className="home-location-compass" />
          <span className="home-live-location">
            Share you live location with others
          </span>
        </div>
        <div className="home-hero-image" />
      </div>
    </div>
    <div className="home-booking-section-1">
      <div className="home-booking-segment-2">
        <div className="home-hero-image-3" />
        <div className="home-booking-form-4">
          <div className="home-form-title-5">
            <span className="home-form-subtitle-6">Need a ride?</span>
            <div className="home-form-main-title">
              <span className="home-book-with">Book with </span>
              <span className="home-ridenepal">RideNepal</span>
              <span className="home-book-with-7"> now!</span>
            </div>
          </div>
          <div className="home-form-fields">
            <div className="home-form-header">
              <span className="home-find-a-ride-now">Find a ride now</span>
            </div>
            <div className="home-fields-column">
              <div className="home-select-outlined">
                <div className="home-input">
                  <div className="home-label-container">
                    <span className="home-your-pickup">Your Pickup</span>
                  </div>
                  <div className="home-active">
                    <span className="home-current-location">
                      Current Location
                    </span>
                    <div className="home-mui-autocomplete-indicator">
                      <div className="home-icon-button">
                        <div className="home-unstyled-icon-button">
                          <div className="home-filled-navigation-close" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <input className="home-select-outlined-input" />
              </div>
              <div className="home-autocomplete">
                <div className="home-input-8">
                  <div className="home-label-container-9">
                    <span className="home-your-destination">Your Destination</span>
                  </div>
                  <div className="home-active-a">
                    <span className="home-divider">|</span>
                    <div className="home-mui-autocomplete-indicator-b">
                      <div className="home-icon-button-c">
                        <div className="home-unstyled-icon-button-d">
                          <div className="home-filled-navigation-close-e" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <input className="home-autocomplete-input" />
              </div>
            </div>
            <div className="home-cta-section">
              <button className="home-find-driver-button">
                <div className="home-group">
                  <div className="home-group-f">
                    <div className="home-location-icon" />
                    <div className="home-text">
                      <span className="home-edit-label">find a driver</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="home-why-choose-section">
      <span className="home-best-out-there">The best out there</span>
      <span className="home-why-ridenepal">Why choose RideNepal?</span>
      <div className="home-cards-column">
        <div className="home-why-card">
          <div className="home-card-image">
            <div className="home-riders-everywhere" />
          </div>
          <div className="home-card-text">
            <span className="home-wide-coverage">Our rides are everywhere</span>
            <span className="home-multiple-cities">
              We have a wide range of coverage. We are available in multiple
              cities in the US and in Asia.
            </span>
          </div>
        </div>
        <div className="home-why-card-10">
          <div className="home-card-image-11" />
          <div className="home-card-text-12">
            <span className="home-fast-and-easy-booking">
              Fast and easy booking
            </span>
            <span className="home-book-rides-easily">
              Book by going to RideNepal website to book rides easily.
            </span>
          </div>
        </div>
        <div className="home-why-card-13">
          <div className="home-card-image-14" />
          <div className="home-card-text-15">
            <span className="home-wallet-thank-you">
              Your wallet will thank you
            </span>
            <span className="home-lowest-fares-available">
              We have the lowest fares available now and you can pay online
              through our app.
            </span>
          </div>
        </div>
      </div>
      <div className="home-become-driver-section">
        <div className="home-car-image" />
        <div className="home-become-driver-text">
          <span className="home-become-a-driver">Become a Driver</span>
          <span className="home-register-as-driver">
            Be a part of a growing community of RideNepal. Register as a
            driver and don't forget to register your bike as well.
          </span>
        </div>
        <Link to= "/DriverRegister">
        <button className="home-register-button">
          <span className="home-label-text">Register now</span>
        </button>
        </Link>
      </div>
    </div>
  


      {/* Footer Section */}
      <footer className="footer">
        <div className="flex-row-feb">
          <div className="location">
            <div className="round-place-px"></div>
            <span className="faulconer-drive">Naxal, Kathmandu, Nepal</span>
          </div>
          <nav className="footer-navigation">
            <Link to="/about" className="about-us">About Us</Link>
            <Link to="/contact-us" className="contact-us-c">Contact Us</Link>
            <Link to="/help" className="help">HELP</Link>
          </nav>
        </div>

        <div className="flex-row-d">
          <div className="black-blue-minimalist-d"></div>
          <div className="round-phone-px"></div>
          <span className="phone-number">+977 9456784590</span>
        </div>

        <span className="all-rights-reserved">
          © 2024 RideNepal. All Rights Reserved.
        </span>
      </footer>

      {showPromos && (
        <div className="promos-modal">
          <div className="promos-modal-content">
            <button className="close-promos" onClick={() => setShowPromos(false)}>×</button>
            <h3>Available Offers & Promos</h3>
            {promos.length === 0 ? (
              <div className="no-promos-message">
                <p>No active promos at the moment.</p>
                <p className="check-back">Check back later for exciting offers!</p>
              </div>
            ) : (
              <ul className="promos-list">
                {promos.map(promo => (
                  <li key={promo._id} className="promo-item">
                    <span className="promo-code">{promo.code}</span>
                    <span className="promo-discount">{promo.discount}% OFF</span>
                    <p className="promo-description">{promo.description}</p>
                    {promo.expiryDate && 
                      <div className="promo-expiry">
                        Valid until: {new Date(promo.expiryDate).toLocaleDateString()}
                      </div>
                    }
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}