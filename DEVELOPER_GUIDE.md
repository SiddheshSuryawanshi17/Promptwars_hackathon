# 👨‍💻 VenueFlow - Developer Guide

## Project Structure

```
Promptwars_hackathon/
├── 📄 server.js                    # Backend server (Node.js + Express)
├── 📄 App.js                       # Frontend main component (React)
├── 📄 package.json                 # Dependencies
├── 📄 .env                         # Environment configuration
├── 📄 setup.js                     # One-click setup script
├── 🐳 Dockerfile                   # Docker configuration
├── 🐳 docker-compose.simple.yml    # Docker compose
├── 📚 QUICK_START.md              # Quick start guide
├── 📚 TROUBLESHOOTING.md          # Troubleshooting guide
└── 📚 README.md                    # Full documentation
```

---

## Architecture Overview

### Backend Architecture (Node.js)

```
server.js
├── Express Setup
│   ├── CORS Configuration
│   ├── Middleware (JSON parser)
│   └── Socket.io Setup
├── Data Models
│   ├── venueConfig (venue info, gates)
│   ├── facilities (concessions, restrooms, services)
│   ├── queueData (real-time queue info)
│   ├── crowdDensity (sector density levels)
│   ├── notifications (live feed)
│   └── userPoints (gamification)
├── Data Simulator
│   ├── simulateQueueUpdates() (every 10s)
│   ├── generateNotifications() (every 15s)
│   └── Realistic randomization
├── REST API Endpoints (8 endpoints)
│   ├── /api/venue
│   ├── /api/queues
│   ├── /api/crowd-density
│   ├── /api/facilities
│   ├── /api/notifications
│   ├── /api/nearest-facility
│   ├── /api/wait-time/:id
│   ├── /api/report-queue (POST)
│   └── /api/user-points/:id
├── WebSocket Events
│   ├── initial-data (on connection)
│   ├── queue-update (broadcast)
│   ├── crowd-density-update (broadcast)
│   ├── notification (broadcast)
│   └── Custom events (report-queue-update, update-location)
└── Server Startup
    └── Port 5000 (configurable via .env)
```

### Frontend Architecture (React)

```
App.js (Main Component)
├── State Management
│   ├── socket (WebSocket connection)
│   ├── queues (facility data)
│   ├── crowdDensity (heatmap data)
│   ├── notifications (live feed)
│   ├── userSector (user location)
│   └── userPoints (gamification score)
├── Components
│   ├── LandingPage
│   │   ├── Hero section
│   │   ├── Feature cards (3x)
│   │   └── CTA button
│   ├── VenueMap
│   │   ├── SVG stadium visualization
│   │   ├── Color-coded sectors (heatmap)
│   │   ├── Facility markers
│   │   └── Legend
│   ├── QueueDashboard
│   │   ├── Grid of facilities (2x grid)
│   │   ├── Wait time badges (color-coded)
│   │   ├── Expandable details
│   │   ├── Accessibility indicators
│   │   └── Alternative suggestions
│   ├── NotificationFeed
│   │   ├── Scrollable feed
│   │   ├── Icon-coded message types
│   │   ├── Urgent badges
│   │   └── Timestamps
│   ├── ChatbotConcierge
│   │   ├── Message chat UI
│   │   ├── Simulated AI responses
│   │   ├── Intent matching
│   │   └── Context-aware answers
│   ├── GamificationPanel
│   │   ├── Facility selector
│   │   ├── Queue length slider
│   │   ├── Report button
│   │   └── Points display
│   └── Dashboard (Main)
│       ├── Header with user info
│       ├── Accessibility banner
│       ├── All above components
│       └── Footer
├── Socket.io Integration
│   ├── Connect on mount
│   ├── Listen to real-time events
│   ├── Emit user actions
│   └── Disconnect on unmount
├── Styling
│   ├── Tailwind CSS dark mode
│   ├── High-contrast colors
│   ├── Responsive grid layout
│   └── Interactive hover states
└── Mobile Optimization
    ├── 100% responsive
    ├── Touch-friendly buttons
    ├── Mobile-first design
    └── Portrait/landscape support
```

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  VenueFlow Data Flow                     │
└─────────────────────────────────────────────────────────┘

User → Browser (React App)
  ↓
  ├→ Click Queue → emit('report-queue-update')
  ├→ Load Page → request(initial-data)
  └→ View Map → listen('crowd-density-update')

Browser ←→ Socket.io ←→ Backend (Node.js)

