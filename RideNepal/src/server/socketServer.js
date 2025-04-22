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

// Store active rides and online riders
const activeRides = new Map();
const onlineRiders = new Map(); // Change to Map to store socket IDs

// Debug function
const debugLog = (message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data || '');
};

// Enhanced debugging - list all online riders
const logOnlineRiders = () => {
  const riderEntries = Array.from(onlineRiders.entries());
  debugLog(`Currently ${riderEntries.length} riders online:`, 
    riderEntries.map(([riderId, socketId]) => `${riderId}: ${socketId}`).join(', '));
};

debugLog('Socket server starting...');

io.on('connection', (socket) => {
  debugLog('Client connected:', socket.id);

  // Handle rider going online/offline
  socket.on('rider-online', (data) => {
    debugLog('Rider online data received:', data);
    const { socketId, riderId } = data;
    
    if (!riderId) {
      debugLog('Error: riderId is missing in rider-online event');
      return;
    }
    
    // Store rider ID with socket ID
    onlineRiders.set(riderId, socket.id);
    debugLog(`Rider ${riderId} is now online with socket ${socket.id}`);
    
    // Log all online riders
    logOnlineRiders();
    
    // Emit back confirmation
    socket.emit('rider-online-confirmed', { success: true, riderId });
  });

  socket.on('rider-offline', (data) => {
    debugLog('Rider offline data received:', data);
    const { socketId, riderId } = data;
    
    if (!riderId) {
      debugLog('Error: riderId is missing in rider-offline event');
      return;
    }
    
    onlineRiders.delete(riderId);
    debugLog(`Rider ${riderId} is now offline`);
  });

  // Join a ride room
  socket.on('join-ride', (rideId) => {
    socket.join(rideId);
    debugLog(`Client ${socket.id} joined ride room ${rideId}`);
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
    
    // Log online riders before broadcasting
    debugLog(`About to broadcast booking ${bookingData.id} to riders.`);
    logOnlineRiders();
    
    // Broadcast to ALL sockets (to try to fix the communication issue)
    debugLog(`Broadcasting new-booking event to ALL sockets for ride ${bookingData.id || bookingData.rideId}`);
    io.emit('new-booking', bookingData);
    
    // Direct targeted broadcast to online riders
    let sentToCount = 0;
    onlineRiders.forEach((socketId, riderId) => {
      debugLog(`Sending booking directly to rider ${riderId} (socket ${socketId})`);
      const targetSocket = io.sockets.sockets.get(socketId);
      
      if (targetSocket) {
        targetSocket.emit('new-booking', bookingData);
        sentToCount++;
      } else {
        debugLog(`Warning: Socket ${socketId} for rider ${riderId} not found - removing stale entry`);
        onlineRiders.delete(riderId);
      }
    });
    
    debugLog(`Booking broadcast complete. Sent to ${sentToCount} online riders directly.`);
    
    // Emit a confirmation back to the requesting client
    socket.emit('booking-received', { 
      success: true, 
      rideId: bookingData.id || bookingData.rideId,
      sentToRiders: sentToCount
    });
  });

  // Legacy format
  socket.on('new-booking', (booking) => {
    debugLog('New booking request received (legacy new-booking):', booking);
    
    if (!booking || !booking.id) {
      debugLog('Error: Invalid booking data in new-booking event');
      return;
    }
    
    // Broadcast to all clients
    debugLog(`Broadcasting new-booking event to all clients for ride ${booking.id}`);
    io.emit('new-booking', booking);
    
    // Also broadcast directly to online riders
    onlineRiders.forEach((socketId, riderId) => {
      debugLog(`Sending booking directly to rider ${riderId} (socket ${socketId})`);
      io.to(socketId).emit('new-booking', booking);
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

  // Update rider location
  socket.on('update-rider-location', (data) => {
    debugLog('Rider location update received:', data);
    const { rideId, location } = data;
    
    if (!rideId || !location) {
      debugLog('Error: Invalid data in update-rider-location event');
      return;
    }
    
    // Broadcast to specific ride room
    debugLog(`Broadcasting rider-location-update for ride ${rideId}`);
    io.to(rideId).emit('rider-location-update', {
      rideId,
      location
    });
  });

  // Handle ride completion (alternative event name for compatibility)
  socket.on('complete-ride', (data) => {
    let rideId;
    let riderId;
    
    // Handle both string and object formats
    if (typeof data === 'string') {
      rideId = data;
      debugLog(`Ride ${rideId} completion request received via complete-ride (string format)`);
    } else if (typeof data === 'object' && data !== null) {
      rideId = data.rideId;
      riderId = data.riderId;
      debugLog(`Ride ${rideId} completion request received via complete-ride (object format) from rider ${data.riderId}`);
    } else {
      debugLog('Error: Invalid data format in complete-ride event');
      return;
    }
    
    if (!rideId) {
      debugLog('Error: rideId is missing in complete-ride event');
      return;
    }
    
    // Retrieve the active ride data
    const rideData = activeRides.get(rideId);
    if (!riderId && rideData) {
      riderId = rideData.riderId;
    }
    
    // Mark ride as completed
    activeRides.delete(rideId);
    
    // Broadcast to the specific ride room
    debugLog(`Broadcasting ride-completed event for ride ${rideId} (from complete-ride event)`);
    io.to(rideId).emit('ride-completed', rideId);
    
    // Also broadcast to ALL sockets as a fallback
    debugLog(`Also broadcasting ride-completed event to all sockets as fallback (from complete-ride event)`);
    io.emit('ride-completed', rideId);
    
    // Send direct confirmation back to the requesting socket
    socket.emit('ride-complete-confirmed', {
      success: true,
      rideId: rideId,
      timestamp: new Date().toISOString()
    });
    
    // Attempt to create ride history entry via the API
    if (riderId) {
      debugLog(`Attempting to create ride history for ride ${rideId} with rider ${riderId}`);
      
      // Make API call to create ride history
      axios.post('http://localhost:4000/api/ridehistories/socket-create', {
        riderId: riderId,
        rideId: rideId,
        status: 'completed',
        apiKey: 'server-side-key' // This should match what's expected in the API
      })
      .then(response => {
        debugLog(`Successfully created ride history: ${response.data.rideId}`);
      })
      .catch(error => {
        debugLog(`Error creating ride history: ${error.message}`);
      });
    } else {
      debugLog(`Cannot create ride history for ride ${rideId}: No rider ID available`);
    }
  });

  // Debug event handler for all events
  socket.onAny((event, ...args) => {
    if (!['connect', 'disconnect'].includes(event)) {
      debugLog(`[Debug] Socket ${socket.id} sent '${event}' event:`, args);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    debugLog('Client disconnected:', socket.id);
    
    // Remove from online riders if they were a rider
    for (const [riderId, socketId] of onlineRiders.entries()) {
      if (socketId === socket.id) {
        onlineRiders.delete(riderId);
        debugLog(`Rider ${riderId} removed from online riders due to disconnect`);
      }
    }
  });
});

const PORT = process.env.PORT || 4001;
server.listen(PORT, () => {
  debugLog(`Socket.IO server running on port ${PORT}`);
}); 