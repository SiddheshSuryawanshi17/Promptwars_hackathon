# Quick Reference Guide

## Getting Started in 2 Minutes

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:4000
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

### 3. Start Admin
```bash
cd admin
npm install
npm run dev
# Admin runs on http://localhost:5174
```

## Real-Time Data Structure

### Facility Object
```javascript
{
  id: "fc1",                    // Unique identifier
  name: "Food Court",           // Display name
  type: "food",                 // Type: food, washroom, etc
  currentWaitTime: 15,          // Wait in minutes
  maxCapacity: 200,             // Maximum people
  currentOccupancy: 120,        // Current people
  status: "open",               // open, closed, maintenance
  openingTime: "10:00",         // 24-hour format
  closingTime: "23:00",         // 24-hour format
  lastUpdated: "2024-04-10..." // ISO timestamp
}
```

### Event Object
```javascript
{
  id: "mov1",
  title: "Main Event",
  startTime: "18:00",           // 24-hour format
  duration: 120,                // minutes
  location: "Stadium A",
  attendees: 5000,
  status: "upcoming"            // upcoming, ongoing, completed
}
```

## Key API Calls

### Get All Facilities
```bash
curl http://localhost:4000/api/facilities
```

### Update Facility (Admin Only)
```bash
curl -X POST http://localhost:4000/api/facilities/fc1/update \
  -H "Content-Type: application/json" \
  -d '{
    "currentWaitTime": 20,
    "currentOccupancy": 150,
    "status": "open"
  }'
```

### Get All Events
```bash
curl http://localhost:4000/api/events
```

### Get Admin Analytics
```bash
curl http://localhost:4000/api/admin/analytics
```

## WebSocket Events (Frontend)

### Connect to Server
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000');
```

### Listen for Initial Data
```javascript
socket.on('initialData', (data) => {
  console.log('Facilities:', data.facilities);
  console.log('Events:', data.events);
});
```

### Get Real-Time Updates
```javascript
socket.on('facilityUpdate', (data) => {
  console.log('Updated facility:', data.facility);
});
```

### Subscribe to Specific Facility
```javascript
socket.emit('subscribe', 'fc1');
```

## Frontend Components

### App.jsx
- Main component with tab navigation
- Handles WebSocket connection
- Switches between Facilities and Events views

### VenueDashboard.jsx
- Displays all facilities in grid
- Shows wait times with color coding
- Expandable cards with details
- Occupancy progress bars

### EventsList.jsx
- Lists upcoming events
- Shows countdown timers
- Event details and actions

## Admin Dashboard

### Key Sections
1. **Analytics Cards**: Total facilities, avg wait time, occupancy, open count
2. **Facilities Table**: List all facilities with quick stats
3. **Edit Modal**: Update wait time, occupancy, status

### Admin Update Flow
1. Click Edit button on facility row
2. Modal opens with current values
3. Modify wait time, occupancy, status
4. Click Save
5. All connected clients see update in real-time

## Service Architecture

```
┌─ Queue Analytics Service
│  ├─ Predict wait time
│  ├─ Calculate facility score
│  ├─ Find peak hours
│  └─ Recommend optimal visit time

└─ Notification Service
   ├─ Send user notifications
   ├─ Broadcast facility alerts
   ├─ Track subscriptions
   └─ Store notification history
```

## Environment Variables

`.env` file in backend/:
```
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/venue-events
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| WebSocket connection failed | Ensure backend is running on :4000 |
| CORS error | Check CORS_ORIGIN in .env matches your frontend URL |
| Port already in use | Kill process: `lsof -i :PORT \| kill -9 PID` |
| Module not found | Run `npm install` in that directory |
| DB connection error | Check MongoDB is running or use in-memory mode |

## File Organization

```
backend/
├── server.js                 # Main server with Socket.io
├── routes/
│   └── admin.js             # Admin API routes
├── services/
│   ├── queueAnalytics.js    # Wait time predictions
│   └── notificationService.js # Notifications
└── package.json

frontend/
├── App.jsx                  # Main app
├── App.css                  # Styles
├── components/
│   ├── VenueDashboard.jsx
│   ├── VenueDashboard.css
│   ├── EventsList.jsx
│   └── EventsList.css
└── package.json

admin/
├── AdminDashboard.jsx       # Admin UI
├── AdminDashboard.css       # Admin styles
└── package.json
```

## Testing Real-Time Updates

The backend automatically updates queue data every 10 seconds. To see it:
1. Open Frontend in browser
2. Observe facility cards updating automatically
3. Note the "Last updated" timestamp changing

## Customization Tips

### Add New Facility Type
Edit `backend/server.js`:
```javascript
const newFacility = {
  id: 'new1',
  name: 'Gift Shop',
  type: 'shop',
  // ... rest of properties
};
```

### Change Update Interval
In `backend/server.js`, modify:
```javascript
setInterval(() => {
  // update logic
}, 30000); // 30 seconds (currently 10000 = 10s)
```

### Add Custom Colors
In `frontend/App.css`, add:
```css
.facility-card.shop {
  border-left-color: #purple;
}
```

## Performance Optimization

- Use Redis for facility data caching
- Implement database indexing on facilityId
- Minify frontend builds for production
- Enable gzip compression
- Use CDN for static assets

## Deployment Checklist

- [ ] Set NODE_ENV=production
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS
- [ ] Setup MongoDB Atlas
- [ ] Configure CORS for production domain
- [ ] Setup error logging
- [ ] Monitor server performance
- [ ] Setup backup strategy
- [ ] Test under load

---

**For full documentation, see SETUP_GUIDE.md, FEATURES_ROADMAP.md, and PROJECT_DESIGN.md**
