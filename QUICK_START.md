# 🏟️ VenueFlow - Quick Start Guide

## ⚡ Super Quick Start (3 Steps)

### Windows Users:
```bash
# Step 1: Install dependencies
npm install

# Step 2: Start backend (Terminal 1)
node server.js

# Step 3: Start frontend (Terminal 2)
npm start
```

### Mac/Linux Users:
```bash
# Step 1: Install dependencies
npm install

# Step 2: Run everything at once
npm run all
```

---

## 🚀 What You'll See

- **Frontend**: http://localhost:3000 (Beautiful Dark Mode Dashboard)
- **Backend API**: http://localhost:5000 (Real-time WebSocket Server)
- **Live Updates**: Queue times + Crowd density change every 10 seconds
- **Real Features**: All 6 major components working instantly

---

## 📋 System Requirements

- **Node.js**: v16+ (check: `node --version`)
- **npm**: v8+ (check: `npm --version`)
- **RAM**: 512MB+ free
- **Disk**: 500MB free
- **Ports**: 3000, 5000 must be available

---

## ✅ Installation Options

### Option A: Auto-Setup (Recommended)

**Windows:**
```bash
.\start.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Option B: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (if doesn't exist)
echo PORT=5000 > .env
echo NODE_ENV=development >> .env

# 3. Start Backend (in Terminal 1)
node server.js

# 4. Start Frontend (in Terminal 2)
npm start
```

### Option C: Docker (Easiest Container Setup)

```bash
# Build and run in Docker
docker-compose -f docker-compose.simple.yml up

# Access at http://localhost:3000
```

### Option D: Using npm Scripts

```bash
# Start both simultaneously (requires concurrently package)
npm run all

# Individual commands:
npm run server        # Backend only
npm run server:dev    # Backend with hot-reload
npm start             # Frontend only
```

---

## 🎯 Features to Try

Once the dashboard loads (http://localhost:3000):

### 1. **Live Venue Map**
   - Watch crowd density change in real-time
   - Color heatmap: Green (low) → Red (critical)
   - Updates every 10 seconds

### 2. **Smart Queue Dashboard**
   - 5 Concession Stands with dynamic wait times
   - 4 Restroom Blocks with occupancy levels
   - Click any queue to see details
   - Accessibility filters (♿ wheelchair accessible)

### 3. **Real-Time Notifications (Fan Sync)**
   - Alerts about gate status
   - Event updates
   - Queue warnings
   - Lost & Found alerts
   - New notification every 15 seconds

### 4. **AI Digital Concierge**
   - Ask: "Where is medical tent?"
   - Ask: "Which gate for Section 302?"
   - Ask: "Nearest restroom?"
   - Simulated AI responses with venue knowledge

### 5. **Gamified Crowd Reporting**
   - Report queue lengths
   - Earn "Fan Points"
   - Help other attendees
   - Track your points

### 6. **Accessibility Features**
   - ♿ High-contrast mode indicators
   - Wheelchair-accessible routes
   - ADA-compliant interface
   - Screen reader support labels

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux - Kill process on port 5000
lsof -ti :5000 | xargs kill -9
```

### Dependencies Install Failed
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Socket.io Connection Error
- Ensure backend is running on http://localhost:5000
- Check firewall settings
- Both ports 3000 and 5000 must be open

### Blank Dashboard
- Open browser console (F12)
- Check for errors
- Refresh page (Ctrl+R)
- Ensure WebSocket connection is established

---

## 📊 Project Structure

```
d:\Promptwars_hackathon\
├── server.js              # Backend (Node.js + Express + Socket.io)
├── App.js                 # Frontend (React)
├── package.json           # Dependencies
├── .env                   # Environment config
├── start.sh              # Auto-start script (Mac/Linux)
├── start.bat             # Auto-start script (Windows)
├── Dockerfile            # Docker config
└── docker-compose.simple.yml  # Easy Docker compose
```

---

## 🎮 Real-Time Data Simulation

The system simulates realistic venue data:

- **Queue Times**: 2-25 minutes (realistic variation)
- **Crowd Density**: 0-100% per sector (changes every 10s)
- **Occupancy**: 0-15 stalls per restroom (dynamic)
- **Notifications**: Random venue events (every 15s)
- **Status Changes**: Facilities randomly go to maintenance

---

## 🌐 API Endpoints (Backend)

All endpoints return real-time data:

```
GET  /api/venue              # Venue configuration
GET  /api/queues             # All facility queues
GET  /api/crowd-density      # Crowd heatmap by sector
GET  /api/facilities         # All facilities info
GET  /api/notifications      # Recent notifications
GET  /api/nearest-facility   # Find closest facility
GET  /api/wait-time/:id      # Wait time for facility
POST /api/report-queue       # Submit crowdsource data
GET  /api/user-points/:id    # User gamification points
```

---

## 📡 WebSocket Events

Real-time updates broadcast to all connected clients:

- `initial-data` - On connection
- `queue-update` - Every 10 seconds
- `crowd-density-update` - Every 10 seconds
- `notification` - Random events every 15 seconds
- `user-location-update` - Custom location sharing

---

## 🎨 Customization

### Change Port
Edit `.env`:
```
PORT=5001
```

### Change Update Frequency
In `server.js` line 140:
```javascript
}, 10000); // Change to 5000 for 5-second updates
```

### Add More Facilities
In `server.js` line 35-53, add to `facilities.concessions` or `facilities.restrooms`

### Change Theme Colors
In `App.js`, search for Tailwind color classes:
- `yellow-400` → Your primary color
- `slate-900` → Your background
- `red-500` → Wait time warnings

---

## 📚 Advanced Usage

### Development Mode with Hot Reload
```bash
npm install -g nodemon
nodemon server.js   # Terminal 1
npm start           # Terminal 2
```

### Production Build
```bash
npm run build       # Creates optimized frontend
NODE_ENV=production node server.js
```

### Run with Redis Caching (Optional)
Requires Redis installed:
```bash
# Backend will auto-connect if Redis available
npm run server
```

---

## ✨ What Makes VenueFlow Special

✅ **Real-Time Everything** - Updates every 10 seconds
✅ **Mobile Ready** - 100% responsive design
✅ **Accessibility First** - ADA compliant
✅ **Gamification** - Earn points by helping
✅ **AI Concierge** - Ask questions naturally
✅ **Live Heatmap** - Crowd density visualization
✅ **Zero Config** - Works out of the box
✅ **Scalable** - 75,000+ capacity venue ready

---

## 🆘 Still Having Issues?

1. Check Node.js version: `node --version` (need v16+)
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules: `rm -rf node_modules package-lock.json`
4. Reinstall: `npm install`
5. Check ports: Ensure 3000 and 5000 are free
6. Check firewall: Allow Node.js through firewall

---

## 🎉 You're Ready!

Your VenueFlow dashboard is ready to explore stadium venue coordination in real-time. Enjoy! 🏟️

**Questions?** Check the logs in terminal for any errors.
