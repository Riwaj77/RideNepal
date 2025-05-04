import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios'; // Add axios for making API calls

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your React app URL
    methods: ["GET", "POST"]
  }
});

// Store active rides, online riders, and pending rides
const activeRides = new Map();
const onlineRiders = new Map();
const pendingRides = new Map(); // Store pending rides

// Debug function
const debugLog = (message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// Enhanced debugging - list all online riders
const logOnlineRiders = () => {
  const riderEntries = Array.from(onlineRiders.entries());
  debugLog(`Currently ${riderEntries.length} riders online:`, 
    riderEntries.map(([riderId, data]) => `${riderId}: ${data.socketId} (${data.vehicle})`).join(', '));
};

// Function to broadcast ride to available riders
const broadcastRideToAvailableRiders = (booking) => {
  let sentToCount = 0;
  const vehicle = booking.vehicle || 'bike';

  onlineRiders.forEach((riderData, riderId) => {
    if (riderData.vehicle === vehicle) {
      const targetSocket = io.sockets.sockets.get(riderData.socketId);
      if (targetSocket) {
        targetSocket.emit('new-booking', booking);
        sentToCount++;
      }
    }
  });

  return sentToCount;
};

debugLog('Socket server starting...');

io.on('connection', (socket) => {
  debugLog('Client connected:', socket.id);

  // Handle storing pending rides
  socket.on('store-pending-ride', (booking) => {
    debugLog('Storing pending ride:', booking);
    if (booking && (booking.id || booking.rideId)) {
      const rideId = booking.id || booking.rideId;
      pendingRides.set(rideId, booking);
      debugLog(`Stored pending ride ${rideId}`);
    }
  });

  // Handle rider going online/offline
  socket.on('rider-online', (data) => {
    debugLog('Rider online data received:', data);
    const { socketId, riderId, vehicle = 'bike' } = data;
    
    if (!riderId) {
      debugLog('Error: riderId is missing in rider-online event');
      return;
    }
    
    // Store rider ID with socket ID and vehicle type
    onlineRiders.set(riderId, { socketId: socket.id, vehicle });
    debugLog(`Rider ${riderId} is now online with socket ${socket.id} for ${vehicle}`);
    
    // Log all online riders
    logOnlineRiders();
    
    // Send pending rides to the newly online rider
    const matchingPendingRides = Array.from(pendingRides.values())
      .filter(ride => ride.vehicle === vehicle);
    
    if (matchingPendingRides.length > 0) {
      debugLog(`Sending ${matchingPendingRides.length} pending rides to rider ${riderId}`);
      socket.emit('pending-rides', matchingPendingRides);
      
      // Update ride status for each pending ride
      matchingPendingRides.forEach(ride => {
        const rideId = ride.id || ride.rideId;
        const availableRiders = Array.from(onlineRiders.values())
          .filter(r => r.vehicle === vehicle).length;
        
        io.emit(`ride-${rideId}-status`, {
          availableRiders,
          status: 'pending'
        });
      });
    }
    
    // Emit back confirmation
    socket.emit('rider-online-confirmed', { success: true, riderId });
  });

  socket.on('rider-offline', (data) => {
    debugLog('Rider offline data received:', data);
    const { riderId } = data;
    
    if (!riderId) {
      debugLog('Error: riderId is missing in rider-offline event');
      return;
    }
    
    onlineRiders.delete(riderId);
    debugLog(`Rider ${riderId} is now offline`);

    // Update ride status for all pending rides
    pendingRides.forEach((ride, rideId) => {
      const vehicle = ride.vehicle || 'bike';
      const availableRiders = Array.from(onlineRiders.values())
        .filter(r => r.vehicle === vehicle).length;
      
      io.emit(`ride-${rideId}-status`, {
        availableRiders,
        status: 'pending'
      });
    });
  });

  // Handle fetch pending rides request
  socket.on('fetch-pending-rides', (data) => {
    debugLog('Fetch pending rides request received:', data);
    const { riderId, vehicle = 'bike' } = data;
    
    if (!riderId) {
      debugLog('Error: riderId is missing in fetch-pending-rides event');
      return;
    }
    
    const matchingRides = Array.from(pendingRides.values())
      .filter(ride => ride.vehicle === vehicle);
    
    if (matchingRides.length > 0) {
      debugLog(`Sending ${matchingRides.length} pending rides to rider ${riderId}`);
      socket.emit('pending-rides', matchingRides);
    }
  });

  // Handle new booking requests - new format
  socket.on('request-ride', (booking) => {
    debugLog('New booking request received (request-ride):', booking);
    
    if (!booking) {
      debugLog('Error: Invalid booking data in request-ride event');
      return;
    }
    
    // Ensure the booking has an id property for backward compatibility
    const bookingData = { ...booking };
    if (booking.rideId && !booking.id) {
      bookingData.id = booking.rideId;
    } else if (booking.id && !booking.rideId) {
      bookingData.rideId = booking.id;
    }
    
    if (!bookingData.id && !bookingData.rideId) {
      debugLog('Error: Both id and rideId are missing in booking data');
      return;
    }
    
    // Store as pending ride
    const rideId = bookingData.id || bookingData.rideId;
    pendingRides.set(rideId, bookingData);
    
    // Log online riders before broadcasting
    debugLog(`About to broadcast booking ${rideId} to riders.`);
    logOnlineRiders();
    
    // Broadcast to matching vehicle type riders
    const sentToCount = broadcastRideToAvailableRiders(bookingData);
    debugLog(`Booking broadcast complete. Sent to ${sentToCount} matching online riders.`);
    
    // Emit a confirmation back to the requesting client
    socket.emit('booking-received', { 
      success: true, 
      rideId: rideId,
      sentToRiders: sentToCount
    });
    
    // Emit ride status update
    const vehicle = bookingData.vehicle || 'bike';
    const availableRiders = Array.from(onlineRiders.values())
      .filter(r => r.vehicle === vehicle).length;
    
    io.emit(`ride-${rideId}-status`, {
      availableRiders,
      status: 'pending'
    });
  });

  // Handle ride acceptance
  socket.on('accept-ride', (data) => {
    debugLog('Ride acceptance data received:', data);
    const { rideId, riderId } = data;
    
    if (!rideId) {
      debugLog('Error: rideId is missing in accept-ride event');
      return;
    }
    
    // Remove from pending rides
    pendingRides.delete(rideId);
    
    // Store ride association with rider
    activeRides.set(rideId, { riderId });
    
    // Broadcast ride acceptance to all clients
    debugLog(`Broadcasting ride-accepted event for ride ${rideId}`);
    io.emit('ride-accepted', { 
      rideId, 
      riderId,
      status: 'accepted',
      timestamp: new Date().toISOString()
    });
    
    // Also send a confirmation back to the accepting rider
    socket.emit('ride-accept-confirmed', { 
      success: true,
      rideId,
      riderId 
    });
    
    debugLog(`Ride ${rideId} accepted by rider ${riderId}`);
  });

  // Handle ride completion
  socket.on('complete-ride', (data) => {
    let rideId;
    let riderId;
    
    if (typeof data === 'string') {
      rideId = data;
      debugLog(`Ride ${rideId} completion request received (string format)`);
    } else if (typeof data === 'object' && data !== null) {
      rideId = data.rideId;
      riderId = data.riderId;
      debugLog(`Ride ${rideId} completion request received (object format) from rider ${riderId}`);
    } else {
      debugLog('Error: Invalid data format in complete-ride event');
      return;
    }
    
    if (!rideId) {
      debugLog('Error: rideId is missing in complete-ride event');
      return;
    }
    
    // Remove from active and pending rides
    activeRides.delete(rideId);
    pendingRides.delete(rideId);
    
    // Broadcast completion
    io.emit('ride-completed', rideId);
    
    // Send confirmation
    socket.emit('ride-complete-confirmed', {
      success: true,
      rideId: rideId,
      timestamp: new Date().toISOString()
    });
    
    // Create ride history if we have rider ID
    if (riderId) {
      debugLog(`Creating ride history for completed ride ${rideId}`);
      axios.post('http://localhost:4000/api/ridehistories/socket-create', {
        riderId: riderId,
        rideId: rideId,
        status: 'completed',
        apiKey: 'server-side-key'
      })
      .then(response => debugLog(`Ride history created: ${response.data.rideId}`))
      .catch(error => debugLog(`Error creating ride history: ${error.message}`));
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    debugLog('Client disconnected:', socket.id);
    
    // Remove from online riders if they were a rider
    for (const [riderId, data] of onlineRiders.entries()) {
      if (data.socketId === socket.id) {
        onlineRiders.delete(riderId);
        debugLog(`Rider ${riderId} removed from online riders due to disconnect`);
        
        // Update ride status for all pending rides
        pendingRides.forEach((ride, rideId) => {
          const vehicle = ride.vehicle || 'bike';
          const availableRiders = Array.from(onlineRiders.values())
            .filter(r => r.vehicle === vehicle).length;
          
          io.emit(`ride-${rideId}-status`, {
            availableRiders,
            status: 'pending'
          });
        });
      }
    }
  });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  debugLog(`Socket.IO server running on port ${PORT}`);
}); 