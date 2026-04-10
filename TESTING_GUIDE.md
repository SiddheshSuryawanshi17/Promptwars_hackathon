# Testing Guide

## Manual Testing Scenarios

### Scenario 1: Real-Time Facility Updates

**Objective**: Verify WebSocket real-time updates work correctly

**Steps**:
1. Open Frontend app in browser: http://localhost:5173
2. Open Admin Dashboard in another tab: http://localhost:5174
3. Note the current wait time for "Food Court"
4. In Admin Dashboard, click Edit on Food Court
5. Change wait time to a significantly different value (e.g., 45 minutes)
6. Click Save
7. Return to Frontend tab and observe the wait time updates in real-time

**Expected Result**:
- Wait time updates within 1 second
- Connection status shows "connected"
- No page refresh needed

---

### Scenario 2: Occupancy Percentage Changes

**Objective**: Verify occupancy bar updates correctly

**Steps**:
1. In Frontend, note occupancy percentage for Food Court
2. In Admin Dashboard, click Edit on Food Court
3. Change occupancy to near max capacity (e.g., 180/200)
4. Click Save
5. Watch the occupancy bar in Frontend

**Expected Result**:
- Occupancy bar fills to near max
- Color changes to red (>80%)
- Percentage displays correctly

---

### Scenario 3: Facility Status Changes

**Objective**: Verify status toggles work

**Steps**:
1. Admin Dashboard - Edit Food Court
2. Change status from "open" to "closed"
3. Save and check Frontend
4. Change status back to "open"
5. Verify in Frontend

**Expected Result**:
- Facility card shows correct status badge
- Close state shows red indicator
- Card becomes slightly opaque when closed

---

### Scenario 4: Event Countdown Timer

**Objective**: Verify event countdown is accurate

**Steps**:
1. Frontend app - Click "Events" tab
2. Observe the countdown timer for "Main Event"
3. Wait 30 seconds
4. Verify countdown decreased

**Expected Result**:
- Timer counts down correctly
- Shows remaining hours, minutes
- Updates without refresh

---

### Scenario 5: Connection Status

**Objective**: Verify connection indicator works

**Steps**:
1. Open Frontend app
2. Confirm green connection indicator
3. Stop backend server
4. Observe connection status change to red
5. Restart backend server
6. Verify reconnection and green indicator

**Expected Result**:
- Green indicator when connected
- Red indicator when disconnected
- Auto-reconnects when backend restarts

---

### Scenario 6: Admin Analytics

**Objective**: Verify analytics dashboard displays correct data

**Steps**:
1. Open Admin Dashboard
2. Check analytics cards:
   - Total Facilities (should show 3)
   - Average Wait Time
   - Overall Occupancy percentage
   - Open Facilities count
3. Update a facility
4. Refresh page
5. Verify metrics update

**Expected Result**:
- All metrics display correct values
- Metrics match facility data
- Updates reflect in analytics

---

### Scenario 7: Multiple User Synchronization

**Objective**: Verify multiple clients stay synchronized

**Steps**:
1. Open Frontend in 2 browser windows
2. Open Admin Dashboard in 3rd window
3. Make changes in Admin Dashboard
4. Both Frontend windows should update simultaneously

**Expected Result**:
- Both Frontend windows show same data
- No delay between updates
- All synchronized without page refresh

---

## Automated Testing

### Backend API Tests

```bash
cd backend
npm test
```

**Test Cases**:
- GET /api/facilities - returns array of facilities
- GET /api/facilities/:id - returns single facility
- POST /api/facilities/:id/update - updates facility
- GET /api/events - returns events
- GET /api/admin/analytics - returns analytics

### Frontend Component Tests

```bash
cd frontend
npm test
```

**Test Cases**:
- VenueDashboard renders facilities
- EventsList renders events
- WebSocket connection established
- Real-time updates trigger re-render

---

## Load Testing

### Using Apache Bench

```bash
# Test 1000 requests with 50 concurrent connections
ab -n 1000 -c 50 http://localhost:4000/api/facilities

# Test POST requests
ab -n 500 -c 25 -p data.json -T application/json \
  http://localhost:4000/api/facilities/fc1/update
```

### Using Hey