Backend
  ├→ REST API: GET /api/queues
  ├→ WebSocket: emit('queue-update') every 10s
  ├→ Simulator: randomQueue() updates
  ├→ Notifications: random alerts every 15s
  └→ Queue Calc: wait_time = (length × avg_service_time)

Database (In-Memory)
  ├→ venueConfig (static)
  ├→ facilities (static)
  ├→ queueData (dynamic - updates every 10s)
  ├→ crowdDensity (dynamic - updates every 10s)
  ├→ notifications (dynamic - new every 15s)
  └→ userPoints (persistent in session)
```

---

## Key Code Explanations

### 1. Queue Data Update (server.js line 114-141)

```javascript
// Simulates realistic queue fluctuations
const simulateQueueUpdates = () => {
  setInterval(() => {
    Object.keys(queueData).forEach(facilityId => {
      const facility = queueData[facilityId];

      // Random change between -2 to +2 minutes
      const change = Math.floor(Math.random() * 5) - 2;
      facility.currentWait = Math.max(2, facility.currentWait + change);

      // Queue length also fluctuates
      facility.queueLength = Math.max(
        0,
        facility.queueLength + Math.floor(Math.random() * 4) - 1
      );

      // Randomly close/open facilities
      if (Math.random() < 0.05) {
        facility.status = facility.status === "open" ? "maintenance" : "open";
      }
    });

    // Broadcast to all connected clients
    io.emit('queue-update', queueData);
  }, 10000); // Every 10 seconds
};
```

### 2. Heatmap Color Logic (App.js line 65-70)

```javascript
// Color intensity based on crowd density
const getSectorColor = (density) => {
  if (density > 75) return '#ef4444';    // Red (critical)
  if (density > 50) return '#f97316';    // Orange (high)
  if (density > 25) return '#eab308';    // Yellow (medium)
  return '#22c55e';                      // Green (low)
};
```

### 3. Real-Time Updates (App.js line 406-432)

```javascript
useEffect(() => {
  // Connect to backend
  const newSocket = io(SOCKET_URL);

  // Receive initial data
  newSocket.on('initial-data', (data) => {
    setQueues(data.queues);
    setCrowdDensity(data.crowdDensity);
  });

  // Subscribe to updates
  newSocket.on('queue-update', (data) => {
    setQueues(data);  // Real-time update every 10s
  });

  newSocket.on('crowd-density-update', (data) => {
    setCrowdDensity(data);  // Heatmap updates
  });

  // Cleanup on unmount
  return () => newSocket.disconnect();
}, []);
```

### 4. Wait Time Calculation (server.js line 232-246)

```javascript
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
  }
});
```

### 5. Crowdsourced Data (server.js line 248-269)

```javascript
app.post('/api/report-queue', (req, res) => {
  const { userId, facilityId, length } = req.body;

  // Reward user with points
  if (!userPoints[userId]) {
    userPoints[userId] = 0;
  }
  userPoints[userId] += 10;

  // Update queue with weighted average (30% user input, 70% current)
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
```

---

## How to Extend & Customize

### Add a New Facility

**In `server.js` (line 35-53):**

```javascript
facilities.concessions.push({
  id: "conc_6",
  name: "Popcorn Station",
  sector: "North",
  type: "snacks",
  accessible: true,
  x: 45,
  y: 25
});
```

Then initialize its queue data in `initializeQueues()`:

```javascript
queueData["conc_6"] = {
  id: "conc_6",
  name: "Popcorn Station",
  currentWait: Math.floor(Math.random() * 25) + 5,
  // ... rest of data
};
```

### Add a New WebSocket Event

**In `server.js` (line 279-308):**

```javascript
io.on('connection', (socket) => {
  // Your new event
  socket.on('custom-event', (data) => {
    console.log('User sent:', data);
    // Do something
    socket.broadcast.emit('custom-event-response', data);
  });
});
```

**In `App.js` (listen for it):**

```javascript
newSocket.on('custom-event-response', (data) => {
  console.log('Received:', data);
  // Update state
});
```

### Add Real Database (MongoDB)

**1. Install Mongoose:**
```bash
npm install mongoose
```

**2. In `server.js`, replace in-memory data:**
```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/venueflow');

// Define schema
const QueueSchema = new mongoose.Schema({
  id: String,
  name: String,
  currentWait: Number,
  // ... other fields
});

const Queue = mongoose.model('Queue', QueueSchema);

// Replace queueData initialization
const initializeQueues = async () => {
  const queues = await Queue.find();
  queues.forEach(q => {
    queueData[q.id] = q;
  });
};
```

### Add User Authentication

**1. Install JWT:**
```bash
npm install jwt-simple jsonwebtoken
```

**2. Add middleware in `server.js`:**
```javascript
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    req.user = jwt.verify(token, 'your-secret-key');
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Use on endpoints
app.get('/api/queues', authenticate, (req, res) => {
  res.json(queueData);
});
```

### Change Update Frequency

**In `server.js` line 140:**
```javascript
}, 10000); // Change 10000 to desired milliseconds
```

| Value | Frequency |
|-------|-----------|
| 5000 | Every 5 seconds (fast) |
| 10000 | Every 10 seconds (default) |
| 30000 | Every 30 seconds (slow) |

### Customize Styling

**Dark Mode Colors (App.js):**
- `slate-900` → Background
- `yellow-400` → Accent color
- `red-500` → Urgent/High wait time

**Try Tailwind color names:**
```javascript
// Examples
bg-slate-900 → bg-gray-950
text-yellow-400 → text-amber-400
border-red-500 → border-pink-500
hover:bg-yellow-500 → hover:bg-orange-500
```

---

## Performance Optimization

### 1. Reduce Re-renders

```javascript
// Use useMemo for expensive calculations
const filteredQueues = useMemo(() =>
  queues.filter(q => q.status === 'open'),
  [queues]
);
```

### 2. Limit Data in notifications Feed

```javascript
// Only keep last 20 notifications
if (notifications.length > 20)
  notifications.pop();
