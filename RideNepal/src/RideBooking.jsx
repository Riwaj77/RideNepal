import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RideBooking.css';
import io from 'socket.io-client';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Bike rider icon
const bikeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48cGF0aCBmaWxsPSJjdXJyZW50Q29sb3IiIGQ9Ik01IDIwLjVBMy41IDMuNSAwIDAgMSAxLjUgMTdBMy41IDMuNSAwIDAgMSA1IDEzLjVBMy41IDMuNSAwIDAgMSA4LjUgMTdBMy41IDMuNSAwIDAgMSA1IDIwLjVNNSAxMmE1IDUgMCAwIDAtNSA1YTUgNSAwIDAgMCA1IDVhNSA1IDAgMCAwIDUgNWE1IDUgMCAwIDAgNS01bTkuOC0ySDE5VjguMmgtMy4ybC0xLjk0LTMuMjdjLS4yOS0uNS0uODYtLjgzLTEuNDYtLjgzYy0uNDcgMC0uOS4xOS0xLjIuNUw3LjUgOC4yOUM3LjE5IDguNiA3IDkgNyA5LjVjMCAuNjMuMzMgMS4xNi44NSAxLjQ3TDExLjIgMTN2NUgxM3YtNi41bC0yLjI1LTEuNjVsMi4zMi0yLjM1bTUuOTMgMTNhMy41IDMuNSAwIDAgMS0zLjUtMy41YTMuNSAzLjUgMCAwIDEgMy41LTMuNWEzLjUgMy41IDAgMCAxIDMuNSAzLjVhMy41IDMuNSAwIDAgMS0zLjUgMy41bTAtOC41YTUgNSAwIDAgMC01IDVhNSA1IDAgMCAwIDUgNWE1IDUgMCAwIDAgNS01YTUgNSAwIDAgMC01LTVtLTMtNy4yYzEgMCAxLjgtLjggMS44LTEuOFMxNyAxLjIgMTYgMS4yUzE0LjIgMiAxNC4yIDNTMTUgNC44IDE2IDQuOCIvPjwvc3ZnPg==',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const RideBooking = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef({
    start: null,
    end: null,
    riders: []
  });
  const socketRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentAddress, setCurrentAddress] = useState('');
  const [destination, setDestination] = useState(null);
  const [destinationAddress, setDestinationAddress] = useState('');
  const [fare, setFare] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState('bike');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [bookingStatus, setBookingStatus] = useState('');
  const [selectedRider, setSelectedRider] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  const center = {
    lat: 27.7172,
    lng: 85.3240
  };

  // Request location permission
  useEffect(() => {
    const requestLocationPermission = () => {
      if (navigator.geolocation) {
        const showLocationAlert = () => {
          const userResponse = window.confirm("Would you like to share your location?");
          if (userResponse) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                setLocationPermission('granted');
                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                setCurrentLocation(userLocation);
                
                const address = await fetchAddress(userLocation.lat, userLocation.lng);
                setCurrentAddress(address);

                if (mapInstanceRef.current) {
                  mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
                  
                  if (markersRef.current.start) {
                    markersRef.current.start.remove();
                  }
                  markersRef.current.start = L.marker([userLocation.lat, userLocation.lng], {
                    draggable: true,
                    icon: startIcon
                  }).addTo(mapInstanceRef.current);

                  markersRef.current.start.on('dragend', async (event) => {
                    const marker = event.target;
                    const position = marker.getLatLng();
                    setCurrentLocation({ lat: position.lat, lng: position.lng });
                    
                    const newAddress = await fetchAddress(position.lat, position.lng);
                    setCurrentAddress(newAddress);
                    
                    calculateRoute();
                    addRidersToMap(position);
                  });

                  addRidersToMap(userLocation);
                }
              },
              (error) => {
                console.error("Error getting location:", error);
                setLocationPermission('denied');
                setCurrentLocation(center);
                setCurrentAddress('Location access denied');
                if (mapInstanceRef.current) {
                  addRidersToMap(center);
                }
              }
            );
          } else {
            setLocationPermission('denied');
            setCurrentLocation(center);
            setCurrentAddress('Location access denied');
            if (mapInstanceRef.current) {
              addRidersToMap(center);
            }
          }
        };

        // Show the alert after a short delay to ensure the component is mounted
        setTimeout(showLocationAlert, 1000);
      } else {
        setLocationPermission('denied');
        setCurrentLocation(center);
        setCurrentAddress('Location services not available');
        if (mapInstanceRef.current) {
          addRidersToMap(center);
        }
      }
    };

    requestLocationPermission();
  }, []);

  // Fetch address for coordinates
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name;
    } catch (error) {
      console.error('Error fetching address:', error);
      return 'Location not found';
    }
  };

  // Generate random riders around a location
  const generateRandomRiders = (centerLocation, count = 5) => {
    const riders = [];
    for (let i = 0; i < count; i++) {
      const latOffset = (Math.random() - 0.5) * 0.02;
      const lngOffset = (Math.random() - 0.5) * 0.02;
      
      riders.push({
        id: i + 1,
        lat: centerLocation.lat + latOffset,
        lng: centerLocation.lng + lngOffset,
        name: `Rider ${i + 1}`,
        rating: (4 + Math.random()).toFixed(1)
      });
    }
    return riders;
  };

  // Add riders to map
  const addRidersToMap = (location) => {
    markersRef.current.riders.forEach(marker => {
      if (marker.marker && mapInstanceRef.current) {
        marker.marker.remove();
      }
    });
    markersRef.current.riders = [];

    const riders = generateRandomRiders(location);
    riders.forEach(rider => {
      const marker = L.marker([rider.lat, rider.lng], { icon: bikeIcon })
        .bindPopup(`
          <div class="rider-popup">
            <strong>${rider.name}</strong>
            <div class="rating">⭐${rider.rating}</div>
            <div class="distance">~${Math.round(Math.random() * 10 + 2)} mins away</div>
            <button class="select-rider-btn">Select Rider</button>
          </div>
        `)
        .addTo(mapInstanceRef.current);
      
      // Add click event to select rider
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        const popupElement = popup.getElement();
        const selectButton = popupElement.querySelector('.select-rider-btn');
        
        if (selectButton) {
          selectButton.onclick = () => {
            setSelectedRider(rider);
            setBookingStatus('');
            popup.closePopup();
          };
        }
      });
      
      markersRef.current.riders.push({ marker, details: rider });
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([center.lat, center.lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Add riders to the map with center coordinates
      addRidersToMap(center);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const calculateFare = (distance) => {
    const baseFare = selectedVehicle === 'bike' ? 50 : 100;
    const ratePerKm = selectedVehicle === 'bike' ? 15 : 25;
    return Math.round(baseFare + (distance * ratePerKm));
  };

  const calculateRoute = async () => {
    if (!currentLocation || !destination) return;

    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        routeLayerRef.current = L.geoJSON(data.routes[0].geometry).addTo(mapInstanceRef.current);
        mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), { padding: [50, 50] });

        const distance = data.routes[0].distance / 1000;
        setFare(calculateFare(distance));
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const searchLocation = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleVehicleChange = (vehicle) => {
    setSelectedVehicle(vehicle);
    calculateRoute();
  };

  const handleDestinationSelect = async (result) => {
    const newDestination = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    };
    setDestination(newDestination);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    setDestinationAddress(result.display_name);

    if (markersRef.current.end) {
      markersRef.current.end.remove();
    }
    markersRef.current.end = L.marker([newDestination.lat, newDestination.lng], {
      draggable: true,
      icon: endIcon
    }).addTo(mapInstanceRef.current);

    markersRef.current.end.on('dragend', async (event) => {
      const marker = event.target;
      const position = marker.getLatLng();
      setDestination({ lat: position.lat, lng: position.lng });
      const newAddress = await fetchAddress(position.lat, position.lng);
      setDestinationAddress(newAddress);
      calculateRoute();
    });

    calculateRoute();
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    console.log('Setting up socket connection');
    
    // Create a new socket connection with explicit configuration
    if (!socketRef.current) {
      console.log('Creating new socket connection');
      socketRef.current = io('http://localhost:4001', {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        autoConnect: true
      });
    }
    
    // Handle connect event to log socket ID
    socketRef.current.on('connect', () => {
      console.log(`Socket connected with ID: ${socketRef.current.id}`);
    });
    
    // Listen for confirmations from server
    socketRef.current.on('booking-received', (data) => {
      console.log('Server confirmed booking received:', data);
      if (data.success) {
        setBookingStatus(`Request sent to ${data.sentToRiders} available riders...`);
      }
    });
    
    // Listen for ride acceptance
    socketRef.current.on('ride-accepted', (data) => {
      console.log('Ride accepted event received with data:', data);
      
      // Update booking status immediately
      setBookingStatus('Ride accepted! Rider is on the way.');
      
      try {
        if (data && data.rideId) {
          // Ensure we have valid coordinate objects
          const safePickupLocation = typeof currentLocation === 'object' ? currentLocation : { lat: 27.7172, lng: 85.3240 };
          const safeDestination = typeof destination === 'object' ? destination : { lat: 27.7000, lng: 85.3300 };
          
          // Store the accepted ride data with all necessary fields
          const rideData = {
            rideId: data.rideId,
            riderId: data.riderId,
            pickup: {
              coordinates: safePickupLocation,
              address: currentAddress || 'Pickup location'
            },
            destination: {
              coordinates: safeDestination,
              address: destinationAddress || 'Destination'
            },
            fare: fare || 0,
            status: 'accepted',
            timestamp: data.timestamp || new Date().toISOString()
          };
          
          // Store in localStorage for persistence
          localStorage.setItem('activeRide', JSON.stringify(rideData));
          
          // Log what we're navigating with
          console.log('Navigating to live tracking page with data:', rideData);
          
          // Navigate to live tracking after a short delay
          setTimeout(() => {
            navigate('/live-tracking', {
              state: rideData
            });
          }, 2000);
        } else {
          console.error('Invalid ride acceptance data:', data);
        }
      } catch (err) {
        console.error('Error processing ride acceptance:', err);
      }
    });

    // Debug: Listen for all events
    socketRef.current.onAny((event, ...args) => {
      if (!['connect', 'disconnect'].includes(event)) {
        console.log(`[Socket Debug] Event '${event}' received:`, args);
      }
    });

    return () => {
      if (socketRef.current) {
        console.log('Disconnecting socket in cleanup');
        socketRef.current.disconnect();
      }
    };
  }, [navigate, currentLocation, currentAddress, destination, destinationAddress, fare]);

  const handleBookRide = async () => {
    if (!currentLocation || !destination) {
      setBookingStatus('Please select both pickup and destination locations');
      return;
    }

    try {
      setBookingStatus('Finding available riders...');
      
      // Generate a unique ride ID
      const rideId = `ride-${Date.now()}`;
      console.log('Generated ride ID:', rideId);
      
      // Prepare the booking data
      const bookingData = {
        id: rideId,     // Include id for backward compatibility
        rideId: rideId, // Include rideId for newer components
        pickup: {
          address: currentAddress,
          coordinates: currentLocation
        },
        destination: {
          address: destinationAddress,
          coordinates: destination
        },
        fare,
        vehicle: selectedVehicle,
        status: 'pending',
        timestamp: new Date().toISOString(),
        userId: localStorage.getItem('userId') || 'anonymous'
      };
      
      console.log('Emitting booking data:', bookingData);
      
      // Create a new socket if needed
      if (!socketRef.current) {
        console.log('Socket not initialized, creating new connection');
        socketRef.current = io('http://localhost:4001', {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 20000,
        });
      }
      
      // Ensure socket is connected
      if (!socketRef.current.connected) {
        console.log('Socket not connected, connecting...');
        socketRef.current.connect();
        
        // Wait for connection
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.log('Socket connection timed out, proceeding anyway');
            resolve(false);
      }, 3000);
          
          socketRef.current.once('connect', () => {
            console.log('Socket connected successfully');
            clearTimeout(timeout);
            resolve(true);
          });
        });
      }
      
      // Save the ride information in localStorage in case page reloads
      localStorage.setItem('pendingRide', JSON.stringify({
        rideId: rideId,
        pickup: currentLocation,
        destination: destination,
        pickupAddress: currentAddress,
        destinationAddress: destinationAddress,
        fare: fare,
        timestamp: new Date().toISOString()
      }));
      
      // Emit the ride request
      console.log(`Emitting request-ride event with socket ID: ${socketRef.current.id}`);
      socketRef.current.emit('request-ride', bookingData);
      
      // Also emit as new-booking for backward compatibility
      socketRef.current.emit('new-booking', bookingData);
      
    } catch (error) {
      console.error('Error booking ride:', error);
      setBookingStatus('Error booking ride. Please try again.');
    }
  };

  // Check for active ride on component mount
  useEffect(() => {
    const checkActiveRide = () => {
      const activeRideJSON = localStorage.getItem('activeRide');
      if (activeRideJSON) {
        try {
          const activeRide = JSON.parse(activeRideJSON);
          console.log('Found active ride in localStorage:', activeRide);
          
          // If the active ride exists and is recent (within last 1 hour)
          const rideTime = new Date(activeRide.timestamp).getTime();
          const currentTime = new Date().getTime();
          const oneHourInMs = 60 * 60 * 1000;
          
          if (currentTime - rideTime < oneHourInMs) {
            console.log('Active ride is recent, redirecting to tracking page');
            setBookingStatus('You have an active ride. Redirecting to tracking...');
            
            // Redirect to live tracking
            setTimeout(() => {
              navigate('/live-tracking', { 
                state: {
                  pickup: {
                    coordinates: activeRide.pickup,
                    address: activeRide.pickupAddress
                  },
                  destination: {
                    coordinates: activeRide.destination,
                    address: activeRide.destinationAddress
                  },
                  fare: activeRide.fare,
                  rideId: activeRide.rideId,
                  riderId: activeRide.riderId
                }
              });
            }, 1000);
            
            return true;
          } else {
            // Ride is old, clear it
            console.log('Active ride is old, clearing from localStorage');
            localStorage.removeItem('activeRide');
          }
        } catch (error) {
          console.error('Error parsing active ride data:', error);
          localStorage.removeItem('activeRide');
        }
      }
      return false;
    };
    
    // Check for active ride
    const hasActiveRide = checkActiveRide();
    
    // Check pending ride only if no active ride exists
    if (!hasActiveRide) {
      const pendingRideJSON = localStorage.getItem('pendingRide');
      if (pendingRideJSON) {
        try {
          const pendingRide = JSON.parse(pendingRideJSON);
          console.log('Found pending ride in localStorage:', pendingRide);
          
          // If the pending ride is recent (within last 15 minutes)
          const rideTime = new Date(pendingRide.timestamp).getTime();
          const currentTime = new Date().getTime();
          const fifteenMinutesInMs = 15 * 60 * 1000;
          
          if (currentTime - rideTime < fifteenMinutesInMs) {
            console.log('Resuming pending ride request');
            setBookingStatus('Ride request in progress. Waiting for riders...');
          } else {
            // Ride request is old, clear it
            console.log('Pending ride is old, clearing from localStorage');
            localStorage.removeItem('pendingRide');
          }
        } catch (error) {
          console.error('Error parsing pending ride data:', error);
          localStorage.removeItem('pendingRide');
        }
      }
    }
  }, [navigate]);

  return (
    <div className="ride-booking-container">
      <h1>Book Your Ride</h1>
      
      <div className="booking-content">
        <div className="booking-form">
          <div className="vehicle-selection">
            <button 
              className={`vehicle-btn ${selectedVehicle === 'bike' ? 'active' : ''}`}
              onClick={() => handleVehicleChange('bike')}
            >
              Bike
            </button>
            <button 
              className={`vehicle-btn ${selectedVehicle === 'car' ? 'active' : ''}`}
              onClick={() => handleVehicleChange('car')}
            >
              Car
            </button>
          </div>

          <div className="location-inputs">
            <div className="input-group">
              <label>Your Location</label>
              <div className="current-location">
                {currentAddress || 'Waiting for location permission...'}
              </div>
            </div>

            <div className="input-group">
              <label>Search Destination</label>
              <div className="search-container">
                <input 
                  type="text"
                  placeholder={destinationAddress || "Search for a location"}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={searchLocation}>Search</button>
              </div>
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => (
                    <div 
                      key={result.place_id} 
                      className="search-result-item"
                      onClick={() => handleDestinationSelect(result)}
                    >
                      {result.display_name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {fare > 0 && (
            <div className="fare-details">
              <h3>Estimated Fare</h3>
              <p>NPR {fare}</p>
              <button 
                className="book-btn" 
                onClick={handleBookRide}
                disabled={bookingStatus === 'Finding available riders...' || bookingStatus === 'Rider is on the way!'}
              >
                {bookingStatus === 'Finding available riders...' ? 'Finding Riders...' : 
                 bookingStatus === 'Rider is on the way!' ? 'Rider is Coming!' : 
                 'Book Now'}
              </button>
              {bookingStatus && <p className="booking-status">{bookingStatus}</p>}
            </div>
          )}
        </div>

        <div className="map-container">
          <div ref={mapRef} style={{ height: '100%', minHeight: '600px' }}></div>
        </div>
      </div>
    </div>
  );
};

export default RideBooking;
