const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { registerUser, loginUser, getUser, authMiddleware, verifyToken } = require('./auth');

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
      location: { x: conc.x, y: conc.y, sector: conc.sector },
      avgRating: null,
      reviewCount: 0
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
      location: { x: rest.x, y: rest.y, sector: rest.sector },
      avgRating: null,
      reviewCount: 0
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

// Facility Reviews data
let facilityReviews = {};

// User Orders Data
let userOrders = {};

// Concession menu items mapping
const concessionMenus = {
  'conc_1': [
    { id: 'item_1_1', name: 'Cheese Pizza Slice', price: 8.00, estimatedTime: '5 mins' },
    { id: 'item_1_2', name: 'Pepperoni Pizza Slice', price: 9.00, estimatedTime: '5 mins' }
  ],
  'conc_2': [
    { id: 'item_2_1', name: 'Classic Burger', price: 10.00, estimatedTime: '8 mins' },
    { id: 'item_2_2', name: 'Deluxe Burger', price: 12.00, estimatedTime: '10 mins' }
  ],
  'conc_3': [
    { id: 'item_3_1', name: 'Soda (Small)', price: 4.00, estimatedTime: '2 mins' },
    { id: 'item_3_2', name: 'Soda (Large)', price: 5.00, estimatedTime: '2 mins' }
  ],
  'conc_4': [
    { id: 'item_4_1', name: 'Hot Dog', price: 6.00, estimatedTime: '3 mins' },
    { id: 'item_4_2', name: 'Chili Dog', price: 7.50, estimatedTime: '4 mins' }
  ],
  'conc_5': [
    { id: 'item_5_1', name: 'Popcorn', price: 5.00, estimatedTime: '2 mins' },
    { id: 'item_5_2', name: 'Nachos', price: 6.50, estimatedTime: '3 mins' }
  ]
};

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

      // Ensure avgRating is kept up to date
      const reviews = facilityReviews[facilityId] || [];
      if (reviews.length > 0) {
        facility.avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
        facility.reviewCount = reviews.length;
      }

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

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const result = await registerUser(email, password, name);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing email or password' });
  }

  const result = await loginUser(email, password);
  if (result.error) {
    return res.status(400).json(result);
  }
  res.json(result);
});

app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const user = getUser(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});


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

// Toggle favorite facility
app.post('/api/user/favorites', authMiddleware, (req, res) => {
  const { facilityId } = req.body;
  const user = require('./auth').users[req.userId];
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (!user.favorites) user.favorites = [];
  
  const index = user.favorites.indexOf(facilityId);
  if (index > -1) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(facilityId);
  }
  
  res.json({ favorites: user.favorites });
});

// Add review to facility
app.post('/api/facility/:id/reviews', authMiddleware, (req, res) => {
  const facilityId = req.params.id;
  const { rating, comment } = req.body;
  const user = require('./auth').users[req.userId];
  
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Valid rating (1-5) required' });

  if (!facilityReviews[facilityId]) {
    facilityReviews[facilityId] = [];
  }
  
  // Check if user already reviewed
  const existingReviewIndex = facilityReviews[facilityId].findIndex(r => r.userId === req.userId);
  const newReview = {
    userId: req.userId,
    userName: user.name,
    rating,
    comment,
    timestamp: new Date()
  };
  
  if (existingReviewIndex > -1) {
    facilityReviews[facilityId][existingReviewIndex] = newReview;
  } else {
    facilityReviews[facilityId].push(newReview);
  }
  
  // Update queueData avgRating immediately
  if (queueData[facilityId]) {
    const reviews = facilityReviews[facilityId];
    queueData[facilityId].avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
    queueData[facilityId].reviewCount = reviews.length;
    io.emit('queue-update', queueData); // Broadcast update
  }

  res.json({ success: true, reviews: facilityReviews[facilityId] });
});

// Get reviews for facility
app.get('/api/facility/:id/reviews', (req, res) => {
  const facilityId = req.params.id;
  res.json(facilityReviews[facilityId] || []);
});

// Get concession menu
app.get('/api/concession-menu', (req, res) => {
  const menus = facilities.concessions.map(conc => ({
    ...conc,
    currentWait: queueData[conc.id] ? queueData[conc.id].currentWait : 0,
    items: concessionMenus[conc.id] || []
  }));
  res.json(menus);
});

// Get user orders
app.get('/api/orders', authMiddleware, (req, res) => {
  res.json(userOrders[req.userId] || []);
});

// Create new order (simulates successful payment)
app.post('/api/orders', authMiddleware, (req, res) => {
  const { concessionId, itemId } = req.body;
  const user = require('./auth').users[req.userId];
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  if (!userOrders[req.userId]) {
    userOrders[req.userId] = [];
  }
  
  const concession = facilities.concessions.find(c => c.id === concessionId);
  const items = concessionMenus[concessionId] || [];
  const item = items.find(i => i.id === itemId);
  
  if (!concession || !item) {
    return res.status(400).json({ error: 'Invalid concession or item' });
  }

  const order = {
    id: `ord_${Date.now()}`,
    concessionName: concession.name,
    concessionSector: concession.sector,
    itemName: item.name,
    price: item.price,
    estimatedTime: item.estimatedTime,
    status: 'preparing', // preparing, ready, picked_up
    timestamp: new Date()
  };
  
  userOrders[req.userId].unshift(order);
  
  // Simulate order getting ready after some time
  setTimeout(() => {
    order.status = 'ready';
    io.emit('notification', {
      id: Date.now(),
      type: 'alert',
      message: `Your order (${order.itemName}) at ${order.concessionName} is READY for pickup!`,
      timestamp: new Date(),
      urgent: true,
      userId: req.userId
    });
  }, 10000); // 10 seconds simulation

  res.json({ success: true, order, orders: userOrders[req.userId] });
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
