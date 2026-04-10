const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory data store (for demo - replace with database)
const venueData = {
  facilities: {
    foodCourt: {
      id: 'fc1',
      name: 'Food Court',
      type: 'food',
      currentWaitTime: 15,
      maxCapacity: 200,
      currentOccupancy: 120,
      status: 'open',
      openingTime: '10:00',
      closingTime: '23:00',
      lastUpdated: new Date()
    },
    washroom1: {
      id: 'wr1',
      name: 'Washroom - North Wing',
      type: 'washroom',
      currentWaitTime: 5,
      maxCapacity: 15,
      currentOccupancy: 8,
      status: 'open',
      openingTime: '10:00',
      closingTime: '23:00',
      lastUpdated: new Date()
    },
    washroom2: {
      id: 'wr2',
      name: 'Washroom - South Wing',
      type: 'washroom',
      currentWaitTime: 8,
      maxCapacity: 15,
      currentOccupancy: 10,
      status: 'open',
      openingTime: '10:00',
      closingTime: '23:00',
      lastUpdated: new Date()
    }
  },
  events: {
    movie1: {
      id: 'mov1',
      title: 'Main Event',
      startTime: '18:00',
      duration: 120,
      location: 'Stadium A',
      attendees: 5000,
      status: 'upcoming'
    },
    movie2: {
      id: 'mov2',
      title: 'Concert',
      startTime: '20:30',
      duration: 90,
      location: 'Stadium B',
      attendees: 3000,
      status: 'upcoming'
    }
  }
};

// REST API Endpoints
app.get('/api/facilities', (req, res) => {
  res.json(Object.values(venueData.facilities));
});

app.get('/api/facilities/:id', (req, res) => {
  const facility = Object.values(venueData.facilities).find(f => f.id === req.params.id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found' });
  }
  res.json(facility);
});

app.get('/api/events', (req, res) => {
  res.json(Object.values(venueData.events));
});

app.get('/api/events/:id', (req, res) => {
  const event = Object.values(venueData.events).find(e => e.id === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

// Update facility status (for admin)
app.post('/api/facilities/:id/update', (req, res) => {
  const { waitTime, occupancy, status } = req.body;

  const facility = Object.values(venueData.facilities).find(f => f.id === req.params.id);
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found' });
  }

  if (waitTime !== undefined) facility.currentWaitTime = waitTime;
  if (occupancy !== undefined) facility.currentOccupancy = occupancy;
  if (status !== undefined) facility.status = status;
  facility.lastUpdated = new Date();

  // Broadcast update to all connected clients
  io.emit('facilityUpdate', {
    facilityId: req.params.id,
    facility: facility
  });

  res.json({ success: true, facility });
});

// WebSocket events
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Send initial data
  socket.emit('initialData', venueData);

  // Subscribe to facility updates
  socket.on('subscribe', (facilityId) => {
    socket.join(`facility_${facilityId}`);
    const facility = Object.values(venueData.facilities).find(f => f.id === facilityId);
    if (facility) {
      socket.emit('facilityData', facility);
    }
  });

  // Unsubscribe from facility
  socket.on('unsubscribe', (facilityId) => {
    socket.leave(`facility_${facilityId}`);
  });

  // User navigation tracking
  socket.on('userLocation', (data) => {
    console.log(`User ${socket.id} at: ${JSON.stringify(data)}`);
    io.emit('heatmapUpdate', data);
  });

  // Client disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Simulate queue changes (demo purpose)
setInterval(() => {
  const facilities = Object.values(venueData.facilities);

  facilities.forEach(facility => {
    // Simulate random wait time changes
    const changePercent = (Math.random() - 0.5) * 0.2;
    facility.currentWaitTime = Math.max(0, Math.round(facility.currentWaitTime * (1 + changePercent)));

    // Simulate occupancy changes
    facility.currentOccupancy = Math.round(
      facility.maxCapacity * (0.3 + Math.random() * 0.6)
    );
    facility.lastUpdated = new Date();

    // Broadcast to all clients
    io.emit('facilityUpdate', {
      facilityId: facility.id,
      facility: facility
    });
  });
}, 10000); // Update every 10 seconds

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
