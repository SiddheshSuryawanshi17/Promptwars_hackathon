// Database Schema Reference
// Collections to create in MongoDB

// 1. Venues Collection
db.createCollection("venues");
db.venues.insertOne({
  _id: ObjectId(),
  name: "Grand Sports Stadium",
  location: {
    coordinate: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    address: "123 Stadium Ave, City",
    city: "City"
  },
  totalCapacity: 50000,
  facilities: ["fc1", "wr1", "wr2"],
  events: ["mov1", "mov2"],
  createdAt: new Date(),
  updatedAt: new Date()
});

// 2. Facilities Collection
db.createCollection("facilities");
db.facilities.insertOne({
  _id: ObjectId(),
  id: "fc1",
  venueId: ObjectId(), // Reference to venue
  name: "Food Court",
  type: "food", // Enum: food, washroom, restroom, parking, medical, info
  description: "Main food service area",
  location: {
    section: "North Wing",
    floor: "Ground"
  },
  capacity: {
    max: 200,
    current: 120,
    percentageUsed: 60
  },
  waitTime: {
    current: 15,
    average: 12,
    predicted: 18,
    trend: "increasing"
  },
  operatingHours: {
    openTime: "10:00",
    closeTime: "23:00"
  },
  status: "open", // Enum: open, closed, maintenance
  rating: {
    average: 4.5,
    count: 250
  },
  amenities: ["WiFi", "Seating", "Mobile payment"],
  lastUpdated: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
});

// 3. Events Collection
db.createCollection("events");
db.events.insertOne({
  _id: ObjectId(),
  id: "mov1",
  venueId: ObjectId(),
  title: "Main Event",
  type: "sports", // Enum: sports, concert, movie, etc
  description: "Championship match",
  startTime: new Date("2024-04-10T18:00:00"),
  endTime: new Date("2024-04-10T20:00:00"),
  duration: 120, // minutes
  location: {
    section: "Main Stadium",
    sectionId: "sec1"
  },
  expectedAttendees: 5000,
  currentAttendees: 4850,
  status: "upcoming", // Enum: upcoming, ongoing, completed, cancelled
  facilities: ["fc1", "wr1"],
  organizer: "Event Management Corp",
  ticketInfo: {
    type: "seat"
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// 4. Queue History Collection (for analytics)
db.createCollection("queueHistory");
db.queueHistory.insertOne({
  _id: ObjectId(),
  facilityId: ObjectId(),
  timestamp: new Date(),
  waitTime: 15,
  occupancy: 120,
  maxCapacity: 200,
  occupancyPercentage: 60,
  trend: "increasing",
  period: "2024-04" // YYYY-MM for grouping
});

// 5. Users Collection
db.createCollection("users");
db.users.insertOne({
  _id: ObjectId(),
  email: "user@example.com",
  passwordHash: "hashed_password",
  role: "user", // Enum: user, admin, staff
  preferences: {
    favorited: ["fc1", "mov1"],
    notifications: true,
    theme: "light"
  },
  notifications: {
    subscriptions: [
      {
        facilityId: "fc1",
        threshold: 10, // Alert if wait time below 10 mins
      }
    ]
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

// 6. Admin Logs Collection
db.createCollection("adminLogs");
db.adminLogs.insertOne({
  _id: ObjectId(),
  adminId: ObjectId(),
  action: "UPDATE_FACILITY",
  facilityId: "fc1",
  changes: {
    waitTime: { from: 15, to: 20 },
    status: { from: "open", to: "maintenance" }
  },
  timestamp: new Date(),
  details: "Manual update via admin dashboard"
});

// 7. Notifications Collection
db.createCollection("notifications");
db.notifications.insertOne({
  _id: ObjectId(),
  userId: ObjectId(),
  type: "facility_alert", // Enum: facility_alert, event_reminder, crowd_alert
  facility: {
    id: "fc1",
    name: "Food Court",
    waitTime: 10
  },
  message: "Food Court wait time is now 10 minutes!",
  read: false,
  timestamp: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
});

// Create Indexes for Performance
// Facilities Index
db.facilities.createIndex({ venueId: 1 });
db.facilities.createIndex({ type: 1 });
db.facilities.createIndex({ status: 1 });
db.facilities.createIndex({ id: 1 }, { unique: true });

// Events Index
db.events.createIndex({ venueId: 1 });
db.events.createIndex({ startTime: 1 });
db.events.createIndex({ status: 1 });

// Queue History Index (TTL - auto delete after 30 days)
db.queueHistory.createIndex({ timestamp: 1 });
db.queueHistory.createIndex({ facilityId: 1, timestamp: -1 });
db.queueHistory.createIndex({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

// Users Index
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Admin Logs Index
db.adminLogs.createIndex({ adminId: 1, timestamp: -1 });
db.adminLogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 86400 }); // 24 hours

// Notifications Index
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ timestamp: -1 });
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Sample Queries for Analytics

// 1. Get average wait time by facility per hour
db.queueHistory.aggregate([
  {
    $match: {
      timestamp: {
        $gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    }
  },
  {
    $group: {
      _id: {
        facilityId: "$facilityId",
        hour: { $hour: "$timestamp" }
      },
      avgWaitTime: { $avg: "$waitTime" },
      avgOccupancy: { $avg: "$occupancyPercentage" }
    }
  },
  {
    $sort: { "_id.facilityId": 1, "_id.hour": 1 }
  }
]);

// 2. Get peak hours for a facility
db.queueHistory.aggregate([
  {
    $match: {
      facilityId: ObjectId("facility_id_here")
    }
  },
  {
    $group: {
      _id: { $hour: "$timestamp" },
      avgWaitTime: { $avg: "$waitTime" },
      avgOccupancy: { $avg: "$occupancyPercentage" }
    }
  },
  {
    $sort: { avgOccupancy: -1 }
  }
]);

// 3. Get user notifications
db.notifications.find({
  userId: ObjectId("user_id_here"),
  read: false
}).sort({ timestamp: -1 }).limit(10);

// 4. Get facility health check
db.facilities.find({
  status: "open"
}).project({
  id: 1,
  name: 1,
  "capacity.percentageUsed": 1,
  waitTime: 1
});

// Backup Commands
// Export collection to JSON
// mongoexport --db venue-events --collection facilities --out facilities.json

// Import collection from JSON
// mongoimport --db venue-events --collection facilities --file facilities.json

// Backup entire database
// mongodump --db venue-events --out ./backup

// Restore entire database
// mongorestore --db venue-events ./backup/venue-events
