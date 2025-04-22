import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import './LiveTracking.css';
import { io } from 'socket.io-client';
import { getPaymentHistory } from './services/paymentService';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const LiveTracking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { pickup, destination, fare, rideId, riderId, isFromRiderComplete } = location.state || {};
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({
    rider: null,
    pickup: null,
    destination: null
  });
  const routingControlRef = useRef(null);
  const socketRef = useRef(null);
  const rideIdRef = useRef(rideId || `ride-${Date.now()}`);
  const animationRef = useRef(null);
  
  const [riderLocation, setRiderLocation] = useState(null);
  const [rideStatus, setRideStatus] = useState('approaching');
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [progress, setProgress] = useState(0);
  const [routePath, setRoutePath] = useState([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showInsufficientFundsPopup, setShowInsufficientFundsPopup] = useState(false);
  const [showWalletBalance, setShowWalletBalance] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  // Custom marker icons
  const riderIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik01IDIwLjVBMy41IDMuNSAwIDAgMSAxLjUgMTdBMy41IDMuNSAwIDAgMSA1IDEzLjVBMy41IDMuNSAwIDAgMSA4LjUgMTdBMy41IDMuNSAwIDAgMSA1IDIwLjVNNSAxMmE1IDUgMCAwIDAtNSA1YTUgNSAwIDAgMCA1IDVhNSA1IDAgMCAwIDUtNWE1IDUgMCAwIDAtNS01bTkuOC0ySDE5VjguMmgtMy4ybC0xLjk0LTMuMjdjLS4yOS0uNS0uODYtLjgzLTEuNDYtLjgzYy0uNDcgMC0uOS4xOS0xLjIuNUw3LjUgOC4yOUM3LjE5IDguNiA3IDkgNyA5LjVjMCAuNjMuMzMgMS4xNi44NSAxLjQ3TDExLjIgMTN2NUgxM3YtNi41bC0yLjI1LTEuNjVsMi4zMi0yLjM1bTUuOTMgMTNhMy41IDMuNSAwIDAgMS0zLjUtMy41YTMuNSAzLjUgMCAwIDEgMy41LTMuNWEzLjUgMy41IDAgMCAxIDMuNSAzLjVhMy41IDMuNSAwIDAgMS0zLjUgMy41bTAtOC41YTUgNSAwIDAgMC01IDVhNSA1IDAgMCAwIDUgNWE1IDUgMCAwIDAgNS01YTUgNSAwIDAgMC01LTVtLTMtNy4yYzEgMCAxLjgtLjggMS44LTEuOFMxNyAxLjIgMTYgMS4yUzE0LjIgMiAxNC4yIDNTMTUgNC44IDE2IDQuOCIvPjwvc3ZnPg==',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const pickupIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const destinationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Get userId from JWT token with better error handling
  const getUserId = () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found in localStorage');
        setError('Authentication required. Please login again.');
        return null;
      }
      
      // Log the token for debugging (only first few characters)
      console.log('Token found:', token.substring(0, 15) + '...');
      
      const decoded = jwtDecode(token);
      
      if (!decoded || !decoded.id) {
        console.error('Invalid token format or missing user ID in token');
        setError('Invalid session. Please login again.');
        return null;
      }
      
      console.log('Successfully decoded user ID from token:', decoded.id);
      return decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Session error. Please login again.');
      return null;
    }
  };
  
  // Check if user is authenticated
  const verifyAuthentication = () => {
    const userId = getUserId();
    if (!userId) {
      // Redirect to login after showing error briefly
      setTimeout(() => {
        navigate('/login', { state: { redirectTo: '/live-tracking' } });
      }, 2000);
      return false;
    }
    return true;
  };

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    // Verify authentication first
    if (!verifyAuthentication()) {
      return 0;
    }
    
    const userId = getUserId();
    // This should never happen since verifyAuthentication checks for userId
    if (!userId) {
      return 0;
    }

    try {
      console.log('Fetching wallet balance for user:', userId);
      
      // Get token again to ensure it's the latest
      const token = localStorage.getItem('token');
      console.log('Using token for payment API call:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        setError('Authentication token missing. Please login again.');
        return 0;
      }
      
      // Make a direct API call instead of using the service to ensure token is included
      const response = await axios.get(`http://localhost:4000/api/payments/history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Wallet balance response:', response.data);
      
      if (response.data && response.data.payments) {
        // Calculate total balance from successful payments
        const totalBalance = response.data.payments
          .filter(payment => payment.status === 'success')
          .reduce((sum, payment) => {
            if (payment.paymentType === 'load') {
              // Add wallet loads
              return sum + (payment.amount / 100);
            } else if (payment.paymentType === 'ride' && payment.paymentGateway === 'wallet') {
              // Subtract ride payments
              return sum - (payment.amount / 100);
            }
            return sum;
          }, 0);
          
        console.log('Calculated wallet balance:', totalBalance);
        setWalletBalance(totalBalance);
        return totalBalance;
      } else {
        console.warn('No payment data found in response');
        setWalletBalance(0);
        return 0;
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setError(error.message || 'Failed to fetch wallet balance');
      setWalletBalance(0);
      return 0;
    }
  };

  const handleWalletClick = async () => {
    setError(''); // Clear any previous errors
    
    // Verify authentication before proceeding
    if (!verifyAuthentication()) {
      return;
    }
    
    setShowWalletBalance(true);
    
    try {
      console.log('Wallet payment method selected, fetching current balance');
      // Always fetch fresh balance when user selects wallet payment
      const currentBalance = await fetchWalletBalance();
      console.log(`Wallet balance: ${currentBalance}, Required fare: ${fare}`);
      
      if (currentBalance < fare) {
        console.log('Insufficient balance detected');
        setShowInsufficientFundsPopup(true);
      } else {
        console.log('Sufficient balance available for payment');
      }
    } catch (err) {
      console.error('Error checking wallet balance:', err);
      setError('Failed to retrieve wallet balance. Please try another payment method.');
    }
  };

  // Check authentication when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Initial token check:', token ? 'Token exists' : 'No token found');
    
    // Fetch wallet balance if token exists
    if (token) {
      fetchWalletBalance();
    }
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    const currentRideId = rideId || rideIdRef.current;
    if (!currentRideId) {
      console.error('No ride ID available');
      setError('Ride information is missing. Please go back and try again.');
      return;
    }
    
    console.log(`Connecting to socket server for ride: ${currentRideId}`);
    const socket = io('http://localhost:4001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log(`LiveTracking socket connected with ID: ${socket.id}`);
      setIsConnected(true);
      
      // Join ride room
      socket.emit('join-ride', currentRideId);
      console.log(`Joined ride room: ${currentRideId}`);
      
      // Store the active ride in localStorage
      if (pickup && destination && fare) {
        localStorage.setItem('activeRide', JSON.stringify({
          rideId: currentRideId,
          riderId: riderId,
          pickup: pickup.coordinates,
          destination: destination.coordinates,
          pickupAddress: pickup.address,
          destinationAddress: destination.address,
          fare: fare,
          status: 'active',
          timestamp: new Date().toISOString()
        }));
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    // Listen for ride acceptance
    socket.on('ride-accepted', (data) => {
      console.log('Received ride-accepted event:', data);
      if (data.rideId === currentRideId) {
        setRideStatus('accepted');
        // Start the ride after a short delay
        setTimeout(() => {
          setRideStatus('started');
          if (routePath.length > 0) {
            animateRider();
          }
        }, 2000);
      }
    });

    // Listen for rider location updates
    socket.on('rider-location-update', (data) => {
      console.log('Received rider location update:', data);
      if (data.rideId === currentRideId) {
        setRiderLocation(data.location);
        if (markersRef.current.rider && mapInstanceRef.current) {
          markersRef.current.rider.setLatLng([data.location.lat, data.location.lng]);
        }
      }
    });

    // Update the ride-completed handler to handle both string and object formats
    socket.on('ride-completed', (completedRideId) => {
      console.log('Received ride-completed event:', completedRideId);
      
      // Extract the ride ID if an object was sent
      const targetRideId = typeof completedRideId === 'object' ? 
        completedRideId.rideId : completedRideId;
      
      console.log(`Processing ride completion for ${targetRideId} vs current ${currentRideId}`);
      
      // Compare with current ride ID
      if (targetRideId === currentRideId) {
        console.log('Ride completion confirmed! Updating UI...');
        
        // Update ride status
        setRideStatus('completed');
        
        // Add the completed ride to history
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        // If user is authenticated, create history entry
        if (token && userId) {
          // Get the currently assigned rider ID from state or location
          const currentRiderId = riderId || 
            (location.state?.riderId) || 
            (localStorage.getItem('activeRide') ? JSON.parse(localStorage.getItem('activeRide')).riderId : null);
          
          if (currentRiderId) {
            console.log(`Creating ride history for completed ride ${targetRideId} with rider ${currentRiderId}`);
            
            // Add a delay to allow other socket operations to complete
            setTimeout(async () => {
              try {
                const rideData = {
                  userId: userId,
                  riderId: currentRiderId,
                  pickup: pickup || {
                    address: pickup?.address || 'Pickup location',
                    coordinates: pickup?.coordinates || { lat: 27.7172, lng: 85.3240 }
                  },
                  destination: destination || {
                    address: destination?.address || 'Destination location',
                    coordinates: destination?.coordinates || { lat: 27.7000, lng: 85.3300 }
                  },
                  fare: fare || 0,
                  status: 'completed'
                };
                
                console.log('Submitting ride history data:', JSON.stringify(rideData));
                
                const historyResponse = await axios.post(
                  'http://localhost:4000/api/ridehistories', 
                  rideData,
                  {
                    headers: { 'Authorization': `Bearer ${token}` }
                  }
                );
                
                console.log('Ride added to history by user:', historyResponse.data);
              } catch (error) {
                console.error('Error adding ride to history from user side:', error);
              }
            }, 500);
          } else {
            console.warn('Cannot create ride history: Missing rider ID');
          }
        } else {
          console.warn('Cannot create ride history: User not authenticated');
        }
        
        // Show payment popup
        setShowPaymentPopup(true);
        
        // Cancel any ongoing animation
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        
        // Clear active ride from localStorage
        localStorage.removeItem('activeRide');
        
        // Add visual confirmation
        alert('Your ride has been completed!');
      } else {
        console.warn(`Received completion for different ride: ${targetRideId}`);
      }
    });

    // Debug listener for all events
    socket.onAny((event, ...args) => {
      console.log(`[LiveTracking] Socket event '${event}' received:`, args);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected in cleanup');
      }
    };
  }, [rideId, pickup, destination, fare, riderId]);

  // Function to animate rider movement
  const animateRider = () => {
    if (currentPathIndex < routePath.length) {
      const currentPoint = routePath[currentPathIndex];
      setRiderLocation(currentPoint);
      
      if (markersRef.current.rider) {
        markersRef.current.rider.setLatLng([currentPoint.lat, currentPoint.lng]);
      }

      setCurrentPathIndex(prev => prev + 1);
      animationRef.current = requestAnimationFrame(animateRider);
    } else {
      // Ride completed
      setRideStatus('completed');
      // Show payment popup after a short delay
      setTimeout(() => {
        setShowPaymentPopup(true);
      }, 1000);
    }
  };

  // If required data is missing, show error
  useEffect(() => {
    // Only show error if we really can't create a map with the data we have
    if (!pickup?.coordinates && !destination?.coordinates) {
      setError('Invalid destination. Please try booking a ride again.');
    } else {
      // Clear any existing error if we have at least some data
      setError('');
    }
  }, [pickup, destination]);
  
  // Initialize map with even more robust error handling
  useEffect(() => {
    // Only create a map if the container exists and we don't already have a map
    if (!mapRef.current || mapInstanceRef.current) return;
    
    try {
      // Make sure the map element is ready for a new map
      if (mapRef.current._leaflet_id) {
        console.log('Container already has _leaflet_id, clearing it');
        mapRef.current._leaflet_id = null;
      }
      
      // Ensure we have valid coordinates
      const pickupCoords = {
        lat: pickup?.coordinates?.lat || 27.7172, 
        lng: pickup?.coordinates?.lng || 85.3240
      };
      
      const destinationCoords = {
        lat: destination?.coordinates?.lat || 27.7000,
        lng: destination?.coordinates?.lng || 85.3300
      };
      
      // Create a unique ID for the map container
      const uniqueId = `map-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      mapRef.current.id = uniqueId;
      
      console.log(`Creating new map with container ID: ${uniqueId}`);
      
      // Create new map instance
      const mapInstance = L.map(mapRef.current, {
        attributionControl: false,
        zoomControl: true,
        boxZoom: true,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true
      }).setView([pickupCoords.lat, pickupCoords.lng], 13);
      
      // Set the map instance ref
      mapInstanceRef.current = mapInstance;
      
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstance);
      
      // Add markers with try-catch blocks
      try {
        // Add pickup marker
        markersRef.current.pickup = L.marker([pickupCoords.lat, pickupCoords.lng], {
          icon: pickupIcon
        }).addTo(mapInstance);
        
        markersRef.current.pickup.bindPopup(`<b>Pickup:</b><br>${pickup?.address || 'Pickup Location'}`);
        
        // Add destination marker
        markersRef.current.destination = L.marker([destinationCoords.lat, destinationCoords.lng], {
          icon: destinationIcon
        }).addTo(mapInstance);
        
        markersRef.current.destination.bindPopup(`<b>Destination:</b><br>${destination?.address || 'Destination Location'}`);
        
        // Set initial rider location
        const initialRiderLocation = pickup?.coordinates || { lat: pickupCoords.lat, lng: pickupCoords.lng };
        setRiderLocation(initialRiderLocation);
        
        markersRef.current.rider = L.marker([initialRiderLocation.lat, initialRiderLocation.lng], {
          icon: riderIcon
        }).addTo(mapInstance);
        
        markersRef.current.rider.bindPopup('Rider Location');
        
        // Fit bounds to show both markers
        const bounds = L.latLngBounds(
          [pickupCoords.lat, pickupCoords.lng],
          [destinationCoords.lat, destinationCoords.lng]
        );
        mapInstance.fitBounds(bounds.pad(0.2));
        
        // Add routing with try-catch block
        try {
          routingControlRef.current = L.Routing.control({
            waypoints: [
              L.latLng(pickupCoords.lat, pickupCoords.lng),
              L.latLng(destinationCoords.lat, destinationCoords.lng)
            ],
            routeWhileDragging: false,
            showAlternatives: false,
            fitSelectedRoutes: true,
            lineOptions: {
              styles: [{ color: '#6FA1E2', weight: 4 }]
            },
            createMarker: () => null,
            addWaypoints: false,
            draggableWaypoints: false,
            show: false
          }).addTo(mapInstance);
          
          // Setup route path for animation
          routingControlRef.current.on('routesfound', (e) => {
            if (e.routes && e.routes.length > 0) {
              const route = e.routes[0];
              const path = route.coordinates.map(coord => ({
                lat: coord.lat,
                lng: coord.lng
              }));
              
              setRoutePath(path);
              console.log(`Route found with ${path.length} points`);
              
              // Start animation after a delay only if in the right state
              if (rideStatus === 'started' && path.length > 0) {
                setTimeout(() => {
                  animateRider();
                }, 2000);
              }
            }
          });
        } catch (routingError) {
          console.error('Error setting up routing:', routingError);
          // Continue without routing
        }
      } catch (markerError) {
        console.error('Error adding markers:', markerError);
      }
    } catch (mapError) {
      console.error('Error creating map:', mapError);
      setError('Could not initialize the map. Please refresh the page.');
    }
    
    // Extra cleanup in case the component unmounts during map initialization
    console.log('Setting up map cleanup function');
    return () => cleanupMap();
  }, [pickup, destination, rideStatus]);
  
  // Separate cleanup function that can be called directly if needed
  const cleanupMap = () => {
    console.log('Running map cleanup function');
    
    // Cancel any animation frames
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      console.log('Canceled animation frame');
    }
    
    // Clean up markers first
    if (markersRef.current) {
      Object.entries(markersRef.current).forEach(([key, marker]) => {
        if (marker) {
          try {
            marker.remove();
            console.log(`Removed ${key} marker`);
          } catch (err) {
            console.error(`Error removing ${key} marker:`, err);
          }
          markersRef.current[key] = null;
        }
      });
    }
    
    // Remove routing control
    if (routingControlRef.current) {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.removeControl(routingControlRef.current);
          console.log('Removed routing control');
        }
      } catch (err) {
        console.error('Error removing routing control:', err);
      }
      routingControlRef.current = null;
    }
    
    // Clear map instance
    if (mapInstanceRef.current) {
      try {
        const container = mapInstanceRef.current.getContainer();
        
        // Extra cleanup before removing map
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
        console.log('Map instance removed');
        
        // Clear leaflet ID from container
        if (container && container._leaflet_id) {
          container._leaflet_id = null;
          console.log('Cleared leaflet ID from container');
        }
      } catch (err) {
        console.error('Error removing map:', err);
      }
      mapInstanceRef.current = null;
    }
    
    // Clear the DOM reference if it exists
    if (mapRef.current && mapRef.current._leaflet_id) {
      mapRef.current._leaflet_id = null;
      console.log('Cleared leaflet ID from mapRef');
    }
  };
  
  // Make sure we clean up properly on unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up resources');
      cleanupMap();
      
      // Clean up socket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, []);

  // Check if we're coming directly from ride completion
  useEffect(() => {
    if (isFromRiderComplete) {
      console.log('Ride completed by rider, showing payment popup');
      setRideStatus('completed');
      setShowPaymentPopup(true);
    }
  }, [isFromRiderComplete]);

  const handlePayment = async () => {
    if (paymentMethod === 'ridenepal') {
      // Verify authentication before proceeding
      if (!verifyAuthentication()) {
        return;
      }
      
      const userId = getUserId();
      if (!userId) {
        return; // Error is already set by getUserId
      }

      try {
        console.log('Processing wallet payment for user:', userId);
        console.log('Payment details - Amount:', fare, 'Ride ID:', rideIdRef.current);
        
        // Get token again to ensure it's the latest
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Authentication token missing. Please login again.');
          return;
        }
        
        // Show loading state
        setPaymentStatus('processing');
        
        // Deduct balance from wallet
        const response = await axios.post('http://localhost:4000/api/payments/deduct', {
          userId,
          amount: fare,
          rideId: rideIdRef.current
        }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Payment response:', response.data);
        
        if (response.data.success) {
          // Update local wallet balance with the returned remaining balance
          setWalletBalance(response.data.remainingBalance);
          
          // Add to ride history when payment is successful
          try {
            // Get the riderId from the completed ride
            const currentRiderId = riderId || (localStorage.getItem('activeRide') ? 
              JSON.parse(localStorage.getItem('activeRide')).riderId : null);
              
            console.log('Adding ride to history with riderId:', currentRiderId);
            
            // Create ride history record
            const historyResponse = await axios.post('http://localhost:4000/api/ridehistories', {
              userId,
              riderId: currentRiderId,
              pickup: pickup,
              destination: destination,
              fare: fare,
              status: 'completed'
            }, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            console.log('Ride added to history:', historyResponse.data);
          } catch (historyError) {
            console.error('Error adding ride to history:', historyError);
            // Don't block the payment flow if history creation fails
          }
          
          setPaymentStatus('completed');
          setShowPaymentPopup(false);
          
          // Show a success message briefly
          alert('Payment successful!');
          
          // Show rating popup
          setShowRatingPopup(true);
        } else {
          throw new Error(response.data.message || 'Payment failed');
        }
      } catch (error) {
        console.error('Payment error:', error);
        setPaymentStatus('failed');
        setError(error.response?.data?.message || error.message || 'Failed to process payment. Please try again.');
      }
    } else if (paymentMethod === 'cash') {
      // For cash payments, still record the ride in history
      try {
        const userId = getUserId();
        if (userId) {
          const token = localStorage.getItem('token');
          const currentRiderId = riderId || (localStorage.getItem('activeRide') ? 
            JSON.parse(localStorage.getItem('activeRide')).riderId : null);
            
          console.log('Adding cash payment ride to history with riderId:', currentRiderId);
          
          // Create ride history record for cash payment
          const historyResponse = await axios.post('http://localhost:4000/api/ridehistories', {
            userId,
            riderId: currentRiderId,
            pickup: pickup,
            destination: destination,
            fare: fare,
            status: 'completed'
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Cash payment ride added to history:', historyResponse.data);
        }
      } catch (historyError) {
        console.error('Error adding cash payment ride to history:', historyError);
        // Don't block the flow if history creation fails
      }
      
      setPaymentStatus('completed');
      setShowPaymentPopup(false);
      setShowRatingPopup(true);
    }
  };

  const handleClosePayment = () => {
    setShowPaymentPopup(false);
    setPaymentMethod(null);
    setPaymentStatus('pending');
  };

  const handleDone = () => {
    setShowRatingPopup(true);
  };

  const handleSubmitRating = () => {
    console.log('Rating:', rating, 'Feedback:', feedback);
    setShowRatingPopup(false);
    navigate('/home');
  };

  const handleSkipRating = () => {
    setShowRatingPopup(false);
    navigate('/home');
  };

  const handleBackToOptions = () => {
    setPaymentMethod(null);
    setPaymentStatus('pending');
  };

  if (error) {
    return (
      <div className="error-container">
        <h2>{error}</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="live-tracking-container">
      {showPaymentPopup && (
        <div className="payment-popup-overlay">
          <div className="payment-popup">
            <button className="close-btn" onClick={handleClosePayment}>×</button>
            <h2>Complete Payment</h2>
            {isFromRiderComplete && (
              <div className="rider-completed-notice">
                <p>Your driver has marked this ride as complete</p>
              </div>
            )}
            <p>Total Amount: NPR {fare}</p>
            
            {!paymentMethod ? (
              <div className="payment-options">
                <button 
                  className="payment-option-btn ridenepal"
                  onClick={() => {
                    setPaymentMethod('ridenepal');
                    handleWalletClick();
                  }}
                >
                  Pay with RideNepal Wallet
                </button>
                <button 
                  className="payment-option-btn cash"
                  onClick={() => setPaymentMethod('cash')}
                >
                  Cash in Hand
                </button>
                {error && <p className="payment-error">{error}</p>}
              </div>
            ) : (
              <div className="payment-confirmation">
                <p>Selected Payment Method: {
                  paymentMethod === 'ridenepal' ? 'RideNepal Wallet' : 'Cash in Hand'
                }</p>
                {paymentMethod === 'ridenepal' && (
                  <div className="wallet-details">
                    <p className="wallet-balance">Available Balance: NPR {walletBalance.toFixed(2)}</p>
                    <p className="fare-amount">Required Amount: NPR {fare}</p>
                    {walletBalance < fare && (
                      <p className="insufficient-funds-warning">Insufficient funds. Please load money or select cash payment.</p>
                    )}
                  </div>
                )}
                {error && <p className="payment-error">{error}</p>}
                {paymentStatus === 'processing' && (
                  <div className="payment-processing">
                    <p>Processing your payment...</p>
                    <div className="loading-spinner"></div>
                  </div>
                )}
                {paymentStatus === 'failed' && (
                  <div className="payment-failed">
                    <p>Payment failed. Please try again or choose a different payment method.</p>
                  </div>
                )}
                <div className="confirmation-buttons">
                  <button 
                    className="back-btn"
                    onClick={() => {
                      handleBackToOptions();
                      setShowWalletBalance(false);
                      setError(''); // Clear errors on back
                    }}
                    disabled={paymentStatus === 'processing'}
                  >
                    Back
                  </button>
                  <button 
                    className="confirm-btn" 
                    onClick={handlePayment}
                    disabled={
                      paymentStatus === 'completed' || 
                      paymentStatus === 'processing' || 
                      (paymentMethod === 'ridenepal' && walletBalance < fare)
                    }
                  >
                    {paymentStatus === 'processing' ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showInsufficientFundsPopup && (
        <div className="payment-popup-overlay">
          <div className="payment-popup">
            <button className="close-btn" onClick={() => setShowInsufficientFundsPopup(false)}>×</button>
            <h2>Insufficient Balance</h2>
            <p>Your wallet balance (NPR {walletBalance.toFixed(2)}) is insufficient for this payment.</p>
            <p>Required amount: NPR {fare}</p>
            <div className="payment-options">
              <button 
                className="payment-option-btn ridenepal"
                onClick={() => {
                  setShowInsufficientFundsPopup(false);
                  navigate('/wallet');
                }}
              >
                Load Money Now
              </button>
              <button 
                className="payment-option-btn cash"
                onClick={() => {
                  setShowInsufficientFundsPopup(false);
                  setPaymentMethod('cash');
                }}
              >
                Pay with Cash Instead
              </button>
            </div>
          </div>
        </div>
      )}

      {showRatingPopup && (
        <div className="rating-popup-overlay">
          <div className="rating-popup">
            <h2>How was your ride?</h2>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`star-btn ${rating >= star ? 'active' : ''}`}
                  onClick={() => setRating(star)}
                >
                  ⭐
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="feedback-input"
            />
            <div className="rating-actions">
              <button className="submit-rating-btn" onClick={handleSubmitRating} disabled={rating === 0}>
                Submit
              </button>
              <button className="skip-rating-btn" onClick={handleSkipRating}>
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tracking-header">
        <h1>Live Tracking</h1>
        <div className="ride-status">
          {rideStatus === 'approaching' && (
            <div className="status approaching">
              <h2>Rider is on the way</h2>
              <p>Your rider is coming to pick you up</p>
              <div className="rider-info">
                <div className="rating">⭐ 5.0</div>
              </div>
            </div>
          )}
          {rideStatus === 'arrived' && (
            <div className="status arrived">
              <h2>Rider has arrived</h2>
              <p>Please meet your rider at the pickup location</p>
            </div>
          )}
          {rideStatus === 'started' && (
            <div className="status started">
              <h2>Ride in progress</h2>
              <p>You're on your way to the destination</p>
            </div>
          )}
          {rideStatus === 'completed' && (
            <div className="status completed">
              <h2>Ride completed</h2>
              <p>Thank you for riding with us!</p>
              <div className="fare-info">
                <p>Total Fare: NPR {fare}</p>
              </div>
              <button className="done-btn" onClick={handleDone}>Done</button>
            </div>
          )}
        </div>
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
          </div>
        </div>

        <div className="map-container">
          <div ref={mapRef} style={{ height: '100%', minHeight: '500px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking; 