```bash
# WebSocket connections test
hey -n 1000 -c 100 http://localhost:4000
```

---

## Performance Benchmarks

### Expected Response Times
- API GET endpoints: < 50ms
- API POST endpoints: < 100ms
- WebSocket latency: < 50ms
- Page load time: < 2000ms
- Real-time update delay: < 1s

### System Targets
- Concurrent users: 10,000+
- Requests/second: 1,000+
- Database operations: < 100ms
- Uptime: 99.9%

---

## Browser Compatibility Testing

### Tested Browsers
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Test Checklist
- [ ] Real-time updates work
- [ ] Responsive layout functions
- [ ] WebSocket connection stable
- [ ] No console errors
- [ ] CSS renders correctly
- [ ] Touch events work (mobile)

---

## Security Testing

### Test Cases

**Input Validation**:
```bash
# Try to inject invalid data
curl -X POST http://localhost:4000/api/facilities/fc1/update \
  -H "Content-Type: application/json" \
  -d '{
    "currentWaitTime": "invalid",
    "currentOccupancy": -100,
    "status": "invalid_status"
  }'
```

**XSS Prevention**:
```bash
# Try to inject script tags
curl -X POST http://localhost:4000/api/facilities/fc1/update \
  -H "Content-Type: application/json" \
  -d '{
    "currentWaitTime": "<script>alert(1)</script>",
    "status": "<img src=x onerror='alert(1)'>"
  }'
```

**CORS Testing**:
```bash
# Test CORS headers
curl -H "Origin: http://localhost:3000" -v http://localhost:4000/api/facilities
```

---

## Data Consistency Testing

### Test: Concurrent Updates

**Objective**: Verify data consistency with simultaneous updates

**Steps**:
1. Start two admin sessions
2. Both update same facility simultaneously
3. Verify only one update applies or conflicts handled

**Expected Result**:
- Last write wins
- No data corruption
- Clients notified correctly

---

## Stress Testing Script

```javascript
// Place in backend/tests/stress-test.js
const axios = require('axios');

async function stressTest() {
  const requests = [];

  for (let i = 0; i < 100; i++) {
    requests.push(
      axios.post('http://localhost:4000/api/facilities/fc1/update', {
        currentWaitTime: Math.floor(Math.random() * 60),
        currentOccupancy: Math.floor(Math.random() * 200)
      })
    );
  }

  try {
    await Promise.all(requests);
    console.log('✅ All requests succeeded');
  } catch (error) {
    console.error('❌ Stress test failed:', error.message);
  }
}

stressTest();
```

Run with:
```bash
node tests/stress-test.js
```

---

## User Acceptance Testing (UAT)

### Admin User Workflow
- [ ] Can login to admin dashboard
- [ ] Can view all facilities
- [ ] Can update wait times
- [ ] Can change facility status
- [ ] Can see real-time metrics
- [ ] Changes immediately reflect in user app

### End User Workflow
- [ ] Can see all facilities
- [ ] Can see event schedule
- [ ] Can see real-time wait times
- [ ] Connection status visible
- [ ] Can expand facility for details
- [ ] Information updates automatically

---

## Bug Regression Checklist

After each update, verify:
- [ ] Real-time updates still work
- [ ] No console errors
- [ ] Mobile responsive layout OK
- [ ] API responses correct
- [ ] Admin updates reflected in users
- [ ] WebSocket connections stable
- [ ] Analytics calculations accurate
- [ ] Status badges display correctly

---

## Monitoring & Logging

### Backend Logging

```javascript
// Already implemented in server.js
console.log(`New client connected: ${socket.id}`);
console.log(`Client disconnected: ${socket.id}`);
console.log(`Server running on port ${PORT}`);
```

### Frontend Error Logging

```javascript
// Add in App.jsx
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

---

## Test Report Template

```
Test Date: ____/____/______
Tester: ___________________
Version: ___________________

Scenario: _________________
Environment: _______________

Result: ☐ PASS ☐ FAIL ☐ PENDING

Test Steps:
1. ___________________
2. ___________________
3. ___________________

Expected Outcome:
___________________

Actual Outcome:
___________________

Issues Found:
___________________

Notes:
___________________
```

---

**Testing is essential to ensure system reliability and user satisfaction!**
