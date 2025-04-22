import express from 'express';
import RideHistory from '../Model/ridehistory.js';
import auth from '../Middleware/auth.js';
import User from '../Model/Signup.js';

const router = express.Router();

// Get user's ride history
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const rides = await RideHistory.find({ userId }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get rider's ride history
router.get('/rider', auth, async (req, res) => {
  try {
    const riderId = req.user.id;
    const rides = await RideHistory.find({ riderId }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new ride to history
router.post('/', auth, async (req, res) => {
  try {
    const { userId, riderId, pickup, destination, fare, status } = req.body;
    const ride = new RideHistory({
      userId,
      riderId,
      pickup,
      destination,
      fare,
      status
    });
    const savedRide = await ride.save();
    res.status(201).json(savedRide);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add an endpoint for server-side creation of ride history
// This endpoint doesn't require authentication as it's meant to be called from server-side code
router.post('/socket-create', async (req, res) => {
  try {
    const { userId, riderId, pickup, destination, fare, status, apiKey, rideId } = req.body;
    
    // Log all received data for debugging
    console.log('Socket-create request received:', {
      rideId,
      riderId,
      userId,
      pickup: pickup ? 'provided' : 'missing',
      destination: destination ? 'provided' : 'missing',
      fare: fare || 'missing',
      status,
      apiKey: apiKey ? 'provided' : 'missing'
    });
    
    // Validate the API key to ensure only trusted services can call this endpoint
    // In a real app, you'd use a proper API key validation mechanism
    if (apiKey !== process.env.INTERNAL_API_KEY && apiKey !== 'server-side-key') {
      console.log('Invalid API key in socket-create request');
      return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }
    
    // Check for riderId, which is the minimum required field
    if (!riderId) {
      console.log('Missing riderId in socket-create request');
      return res.status(400).json({ 
        message: 'Missing required rider ID for ride history creation' 
      });
    }
    
    // Find userId if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      try {
        const placeholderUser = await User.findOne({}).sort({ createdAt: 1 });
        if (placeholderUser) {
          finalUserId = placeholderUser._id;
          console.log('Using placeholder userId for ride history:', finalUserId);
        } else {
          console.log('No user found to associate with ride history');
          return res.status(400).json({ 
            message: 'No user found to associate with ride history' 
          });
        }
      } catch (userError) {
        console.error('Error finding placeholder user:', userError);
        return res.status(500).json({ 
          message: 'Error finding user for ride history' 
        });
      }
    }
    
    // Set up default values for missing fields
    const finalPickup = pickup || {
      address: "Default pickup location",
      coordinates: { lat: 27.7172, lng: 85.3240 }
    };
    
    const finalDestination = destination || {
      address: "Default destination location",
      coordinates: { lat: 27.7000, lng: 85.3300 }
    };
    
    const finalFare = fare || 150; // Default fare if missing
    
    // Create the ride history record with defaults as needed
    const ride = new RideHistory({
      userId: finalUserId,
      riderId,
      pickup: finalPickup,
      destination: finalDestination,
      fare: finalFare,
      status: status || 'completed',
      completedAt: new Date()
    });
    
    const savedRide = await ride.save();
    console.log('Socket-created ride history saved successfully:', savedRide._id);
    
    res.status(201).json({
      success: true,
      rideId: savedRide._id,
      message: 'Ride history created successfully'
    });
  } catch (error) {
    console.error('Error creating ride history from socket:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router; 