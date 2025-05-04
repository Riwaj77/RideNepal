import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import './RiderTracking.css';
import { io } from 'socket.io-client';
import axios from 'axios';

// Fix for default Leaflet marker icon issues - must be added before any marker creation
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
  shadowUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InRyYW5zcGFyZW50Ii8+PC9zdmc+',
  iconSize: [0, 0],
  shadowSize: [0, 0],
  iconAnchor: [0, 0],
  shadowAnchor: [0, 0],
  popupAnchor: [0, 0]
});

const RiderTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { rideId } = useParams(); // Get rideId from URL params
  
  console.log("RiderTracking - URL params:", { rideId });
  console.log("RiderTracking - Location state:", location.state);
  
  // Extract ride details from location state
  const ride = location.state?.ride || {};
  
  // Use rideId from params or state
  const currentRideId = rideId || ride?.id || ride?.rideId || location.state?.rideId;
  
  // Extract coordinates and addresses with fallbacks
  const pickup = ride?.pickup || {
    coordinates: location.state?.pickupLocation || { lat: 27.7172, lng: 85.3240 },
    address: location.state?.pickupAddress || "Pickup location"
  };
  
  const destination = ride?.destination || {
    coordinates: location.state?.destination || { lat: 27.7000, lng: 85.3300 },
    address: location.state?.destinationAddress || "Destination location"
  };
  
  const fare = ride?.fare || location.state?.fare || 0;
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routingControlRef = useRef(null);
  const markersRef = useRef({
    rider: null,
    pickup: null,
    destination: null
  });
  const socketRef = useRef(null);
  const [error, setError] = useState('');
  const [rideStatus, setRideStatus] = useState(ride?.status || 'accepted');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  console.log("RiderTracking - Processed data:", { 
    currentRideId, 
    pickup, 
    destination, 
    fare, 
    status: rideStatus 
  });

  // Custom marker icons
  const pickupIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const riderIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik01IDIwLjVBMy41IDMuNSAwIDAgMSAxLjUgMTdBMy41IDMuNSAwIDAgMSA1IDEzLjVBMy41IDMuNSAwIDAgMSA4LjUgMTdBMy41IDMuNSAwIDAgMSA1IDIwLjVNNSAxMmE1IDUgMCAwIDAtNSA1YTUgNSAwIDAgMCA1IDVhNSA1IDAgMCAwIDUtNWE1IDUgMCAwIDAtNS01bTkuOC0ySDE5VjguMmgtMy4ybC0xLjk0LTMuMjdjLS4yOS0uNS0uODYtLjgzLTEuNDYtLjgzYy0uNDcgMC0uOS4xOS0xLjIuNUw3LjUgOC4yOUM3LjE5IDguNiA3IDkgNyA5LjVjMCAuNjMuMzMgMS4xNi44NSAxLjQ3TDExLjIgMTN2NUgxM3YtNi41bC0yLjI1LTEuNjVsMi4zMi0yLjM1bTUuOTMgMTNhMy41IDMuNSAwIDAgMS0zLjUtMy41YTMuNSAzLjUgMCAwIDEgMy41LTMuNWEzLjUgMy41IDAgMCAxIDMuNSAzLjVhMy41IDMuNSAwIDAgMS0zLjUgMy41bTAtOC41YTUgNSAwIDAgMC01IDVhNSA1IDAgMCAwIDUgNWE1IDUgMCAwIDAgNS01YTUgNSAwIDAgMC01LTVtLTMtNy4yYzEgMCAxLjgtLjggMS44LTEuOFMxNyAxLjIgMTYgMS4yUzE0LjIgMiAxNC4yIDNTMTUgNC44IDE2IDQuOCIvPjwvc3ZnPg==',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Check if we have valid ride data
  useEffect(() => {
    if (!currentRideId) {
      setError('Ride ID is missing. Please go back and try again.');
      return;
    }
    
    // For safety, if we don't have valid coordinates, set default ones
    if (!pickup?.coordinates?.lat || !destination?.coordinates?.lat) {
      console.warn('Missing coordinate data, using defaults');
      // We'll continue with defaults rather than showing an error
    }
  }, [currentRideId, pickup, destination]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!currentRideId) return;
    
    console.log(`Connecting to socket server and joining ride room: ${currentRideId}`);
    
    // Get rider info from localStorage
    const riderString = localStorage.getItem('rider');
    const riderToken = localStorage.getItem('riderToken');
    
    if (!riderString || !riderToken) {
      console.error("Rider data or token missing in localStorage");
      setError("Authentication data missing. Please log in again.");
      return;
    }
    
    let rider;
    try {
      rider = JSON.parse(riderString);
    } catch (e) {
      console.error("Error parsing rider data:", e);
      setError("Invalid rider data. Please log in again.");
      return;
    }
    
    if (!rider || !rider.id) {
      console.error("Rider ID is missing");
      setError("Rider information incomplete. Please log in again.");
      return;
    }
    
    try {
      // Create a new socket connection
      const socket = io('http://localhost:4001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        auth: {
          token: riderToken,
          riderId: rider.id
        },
        query: {
          rideId: currentRideId
        }
      });
      
      socketRef.current = socket;
      
      // Set up event handlers
      socket.on('connect', () => {
        console.log(`Socket connected with ID: ${socket.id}`);
        setIsConnected(true);
        
        // Join ride room immediately after connecting
        socket.emit('join-ride', {
          rideId: currentRideId,
          riderId: rider.id
        });
        
        console.log(`Joined ride room: ${currentRideId}`);
      });
      
      socket.on('connect_error', (err) => {
        console.error("Socket connection error:", err);
        setError(`Connection error: ${err.message}. Please reload the page.`);
        setIsConnected(false);
      });
      
      socket.on('disconnect', (reason) => {
        console.log(`Socket disconnected: ${reason}`);
        setIsConnected(false);
      });

      // Debug all socket events
      socket.onAny((event, ...args) => {
        console.log(`[Socket Event] ${event}:`, args);
      });
      
      // Listen for ride status updates
      socket.on('ride-status-update', (data) => {
        console.log(`Received ride status update:`, data);
        if (data.rideId === currentRideId) {
          setRideStatus(data.status);
        }
      });
      
      // Listen for ride completion
      socket.on('ride-completed', (completedRideId) => {
        console.log(`Received ride-completed event for ride: ${completedRideId}`);
        if (completedRideId === currentRideId) {
          setRideStatus('completed');
          // Navigate after a short delay
          setTimeout(() => {
            navigate('/riderhome');
          }, 3000);
        }
      });
      
      // Listen for ride completion confirmation
      socket.on('ride-complete-confirmed', (data) => {
        console.log(`Received ride completion confirmation:`, data);
        if (data.success && data.rideId === currentRideId) {
          console.log('Ride completion confirmed by server');
          setRideStatus('completed');
          
          // Show success message
          alert('Ride completed successfully!');
          
          // Navigate to LiveTracking with the ride details for payment
          setTimeout(() => {
            navigate('/live-tracking', {
              state: {
                rideId: currentRideId,
                riderId: rider.id,
                pickup: {
                  coordinates: pickup.coordinates,
                  address: pickup.address || 'Pickup location'
                },
                destination: {
                  coordinates: destination.coordinates,
                  address: destination.address || 'Destination location'
                },
                fare: fare,
                isFromRiderComplete: true // Flag to indicate this is coming from ride completion
              }
            });
          }, 1000);
        }
      });
      
    } catch (err) {
      console.error("Error initializing socket:", err);
      setError("Could not connect to real-time tracking. Please reload the page.");
    }

    // Get current location for tracking
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = { lat: latitude, lng: longitude };
          setCurrentPosition(newPosition);
          
          // Update server with rider's location if socket is connected
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('update-rider-location', {
              rideId: currentRideId,
              riderId: rider.id,
              location: newPosition
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not access your location. Please check location permissions.");
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
      );
    }

    return () => {
      // Clear the geolocation watch
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
      
      // Disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentRideId, navigate]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    
    try {
      // Clean up any existing map instance first
      cleanupMap();
      
      // Make sure we have valid coordinates or fallbacks
      const pickupCoords = {
        lat: pickup?.coordinates?.lat || 27.7172,
        lng: pickup?.coordinates?.lng || 85.3240
      };
      
      const destCoords = {
        lat: destination?.coordinates?.lat || 27.7000,
        lng: destination?.coordinates?.lng || 85.3300
      };
      
      // Initialize map with options
      const mapInstance = L.map(mapRef.current, {
        attributionControl: false,
        zoomControl: true,
        boxZoom: true,
        zoomAnimation: true,
        fadeAnimation: true
      }).setView([pickupCoords.lat, pickupCoords.lng], 13);
      
      // Store the map instance ref
      mapInstanceRef.current = mapInstance;
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Add pickup marker
      markersRef.current.pickup = L.marker([pickupCoords.lat, pickupCoords.lng], {
        icon: pickupIcon
      }).addTo(mapInstance);
      
      // Add destination marker
      markersRef.current.destination = L.marker([destCoords.lat, destCoords.lng], {
        icon: destinationIcon
      }).addTo(mapInstance);

      // Add popups
      markersRef.current.pickup.bindPopup(`<b>Pickup:</b><br>${pickup.address || 'Pickup Location'}`);
      markersRef.current.destination.bindPopup(`<b>Destination:</b><br>${destination.address || 'Destination Location'}`);
      
      // Try to add routing
      try {
        const routingControl = L.Routing.control({
          waypoints: [
            L.latLng(pickupCoords.lat, pickupCoords.lng),
            L.latLng(destCoords.lat, destCoords.lng)
          ],
          routeWhileDragging: false,
          show: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          lineOptions: {
            styles: [{ color: '#6FA1EC', weight: 4 }]
          }
        }).addTo(mapInstance);
        
        routingControlRef.current = routingControl;
      } catch (routingError) {
        console.error("Error initializing routing:", routingError);
      }
      
      // Fit bounds to show both markers
      const bounds = L.latLngBounds([
        [pickupCoords.lat, pickupCoords.lng],
        [destCoords.lat, destCoords.lng]
      ]);
      mapInstance.fitBounds(bounds.pad(0.2));
      
    } catch (mapError) {
      console.error("Error initializing map:", mapError);
      setError("Could not initialize map. Please reload the page.");
    }

    return cleanupMap;
  }, [pickup, destination]);
  
  // Define the cleanup function separately so it can be called from multiple places
  const cleanupMap = () => {
    console.log("Cleaning up map resources");
    
    // Remove routing control first
    if (routingControlRef.current) {
      try {
        if (mapInstanceRef.current) {
          routingControlRef.current.getPlan().setWaypoints([]);  // Clear waypoints first
          mapInstanceRef.current.removeControl(routingControlRef.current);
        }
        routingControlRef.current = null;
      } catch (error) {
        console.error("Error removing routing control:", error);
      }
    }

    // Remove rider marker
    if (markersRef.current.rider) {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeLayer(markersRef.current.rider);
        }
        markersRef.current.rider = null;
      } catch (error) {
        console.error("Error removing rider marker:", error);
      }
    }
    
    // Clean up the map instance last
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (error) {
        console.error("Error removing map instance:", error);
      }
    }
  };
  
  // Update rider position marker on map
  useEffect(() => {
    if (!mapInstanceRef.current || !currentPosition) return;

    try {
      // Remove previous marker if exists
      if (markersRef.current.rider) {
        mapInstanceRef.current.removeLayer(markersRef.current.rider);
      }

      // Add new marker with valid position
      const lat = currentPosition.lat || 27.7172;
      const lng = currentPosition.lng || 85.3240;
      
      markersRef.current.rider = L.marker([lat, lng], {
        icon: riderIcon
      }).addTo(mapInstanceRef.current);
      
      markersRef.current.rider.bindPopup("Your current location");
      
      console.log(`Updated rider position to: ${lat}, ${lng}`);
    } catch (error) {
      console.error("Error updating rider marker:", error);
    }
  }, [currentPosition]);

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/riderhome')}>Go Back</button>
      </div>
    );
  }

  const handleCompleteRide = async () => {
    if (!socketRef.current || !isConnected) {
      setError("Not connected to server. Please try again.");
      return;
    }

    try {
      const riderString = localStorage.getItem('rider');
      const rider = JSON.parse(riderString);

      // Create the ride completion data with full location information
      const rideCompletionData = {
        rideId: currentRideId,
        riderId: rider.id,
        status: 'completed',
        pickup: {
          coordinates: pickup.coordinates,
          address: pickup.address || 'Pickup location'
        },
        destination: {
          coordinates: destination.coordinates,
          address: destination.address || 'Destination location'
        },
        fare: fare,
        completedAt: new Date().toISOString()
      };

      console.log('Sending ride completion data:', rideCompletionData);

      // First, save the ride completion data to the server
      const token = localStorage.getItem('riderToken');
      await axios.post('http://localhost:4000/api/ridehistories/socket-create', 
        rideCompletionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Then emit the socket event for real-time updates
      socketRef.current.emit('complete-ride', rideCompletionData);

      setRideStatus('completed');
      
      // Navigate to the next screen after successful completion
      setTimeout(() => {
        navigate('/live-tracking', {
          state: {
            ...rideCompletionData,
            isFromRiderComplete: true
          }
        });
      }, 1000);

    } catch (error) {
      console.error('Error completing ride:', error);
      setError('Failed to complete ride. Please try again.');
    }
  };

  return (
    <div className="rider-tracking-container">
      <div className="tracking-header">
        <h1>Ride Navigation</h1>
        <div className="ride-status">
          {rideStatus === 'accepted' && (
            <div className="status accepted">
              <h2>Ride Accepted</h2>
              <p>Navigate to the pickup location</p>
            </div>
          )}
          {rideStatus === 'completing' && (
            <div className="status in-progress">
              <h2>Completing Ride</h2>
              <p>Waiting for confirmation...</p>
            </div>
          )}
          {rideStatus === 'completed' && (
            <div className="status completed">
              <h2>Ride Completed</h2>
              <p>Returning to home...</p>
            </div>
          )}
        </div>
        {/* <div className="connection-status">
          {isConnected ? (
            <span className="connected">Connected to server</span>
          ) : (
            <span className="disconnected">Disconnected from server</span>
          )}
        </div> */}
      </div>

      <div className="tracking-content">
        <div className="ride-details">
          <div className="location-info">
            <div className="pickup">
              <strong>Pickup:</strong>
              <p>{pickup?.address || 'Loading pickup location...'}</p>
            </div>
            <div className="destination">
              <strong>Destination:</strong>
              <p>{destination?.address || 'Loading destination...'}</p>
            </div>
            <div className="fare">
              <strong>Fare:</strong>
              <p>NPR {fare}</p>
            </div>
            {/* <div className="ride-id">
              <strong>Ride ID:</strong>
              <p>{currentRideId || 'Unknown'}</p>
            </div> */}
          </div>
          {rideStatus === 'accepted' && (
            <button 
              className="complete-ride-btn" 
              onClick={handleCompleteRide}
              disabled={!isConnected}
            >
              Complete Ride
            </button>
          )}
        </div>

        <div className="map-container">
          <div ref={mapRef} style={{ height: '100%', minHeight: '500px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default RiderTracking; 