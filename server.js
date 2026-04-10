const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ==================== DATA MODELS ====================

// Venue configuration
const venueConfig = {
  name: "Stadium Central",
  sectors: ["North", "South", "East", "West", "Center"],
  capacity: 75000,
  gates: [
    { id: 1, name: "Gate 1", sector: "North", status: "open" },
    { id: 2, name: "Gate 2", sector: "South", status: "open" },
    { id: 3, name: "Gate 3", sector: "East", status: "open" },
    { id: 4, name: "Gate 4", sector: "West", status: "open" }
  ]
};

// Facilities data
const facilities = {
  concessions: [
    { id: "conc_1", name: "Pizza Stand", sector: "North", type: "food", accessible: true, x: 20, y: 30 },
    { id: "conc_2", name: "Burger Hut", sector: "South", type: "food", accessible: true, x: 80, y: 70 },
    { id: "conc_3", name: "Soda Bar", sector: "East", type: "beverage", accessible: false, x: 80, y: 20 },
    { id: "conc_4", name: "Hot Dog Corner", sector: "West", type: "food", accessible: true, x: 20, y: 80 },
    { id: "conc_5", name: "Snack Shack", sector: "Center", type: "snacks", accessible: true, x: 50, y: 50 }
  ],
  restrooms: [
    { id: "rest_1", name: "Restroom Block A", sector: "North", type: "restroom", accessible: true, x: 15, y: 20, totalStalls: 15 },
    { id: "rest_2", name: "Restroom Block B", sector: "South", type: "restroom", accessible: true, x: 85, y: 80, totalStalls: 15 },
    { id: "rest_3", name: "Restroom Block C", sector: "East", type: "restroom", accessible: true, x: 90, y: 30, totalStalls: 12 },
    { id: "rest_4", name: "Restroom Block D", sector: "West", type: "restroom", accessible: true, x: 10, y: 70, totalStalls: 12 }
  ],
  services: [
    { id: "med_1", name: "Medical Tent", sector: "Center", type: "medical", x: 50, y: 45 },
    { id: "lost_1", name: "Lost & Found", sector: "Center", type: "lost_found", x: 50, y: 55 }
  ]
};

// Real-time queue data (simulated)
let queueData = {};

// Initialize queue data
const initializeQueues = () => {
  facilities.concessions.forEach(conc => {
    queueData[conc.id] = {
      id: conc.id,
      name: conc.name,
      currentWait: Math.floor(Math.random() * 25) + 5,
      queueLength: Math.floor(Math.random() * 30) + 3,
      avgServiceTime: 3,
      lastUpdated: new Date(),
      status: "open",
      accessible: conc.accessible,
      location: { x: conc.x, y: conc.y, sector: conc.sector }
    };
  });

  facilities.restrooms.forEach(rest => {
    queueData[rest.id] = {
      id: rest.id,
      name: rest.name,
      currentWait: Math.floor(Math.random() * 15) + 2,
      occupancy: Math.floor(Math.random() * rest.totalStalls),
      totalStalls: rest.totalStalls,
      lastUpdated: new Date(),
      status: "open",
      accessible: rest.accessible,
      location: { x: rest.x, y: rest.y, sector: rest.sector }
    };
  });
};

// Crowd density heatmap (sectors and their density levels 0-100)
let crowdDensity = {
  "North": Math.floor(Math.random() * 60) + 20,
  "South": Math.floor(Math.random() * 60) + 20,
  "East": Math.floor(Math.random() * 60) + 20,
  "West": Math.floor(Math.random() * 60) + 20,
  "Center": Math.floor(Math.random() * 80) + 40
};

// Real-time notifications feed
let notifications = [
  { id: 1, type: "alert", message: "Gate 4 is currently clear", timestamp: new Date(), urgent: false },
  { id: 2, type: "event", message: "Event starts in 15 minutes", timestamp: new Date(), urgent: false }
];

let notificationId = 3;

// User engagement data
let userPoints = {};

initializeQueues();

// ==================== DATA SIMULATOR ====================

// Simulate real-time queue updates
const simulateQueueUpdates = () => {
  setInterval(() => {
    Object.keys(queueData).forEach(facilityId => {
      const facility = queueData[facilityId];

      // Simulate queue fluctuations
      const change = Math.floor(Math.random() * 5) - 2; // Random change -2 to +2
      facility.currentWait = Math.max(2, facility.currentWait + change);
      facility.queueLength = Math.max(0, facility.queueLength + Math.floor(Math.random() * 4) - 1);
      facility.lastUpdated = new Date();

      // Randomly close/open facilities
      if (Math.random() < 0.05) {
        facility.status = facility.status === "open" ? "maintenance" : "open";
      }
    });

    // Update crowd density
    Object.keys(crowdDensity).forEach(sector => {
      const change = Math.floor(Math.random() * 10) - 5;
      crowdDensity[sector] = Math.max(0, Math.min(100, crowdDensity[sector] + change));
    });

    // Emit updates to all connected clients
    io.emit('queue-update', queueData);
    io.emit('crowd-density-update', crowdDensity);
  }, 10000); // Update every 10 seconds
};

