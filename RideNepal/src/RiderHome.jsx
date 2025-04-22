import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./RiderHome.css";
import { io } from 'socket.io-client';
import axios from 'axios';

export default function RiderHome() {
  const navigate = useNavigate();
  const [availableRides, setAvailableRides] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [currentRider, setCurrentRider] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [acceptedRides, setAcceptedRides] = useState([]);
  
  // Add rider statistics state
  const [riderStats, setRiderStats] = useState({
    todayEarnings: 0,
    completedRides: 0,
    rating: 0
  });

  // Get current rider from localStorage
  useEffect(() => {
    const checkAuth = () => {
      const riderData = localStorage.getItem('rider');
      const token = localStorage.getItem('riderToken');
      
      console.log('Auth check - Rider data:', riderData);
      console.log('Auth check - Token:', token);
      
      if (!riderData || !token) {
        setError('No rider data found. Please log in.');
        navigate('/riderlogin');
        return;
      }

      try {
        const parsedRider = JSON.parse(riderData);
        if (parsedRider && parsedRider.id) {
          setCurrentRider(parsedRider);
          setError('');
          
          // Fetch rider statistics after authentication
          fetchRiderStatistics(parsedRider.id, token);
        } else {
          setError('Invalid rider data. Please log in again.');
          navigate('/riderlogin');
        }
      } catch (e) {
        console.error('Error parsing rider data:', e);
        setError('Error loading rider data. Please log in again.');
        navigate('/riderlogin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Function to fetch rider statistics
  const fetchRiderStatistics = async (riderId, token) => {
    try {
      console.log('Fetching rider statistics for rider:', riderId);
      
      // Get ride history
      const historyResponse = await axios.get('http://localhost:4000/api/ridehistories/rider', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Ride history data:', historyResponse.data);
      
      if (historyResponse.data && Array.isArray(historyResponse.data)) {
        // Calculate total completed rides
        const completedRides = historyResponse.data.filter(ride => 
          ride.status === 'completed'
        ).length;
        
        // Calculate today's earnings
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayEarnings = historyResponse.data
          .filter(ride => 
            ride.status === 'completed' && 
            new Date(ride.createdAt) >= today
          )
          .reduce((sum, ride) => sum + ride.fare, 0);
        
        // For now, just set a placeholder rating
        // In a real app, you'd calculate this from user ratings
        const rating = 4.5;
        
        setRiderStats({
          todayEarnings,
          completedRides,
          rating
        });
        
        console.log('Updated rider statistics:', {
          todayEarnings,
          completedRides,
          rating
        });
      }
    } catch (error) {
      console.error('Error fetching rider statistics:', error);
    }
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    if (currentRider) {
      console.log('Initializing socket connection in RiderHome');
      
      // Create a new socket connection with explicit debugging
      const newSocket = io('http://localhost:4001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });
      
      // Handle connection events
      newSocket.on('connect', () => {
        console.log('Rider Socket connected with ID:', newSocket.id);
        setSocket(newSocket);
        
        // Register for new bookings immediately on connect if online
        if (isOnline) {
          console.log('Rider is online, emitting rider-online event on connect');
          
          const onlineData = {
            socketId: newSocket.id,
            riderId: currentRider.id
          };
          
          newSocket.emit('rider-online', onlineData);
          console.log('Sent rider-online with data:', onlineData);
        }
      });
      
      newSocket.on('rider-online-confirmed', (data) => {
        console.log('Server confirmed rider online:', data);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setError('Connection error. Please try again.');
      });
      
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected, reason:', reason);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`Socket reconnected after ${attemptNumber} attempts`);
      });

      // Listen for new booking requests
      newSocket.on('new-booking', (booking) => {
        console.log('🚨 New booking received in rider panel:', booking);
        
        // Make sure the booking has an ID (either id or rideId)
        if (!booking) {
          console.error('Invalid booking data received:', booking);
          return;
        }
        
        const bookingId = booking.id || booking.rideId;
        if (!bookingId) {
          console.error('Booking missing both id and rideId:', booking);
          return;
        }
        
        if (isOnline) {
          console.log('Rider is online, processing booking with ID:', bookingId);
          setAvailableRides(prevRides => {
            // Check if this ride already exists
            const exists = prevRides.some(ride => 
              (ride.id && ride.id === bookingId) || 
              (ride.rideId && ride.rideId === bookingId)
            );
            
            if (exists) {
              console.log('Ride already in the list, not adding duplicate');
              return prevRides;
            }
            
            console.log('Adding ride to available rides list');
            // Ensure the booking has both id and rideId
            const updatedBooking = { ...booking };
            if (!updatedBooking.id) {
              updatedBooking.id = updatedBooking.rideId;
            } else if (!updatedBooking.rideId) {
              updatedBooking.rideId = updatedBooking.id;
            }
            
            return [...prevRides, updatedBooking];
          });
        } else {
          console.log('Rider is offline, not adding ride to list');
        }
      });

      // Debug: Subscribe to ALL events for troubleshooting
      newSocket.onAny((event, ...args) => {
        console.log(`[Socket Debug] Event '${event}' received with data:`, args);
      });

      // Force immediate connection
      if (!newSocket.connected) {
        console.log('Socket not connected, connecting now...');
        newSocket.connect();
      }

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.disconnect();
      };
    }
  }, [currentRider, isOnline]);

  // Separate effect for handling online status change
  useEffect(() => {
    if (socket && currentRider) {
      console.log('isOnline changed to:', isOnline);
      
      if (isOnline) {
        // Re-register for new bookings when going online
        socket.emit('rider-online', {
          socketId: socket.id,
          riderId: currentRider.id
        });
        console.log('Re-emitted rider-online after status change');
      }
    }
  }, [isOnline, socket, currentRider]);

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

  // Function to toggle online/offline status
  const toggleOnlineStatus = () => {
    if (!socket) {
      setError('Not connected to server. Please refresh the page.');
      return;
    }

    if (!currentRider || !currentRider.id) {
      setError('Rider information is missing. Please log in again.');
      return;
    }

    const newStatus = !isOnline;
    console.log(`Setting rider status to: ${newStatus ? 'Online' : 'Offline'}`);
    
    if (newStatus) {
      const onlineData = {
        socketId: socket.id,
        riderId: currentRider.id
      };
      console.log('Emitting rider-online event with data:', onlineData);
      
      // Emit rider online status with rider ID
      socket.emit('rider-online', onlineData);
      
      // Force a reconnect to ensure clean state and receive all events
      socket.disconnect().connect();
      
      // Check for existing bookings
      console.log('Reconnected to receive bookings');
    } else {
      const offlineData = {
        socketId: socket.id,
        riderId: currentRider.id
      };
      console.log('Emitting rider-offline event with data:', offlineData);
      
      // Emit rider offline status
      socket.emit('rider-offline', offlineData);
      setAvailableRides([]); // Clear available rides when going offline
    }
    
    setIsOnline(newStatus);
  };

  // Function to accept a ride
  const handleAcceptRide = (ride) => {
    console.log("Attempting to accept ride:", ride);
    
    if (!socket) {
      console.error("Socket not connected! Cannot accept ride.");
      setError("Not connected to server. Please refresh the page.");
      return;
    }
    
    // Make sure we have the necessary data
    if (!ride) {
      console.error("Invalid ride data:", ride);
      return;
    }
    
    const rideId = ride.id || ride.rideId;
    if (!rideId) {
      console.error("Ride ID is missing:", ride);
      return;
    }
    
    const riderId = currentRider?.id;
    if (!riderId) {
      console.error("Rider ID is missing! Cannot accept ride.");
      setError("Rider information is missing. Please log in again.");
      return;
    }
    
    const rideData = {
      rideId: rideId,
      riderId: riderId
    };
    
    console.log("Emitting accept-ride event with data:", rideData);
    
    // Emit the accept-ride event
    socket.emit("accept-ride", rideData);
    
    // Update local state immediately
    const updatedRides = availableRides.filter(r => {
      const currentRideId = r.id || r.rideId;
      return currentRideId !== rideId;
    });
    setAvailableRides(updatedRides);
    
    // Add to accepted rides
    setAcceptedRides(prev => [...prev, { ...ride, status: 'accepted' }]);
    
    // Navigate to the ride tracking page
    setTimeout(() => {
      navigate(`/ridertracking/${rideId}`, { 
        state: { 
          ride: { ...ride, status: 'accepted', id: rideId, rideId: rideId } 
        } 
      });
    }, 1000); // Short delay before navigation
  };

  const handleLogout = () => {
    localStorage.removeItem('rider');
    localStorage.removeItem('riderToken');
    if (socket) {
      socket.disconnect();
    }
    navigate('/riderlogin');
  };

  // Test function to simulate receiving a booking (for debugging only)
  const simulateBooking = () => {
    if (!isOnline) {
      alert('You must be online to receive bookings');
      return;
    }
    
    const testBooking = {
      id: `test-ride-${Date.now()}`,
      pickup: {
        address: 'Test Pickup Location',
        coordinates: { lat: 27.7172, lng: 85.3240 }
      },
      destination: {
        address: 'Test Destination Location',
        coordinates: { lat: 27.7000, lng: 85.3300 }
      },
      fare: 250,
      vehicle: 'bike',
      status: 'pending'
    };
    
    console.log('Simulating new booking:', testBooking);
    
    // Process the test booking as if it came from socket
    setAvailableRides(prevRides => [...prevRides, testBooking]);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/riderlogin')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="rider-home-container">
      {/* Header Section */}
      <header className="rider-header">
        <div className="rider-header-logo"></div>
        
        {/* Navbar */}
        <nav className="rider-navbar">
          <Link to="/riderhome" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/help" className="nav-link">Help</Link>
        </nav>

        <div className="rider-status">
          <button 
            className={`rider-status-toggle ${isOnline ? 'online' : 'offline'}`}
            onClick={toggleOnlineStatus}
            disabled={!socket}
          >
            {isOnline ? 'Online' : 'Offline'}
          </button>
          {/* <button
            className="test-booking-btn"
            onClick={simulateBooking}
            style={{ marginLeft: '10px', padding: '8px', background: '#ffde59', color: '#1b1d28', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Test Booking
          </button> */}
        </div>
        
        {/* Menu Button and Dropdown */}
        <div className="rider-menu-container" ref={menuRef}>
          <button 
            className="rider-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="menu-icon">☰</span>
          </button>
          
          {isMenuOpen && (
            <div className="rider-menu-dropdown">
              <Link to="/riderprofile" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/riderwallet" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                Wallet
              </Link>
              <Link to="/riderhistory" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                History
              </Link>
              <button className="menu-item logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Section */}
      <div className="rider-dashboard">
        <div className="rider-stats">
          <div className="rider-stat-card">
            <span className="rider-stat-title">Today's Earnings</span>
            <span className="rider-stat-value">Rs. {riderStats.todayEarnings}</span>
          </div>
          <div className="rider-stat-card">
            <span className="rider-stat-title">Completed Rides</span>
            <span className="rider-stat-value">{riderStats.completedRides}</span>
          </div>
          <div className="rider-stat-card">
            <span className="rider-stat-title">Rating</span>
            <span className="rider-stat-value">{riderStats.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="rider-available-rides">
          <h2>Available Rides</h2>
          {!isOnline && (
            <div className="rider-offline-message">
              <p>Go online to receive ride requests</p>
            </div>
          )}
          {!socket && (
            <div className="rider-offline-message">
              <p>Connecting to server...</p>
            </div>
          )}
          <div className="rider-rides-list">
            {isOnline && availableRides.length === 0 ? (
              <div className="rider-no-rides">
                <p>No rides available at the moment</p>
              </div>
            ) : (
              availableRides.map((ride) => (
                <div key={ride.id} className="rider-ride-card">
                  <div className="rider-ride-info">
                    <div className="pickup">
                      <span className="label">Pickup:</span>
                      <span className="value">{ride.pickup.address}</span>
                    </div>
                    <div className="dropoff">
                      <span className="label">Dropoff:</span>
                      <span className="value">{ride.destination.address}</span>
                    </div>
                    <div className="fare">
                      <span className="label">Fare:</span>
                      <span className="value">Rs. {ride.fare}</span>
                    </div>
                    <div className="vehicle">
                      <span className="label">Vehicle:</span>
                      <span className="value">{ride.vehicle}</span>
                    </div>
                  </div>
                  <button 
                    className="rider-accept-ride-btn"
                    onClick={() => handleAcceptRide(ride)}
                    disabled={!socket || !isOnline}
                  >
                    Accept Ride
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="rider-footer">
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
    </div>
  );
} 