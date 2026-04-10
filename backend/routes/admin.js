const express = require('express');
const router = express.Router();

// Mock database
const facilities = {
  'fc1': {
    id: 'fc1',
    name: 'Food Court',
    type: 'food',
    currentWaitTime: 15,
    maxCapacity: 200,
    currentOccupancy: 120,
    status: 'open'
  },
  'wr1': {
    id: 'wr1',
    name: 'Washroom - North Wing',
    type: 'washroom',
    currentWaitTime: 5,
    maxCapacity: 15,
    currentOccupancy: 8,
    status: 'open'
  }
};

// Get all facilities for admin
router.get('/facilities', (req, res) => {
  res.json(Object.values(facilities));
});

// Get specific facility
router.get('/facilities/:id', (req, res) => {
  const facility = facilities[req.params.id];
  if (!facility) {
    return res.status(404).json({ error: 'Facility not found' });
  }
  res.json(facility);
});

// Update facility status
router.post('/facilities/:id/update', (req, res) => {
  const { waitTime, occupancy, status } = req.body;
  const facility = facilities[req.params.id];

  if (!facility) {
    return res.status(404).json({ error: 'Facility not found' });
  }

  if (waitTime !== undefined) facility.currentWaitTime = waitTime;
  if (occupancy !== undefined) facility.currentOccupancy = occupancy;
  if (status !== undefined) facility.status = status;

  res.json({ success: true, facility });
});

// Bulk update facilities
router.post('/facilities/bulk-update', (req, res) => {
  const { updates } = req.body;

  updates.forEach(update => {
    if (facilities[update.id]) {
      Object.assign(facilities[update.id], update);
    }
  });

  res.json({ success: true, facilities: Object.values(facilities) });
});

// Get admin analytics
router.get('/analytics', (req, res) => {
  const stats = {
    totalFacilities: Object.keys(facilities).length,
    avgWaitTime: Math.round(
      Object.values(facilities).reduce((sum, f) => sum + f.currentWaitTime, 0) /
      Object.keys(facilities).length
    ),
    totalOccupancy: Object.values(facilities).reduce((sum, f) => sum + f.currentOccupancy, 0),
    totalCapacity: Object.values(facilities).reduce((sum, f) => sum + f.maxCapacity, 0),
    openFacilities: Object.values(facilities).filter(f => f.status === 'open').length
  };

  res.json(stats);
});

module.exports = router;
