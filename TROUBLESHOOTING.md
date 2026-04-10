# 🛠️ VenueFlow - Troubleshooting & Help Guide

## Quick Diagnosis

Run this to test your environment:
```bash
node --version    # Should be v16+
npm --version     # Should be v8+
```

---

## Common Issues & Solutions

### 1. ❌ "PORT 5000 Already in Use"

**Error:**
```
Error: listen EADDRINUSE :::5000
```

**Solutions:**

**Windows:**
```bash
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in .env
echo PORT=5001 > .env
```

**Mac/Linux:**
```bash
# Find and kill process
lsof -ti :5000 | xargs kill -9

# Or change port
echo PORT=5001 >> .env
```

---

### 2. ❌ "PORT 3000 Already in Use"

**Windows:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Mac/Linux:**
```bash
lsof -ti :3000 | xargs kill -9
```

**Alternative:** Use environment variable
```bash
# Mac/Linux
PORT=3001 npm start

# Windows (PowerShell)
$env:PORT=3001; npm start
```

---

### 3. ❌ "npm install Failed"

**Error:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still fails, force resolution
npm install --force
```

---

### 4. ❌ "Cannot find module 'react-scripts'"

**Error:**
```
Error: Cannot find module 'react-scripts'
```

**Solution:**
```bash
# Reinstall dependencies
npm install react-scripts

# Or complete reinstall
rm -rf node_modules package-lock.json
npm install
```

---

### 5. ❌ "Cannot find module 'express'"

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
# Install backend dependencies
npm install express socket.io cors dotenv

# Or use package.json update
npm install
```

---

### 6. ❌ "Socket Connection Failed" / "WebSocket Error"

**Error:**
```
WebSocket connection to 'ws://localhost:5000/socket.io/?...' failed
```

**Causes & Fixes:**

1. **Backend not running:**
   ```bash
   # Terminal 1 - Check backend is running
   node server.js
   # Should show: "VenueFlow backend running on port 5000"
   ```

2. **Connection string wrong:**
   - Check `App.js` line 8: `const SOCKET_URL = 'http://localhost:5000';`
   - Should match your backend URL

3. **Firewall blocking:**
   - Allow Node.js through firewall
   - Windows: Add exception in Windows Defender
   - Mac: Security & Privacy → Firewall

4. **CORS Issues:**
   - Check `server.js` line 11: Should allow `http://localhost:3000`

---

### 7. ❌ "Blank White Screen / 'No Data Loading'"

**Symptoms:**
- Dashboard loads but shows no data
- Queue times blank
- Crowd density not showing

**Solutions:**

1. **Check browser console (F12):**
   - Look for red error messages
   - Check Network tab for failed requests

2. **Verify backend is responding:**
   ```bash
   # In another terminal
   curl http://localhost:5000/api/queues
   # Should return JSON data
   ```

3. **Clear browser cache:**
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)
   - Select "All time" and "Cached images"

4. **Hard refresh:**
   - Ctrl+F5 (Windows/Linux)
   - Cmd+Shift+R (Mac)

---

### 8. ❌ "'npm' is not recognized" / "command not found: npm"

**Causes:**
- Node.js not installed
- npm path not in environment variables

**Solutions:**

1. **Install Node.js:**
   - Download from https://nodejs.org/
   - Run installer and restart terminal

2. **Add to PATH (Windows):**
   - Right-click "This PC" → Properties
   - Advanced system settings
   - Environment Variables
   - Add Node.js path to PATH

3. **Verify:**
   ```bash
   node --version
   npm --version
   ```

---

### 9. ❌ "Failed to start database" / "MongoDB connection error"

**Note:** VenueFlow runs with in-memory data store - no external database needed!

**If you modified code and added MongoDB:**
```bash
# Either:
# 1. Remove MongoDB requirement
# 2. Or start MongoDB service

# Mac/Linux
brew services start mongodb-community

# Windows (with MongoDB installed)
mongod

# Docker
docker run -d -p 27017:27017 mongo
```

---

### 10. ❌ "React app won't start / 'Something is wrong'"

**Error:**
```
Failed to compile
Error in ./src/App.js
```

**Solutions:**

```bash
# 1. Check for syntax errors
npm run build

# 2. Delete cache files
rm -rf node_modules/.cache

# 3. Full clean install
rm -rf node_modules package-lock.json .env
npm install

# 4. Start fresh
npm start
```

---

### 11. ❌ "ENOMEM: Out of Memory"

**Error:**
```
ENOMEM: out of memory, read
```

**Solution:**
```bash
# Increase Node.js memory
node --max-old-space-size=4096 server.js

# Or in Windows:
set NODE_OPTIONS=--max-old-space-size=4096
npm start
```

---

### 12. ❌ "ENOENT: no such file or directory"

**Error:**
```
ENOENT: no such file or directory, open '...'
```

**Solutions:**

