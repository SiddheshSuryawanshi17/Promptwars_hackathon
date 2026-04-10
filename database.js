const mongoose = require('mongoose');

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/venueflow';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection error:', error.message);
    console.log('Using in-memory data storage instead');
    return false;
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  points: { type: Number, default: 0 },
  role: { type: String, default: 'user' }, // user, staff, admin
  preferences: {
    queueAlerts: { type: Boolean, default: true },
    eventReminders: { type: Boolean, default: true },
    reservations: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Reservation Schema
const reservationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  concessionId: { type: String, required: true },
  item: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // pending, ready, picked_up, cancelled
  estimatedReadyTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Queue Data Schema
const queueSchema = new mongoose.Schema({
  facilityId: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  currentWait: { type: Number, default: 0 },
  queueLength: { type: Number, default: 0 },
  status: { type: String, default: 'open' },
  lastUpdated: { type: Date, default: Date.now }
});

// Transaction Schema (for payments)
const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, default: 'pending' }, // pending, completed, failed
  description: { type: String },
  stripeId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);
const Queue = mongoose.model('Queue', queueSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
  connectDB,
  User,
  Reservation,
  Queue,
  Transaction
};