// Generate random notifications
const generateNotifications = () => {
  const eventMessages = [
    { type: "alert", message: "Gate 2 is currently clear", urgent: false },
    { type: "event", message: "The halftime show starts in 5 minutes", urgent: false },
    { type: "alert", message: "Long wait at Pizza Stand (25 mins)", urgent: false },
    { type: "event", message: "Flash Mob starting in North Stand in 5 mins", urgent: true },
    { type: "alert", message: "Restroom Block C is at full capacity", urgent: false },
    { type: "alert", message: "Soda Bar is now open", urgent: false },
    { type: "lost_found", message: "Found: Red baseball cap at Lost & Found", urgent: false },
    { type: "medical", message: "First aid station temporarily closed (15 mins)", urgent: false }
  ];

  setInterval(() => {
    if (Math.random() < 0.3) {
      const randomMsg = eventMessages[Math.floor(Math.random() * eventMessages.length)];
      const notification = {
        id: notificationId++,
        ...randomMsg,
        timestamp: new Date()
      };
      notifications.unshift(notification);
      if (notifications.length > 20) notifications.pop();
      io.emit('notification', notification);
    }
  }, 15000); // Every 15 seconds
};

// ==================== REST API ENDPOINTS ====================

// Get venue config
app.get('/api/venue', (req, res) => {
  res.json(venueConfig);
});

// Get all queues
app.get('/api/queues', (req, res) => {
  res.json(queueData);
});

// Get crowd density
app.get('/api/crowd-density', (req, res) => {
  res.json(crowdDensity);
});

// Get facilities
app.get('/api/facilities', (req, res) => {
  res.json(facilities);
});

// Get notifications feed
app.get('/api/notifications', (req, res) => {
  res.json(notifications.slice(0, 10));
});

// Find nearest facility
app.get('/api/nearest-facility', (req, res) => {
  const { sector, type } = req.query;
  const facilityType = type === 'restroom' ? 'restrooms' : 'concessions';

  let nearest = null;
  let minDistance = Infinity;

  facilities[facilityType].forEach(facility => {
    if (facility.sector === sector) {
      const distance = 0; // Same sector
      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...facility, ...queueData[facility.id] };
      }
    }
  });

  if (!nearest) {
    // Find nearest across sectors
    facilities[facilityType].forEach(facility => {
      if (queueData[facility.id]) {
        const distance = Math.sqrt((50 - facility.x) ** 2 + (50 - facility.y) ** 2);
        if (distance < minDistance) {
          minDistance = distance;
          nearest = { ...facility, ...queueData[facility.id] };
        }
      }
    });
  }

  res.json(nearest || {});
});

// Calculate wait time for facility
app.get('/api/wait-time/:facilityId', (req, res) => {
  const facility = queueData[req.params.facilityId];
  if (facility) {
    res.json({
      id: facility.id,
      name: facility.name,
      currentWait: facility.currentWait,
      estimatedWait: Math.ceil(facility.currentWait * 1.1), // Add 10% buffer
      queueLength: facility.queueLength
    });
  } else {
    res.status(404).json({ error: 'Facility not found' });
  }
});

// Report queue info (gamification)
app.post('/api/report-queue', (req, res) => {
  const { userId, facilityId, length } = req.body;

  if (!userPoints[userId]) {
    userPoints[userId] = 0;
  }
  userPoints[userId] += 10; // Award 10 points

  // Update queue based on user report (weighted)
  if (queueData[facilityId]) {
    queueData[facilityId].queueLength = Math.round(
      (queueData[facilityId].queueLength * 0.7) + (length * 0.3)
    );
  }

  res.json({
    success: true,
    pointsEarned: 10,
    totalPoints: userPoints[userId]
  });
});

// Get user points
app.get('/api/user-points/:userId', (req, res) => {
  const points = userPoints[req.params.userId] || 0;
  res.json({ userId: req.params.userId, points });
});

// ==================== WEBSOCKET EVENTS ====================

io.on('connection', (socket) => {
  console.log('✓ New client connected:', socket.id);
  console.log('Sending initial data with crowdDensity:', crowdDensity);

  // Send initial data
  socket.emit('initial-data', {
    venue: venueConfig,
    queues: queueData,
    crowdDensity,
    facilities,
    notifications: notifications.slice(0, 10)
  });
  console.log('✓ Initial data sent to client:', socket.id);

  // Update user location for personalized recommendations
  socket.on('update-location', (data) => {
    socket.broadcast.emit('user-location-update', data);
  });

  // Report queue update from user
  socket.on('report-queue-update', (data) => {
    if (queueData[data.facilityId]) {
      queueData[data.facilityId].queueLength = Math.round(
        (queueData[data.facilityId].queueLength * 0.8) + (data.length * 0.2)
      );
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ==================== SERVER STARTUP ====================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`VenueFlow backend running on port ${PORT}`);
  simulateQueueUpdates();
  generateNotifications();
});

module.exports = { app, queueData, crowdDensity, facilities };