1. **File doesn't exist:**
   ```bash
   # Check files exist
   ls -la
   ls server.js
   ls App.js
   ```

2. **Wrong working directory:**
   ```bash
   # Ensure you're in project root
   pwd    # Mac/Linux
   cd c:\path\to\Promptwars_hackathon  # Windows
   ```

3. **Create missing .env:**
   ```bash
   echo PORT=5000 > .env
   echo NODE_ENV=development >> .env
   ```

---

## Performance Issues

### Dashboard Updates Too Slow

**Check update interval in `server.js` (line 140):**
```javascript
}, 10000); // 10 seconds - change to 5000 for faster
```

### High CPU Usage

**Causes:**
- Too-frequent updates
- Too many facilities
- Browser tab count

**Solutions:**
```bash
# Reduce update frequency
# In server.js, change 10000 to 30000

# Close other browser tabs
# Close other Node processes
```

### "Takes 30 seconds to load data"

1. Check internet connection
2. Check backend logs for errors
3. Restart both servers
4. Clear browser cache

---

## Advanced Debugging

### Enable Verbose Logging

**Backend:**
```bash
DEBUG=* node server.js
```

**Frontend:**
```bash
REACT_APP_DEBUG=true npm start
```

### Check Socket.io Connection

**In browser console (F12):**
```javascript
// Check if socket is connected
io.emit('test', 'hello');

// Monitor all events
io.onAny((event, ...args) => {
  console.log(event, args);
});
```

### Test API Endpoints

**Using curl:**
```bash
# Test backend API
curl http://localhost:5000/api/queues
curl http://localhost:5000/api/crowd-density
curl http://localhost:5000/api/notifications
```

**Using fetch in browser console (F12):**
```javascript
fetch('http://localhost:5000/api/queues')
  .then(r => r.json())
  .then(data => console.log(data));
```

---

## Network & Firewall

### Check if Ports are Open

**Windows:**
```bash
netstat -an | findstr LISTENING
```

**Mac/Linux:**
```bash
netstat -tuln | grep LISTEN
# or
lsof -i -P -n
```

**Should show:**
- Port 3000: React frontend
- Port 5000: Node.js backend

### Allow Through Firewall

**Windows Defender:**
1. Open Windows Defender
2. Firewall & network protection
3. Allow app through firewall
4. Add Node.js

**Mac:**
1. System Preferences → Security & Privacy
2. Firewall Options
3. Add Node.js

---

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Full support |
| Firefox | 88+     | ✅ Full support |
| Safari  | 14+     | ✅ Full support |
| Edge    | 90+     | ✅ Full support |
| IE 11   | -       | ❌ Not supported |

**Fix for older browsers:**
```bash
npm install @babel/polyfill
```

---

## Getting Help

### Check Logs

1. **Backend logs:**
   - Look at terminal where `node server.js` runs
   - Copy error message

2. **Frontend logs:**
   - Press F12 (Developer tools)
   - Go to Console tab
   - Look for red errors

3. **Network logs:**
   - Press F12
   - Go to Network tab
   - Reload page
   - Check for failed requests

### Report Issues

Include:
1. Your OS (Windows/Mac/Linux)
2. Node.js version: `node --version`
3. npm version: `npm --version`
4. Exact error message
5. Steps to reproduce
6. Screenshots of error

---

## Still Stuck?

### Option 1: Fresh Install
```bash
cd ..
rm -rf Promptwars_hackathon
git clone https://github.com/your-repo/Promptwars_hackathon.git
cd Promptwars_hackathon
npm install
npm run setup
```

### Option 2: Docker (Simplest)
```bash
docker-compose -f docker-compose.simple.yml up
# Access at http://localhost:3000
```

### Option 3: Check README
```bash
# Read comprehensive guide
cat README.md
```

---

## Final Checklist

Before reporting an issue, verify:

- [ ] Node.js v16+ installed
- [ ] npm v8+ installed
- [ ] `npm install` completed without errors
- [ ] Port 3000 is free
- [ ] Port 5000 is free
- [ ] Both terminals running (`node server.js` and `npm start`)
- [ ] No error messages in either terminal
- [ ] Browser console shows no red errors
- [ ] You can access http://localhost:3000
- [ ] Real-time data updates every 10 seconds

✅ If all green, VenueFlow is working perfectly!

---

## Quick Reference Commands

```bash
# Setup
npm run setup              # One-click setup

# Development
npm start                  # Frontend only
node server.js             # Backend only
npm run all                # Both
npm run server:dev         # Backend with hot-reload

# Docker
npm run docker:compose     # Run in Docker
npm run docker:build       # Build Docker image
npm run docker:run         # Run Docker image

# Maintenance
npm cache clean --force    # Clear npm cache
npm update                 # Update all packages
npm outdated               # Check for updates

# Testing
curl http://localhost:5000/api/queues   # Test backend
npm test                                 # Run tests
```

---

**🎉 Your VenueFlow is ready! Enjoy!**