```

### 3. Debounce Updates

```javascript
// In server.js, reduce broadcast frequency
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};
```

### 4. Lazy Load Components

```javascript
// In React
import { lazy, Suspense } from 'react';

const ChatbotConcierge = lazy(() => import('./ChatbotConcierge'));

<Suspense fallback={<div>Loading...</div>}>
  <ChatbotConcierge />
</Suspense>
```

---

## Testing

### Backend API Testing

```bash
# Test API endpoint
curl http://localhost:5000/api/queues

# POST request
curl -X POST http://localhost:5000/api/report-queue \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","facilityId":"conc_1","length":10}'
```

### Frontend Testing

```bash
# Run Jest tests
npm test

# Test in browser console (F12)
socket.emit('report-queue-update', {
  facilityId: 'conc_1',
  length: 15
});
```

---

## Deployment

### Deploy to Heroku

```bash
# 1. Create Procfile
echo "web: node server.js" > Procfile

# 2. Create heroku app
heroku create venueflow

# 3. Deploy
git push heroku main
```

### Deploy with Vercel (Frontend)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod
```

### Deploy with Docker

```bash
# Build and run
docker build -t venueflow .
docker run -p 5000:5000 -p 3000:3000 venueflow
```

---

## Environment Variables

Create `.env` file:

```env
# Server
PORT=5000
NODE_ENV=development

# Frontend
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

# Optional Database
MONGODB_URI=mongodb://localhost:27017/venueflow

# Optional Auth
JWT_SECRET=your-secret-key

# Optional Analytics
DEBUG=*
```

---

## File Sizes & Performance

| File | Size | Role |
|------|------|------|
| server.js | ~9KB | Backend |
| App.js | ~15KB | Frontend |
| package.json | <1KB | Config |
| .env | <1KB | Config |

**Bundle size (production build):** ~150KB gzipped

---

## Common Patterns

### Update State from WebSocket

```javascript
newSocket.on('event-name', (data) => {
  setState(prevState => ({
    ...prevState,
    field: data
  }));
});
```

### Send Data to Backend

```javascript
async function submitData() {
  const res = await fetch('http://localhost:5000/api/report-queue', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, facilityId, length })
  });
  const result = await res.json();
  console.log(result);
}
```

### Calculate Distances

```javascript
function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
```

---

## Helpful Resources

- **Express Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Socket.io Guide**: https://socket.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/
- **Node.js Docs**: https://nodejs.org/docs/

---

## Next Steps

1. **Customize Theme** - Modify Tailwind colors in App.js
2. **Add More Facilities** - Update server.js data
3. **Integrate Database** - Replace in-memory with MongoDB
4. **Add Authentication** - Implement JWT login
5. **Deploy to Production** - Use Heroku or AWS
6. **Add Mobile App** - Build React Native version
7. **Integrate Real Sensors** - Connect IoT devices
8. **Advanced Analytics** - Track trends and patterns

---

Happy coding! 🚀
