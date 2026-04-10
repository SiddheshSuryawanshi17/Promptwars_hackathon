# Venue Event Experience System - Setup Guide

## 📋 Project Overview

A real-time event coordination platform designed for large-scale sporting venues that tracks and displays:
- **Movie/Event Timings**: Schedule and countdown to events
- **Food Court Waiting Times**: Real-time queue management and wait estimates
- **Washroom Availability**: Live occupancy and wait times
- **Facility Status**: Opening/closing times and maintenance updates
- **Real-time Updates**: WebSocket-based live synchronization across all devices

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────┐
│           Mobile/Web Attendee App               │
│  (React Frontend - Real-time Updates)           │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴─────────┐
        │                  │
        ▼                  ▼
    REST API          WebSocket
    (Polling)         (Real-time)
        │                  │
        └────────┬─────────┘
                 ▼
    ┌────────────────────────────┐
    │   Express Backend Server    │
    │ (Node.js + Socket.io)      │
    └────────────┬───────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
   Database            Admin Dashboard
  (MongoDB)           (React + REST API)
```

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ and npm/yarn
- MongoDB (or use in-memory storage for demo)
- Git

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The server will start on `http://localhost:4000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will open on `http://localhost:5173`

### Admin Dashboard Setup

```bash
cd admin
npm install
npm run dev
```

Access admin panel on `http://localhost:5174`

## 📡 API Endpoints

### Public Endpoints (Attendees)

#### Get All Facilities
```
GET /api/facilities
```

Response:
```json
[
  {
    "id": "fc1",
    "name": "Food Court",
    "type": "food",
    "currentWaitTime": 15,
    "currentOccupancy": 120,
    "maxCapacity": 200,
    "status": "open",
    "openingTime": "10:00",
    "closingTime": "23:00",
    "lastUpdated": "2024-04-10T18:30:00Z"
  }
]
```

#### Get Specific Facility
```
GET /api/facilities/:id
```

#### Get All Events
```
GET /api/events
```

Response:
```json
[
  {
    "id": "mov1",
    "title": "Main Event",
    "startTime": "18:00",
    "duration": 120,
    "location": "Stadium A",
    "attendees": 5000,
    "status": "upcoming"
  }
]
```

### Admin Endpoints

#### Update Facility Status
```
POST /api/facilities/:id/update
Content-Type: application/json

{
  "currentWaitTime": 20,
  "currentOccupancy": 150,
  "status": "open"
}
```

#### Get Analytics
```
GET /api/admin/analytics
```

Response:
```json
{
  "totalFacilities": 3,
  "avgWaitTime": 12,
  "totalOccupancy": 350,
  "totalCapacity": 500,
  "openFacilities": 3
}
```

## 🔌 WebSocket Events

### Client → Server

**Subscribe to Facility Updates**
```javascript
socket.emit('subscribe', 'fc1');
```

**User Location Tracking**
```javascript
socket.emit('userLocation', {
  facilityId: 'fc1',
  timestamp: Date.now()
});
```

### Server → Client

**Initial Data**
```javascript
socket.on('initialData', (data) => {
  // Contains all facilities and events
});
```

**Facility Update (Real-time)**
```javascript
socket.on('facilityUpdate', (data) => {
  // { facilityId: 'fc1', facility: {...} }
});
```

**Heatmap Update**
```javascript
socket.on('heatmapUpdate', (data) => {
  // User location heatmap data
});
```

## 📊 Data Models

### Venue
```javascript
{
  id: String,
  name: String,
  capacity: Number,
  facilities: [Facility],
  address: String,
  coordinates: { lat: Number, lng: Number }
}
```

### Facility
```javascript
{
  id: String,
  name: String,
  type: 'food' | 'washroom' | 'restroom' | 'parking',
  currentWaitTime: Number,
  maxCapacity: Number,
  currentOccupancy: Number,
  status: 'open' | 'closed' | 'maintenance',
  openingTime: String,
  closingTime: String,
  lastUpdated: Date
}
```

### Event
```javascript
{
  id: String,
  title: String,
  startTime: String (HH:MM),
  duration: Number (minutes),
  location: String,
  attendees: Number,
  status: 'upcoming' | 'ongoing' | 'completed'
}
```

## 🎯 Key Features Implementation

### 1. Real-Time Wait Time Updates
- Server updates every 10 seconds
- WebSocketemits changes to all connected clients
- Frontend automatically refreshes UI

### 2. Queue Management
- Manual updates via admin dashboard
- Automatic queue detection (with IoT sensors)
- Predicted wait times based on occupancy trends

### 3. Mobile-Responsive Design
- Works on phones, tablets, and desktops
- Touch-friendly buttons and gestures
- Offline support ready (can be added)

### 4. Admin Controls
- Visual dashboard with analytics
- Manual facility status updates
- Real-time metrics
- Bulk updates capability

## 🔒 Security Considerations

- Add JWT authentication for admin endpoints
- Rate limiting on API calls
- HTTPS in production
- Input validation on all endpoints
- CORS configured properly

## 📈 Performance Optimization

- Use Redis for caching facility data
- Implement database indexing
- Optimize WebSocket connections
- Lazy load images
- Minify and compress assets

## 🧪 Testing

Run backend tests:
```bash
npm test
```

## 🚢 Deployment

### Docker Setup
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Variables (Production)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@db.mongodb.net/venue-events
JWT_SECRET=your-strong-secret-key
CORS_ORIGIN=https://yourdomain.com
PORT=4000
```

## 📞 Support

For issues or feature requests, check the documentation or create an issue in the repository.

## 📝 License

MIT License - Feel free to use and modify as needed.
