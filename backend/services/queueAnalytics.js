/**
 * Queue Analytics Service
 * Calculates wait time predictions and occupancy analysis
 */

class QueueAnalytics {
  constructor() {
    this.facilityHistory = new Map();
  }

  /**
   * Record facility state for historical analysis
   */
  recordFacilityState(facilityId, state) {
    if (!this.facilityHistory.has(facilityId)) {
      this.facilityHistory.set(facilityId, []);
    }

    this.facilityHistory.get(facilityId).push({
      ...state,
      timestamp: new Date()
    });

    // Keep only last 24 hours of data
    const history = this.facilityHistory.get(facilityId);
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filtered = history.filter(h => h.timestamp > cutoffTime);
    this.facilityHistory.set(facilityId, filtered);
  }

  /**
   * Predict wait time based on current occupancy
   */
  predictWaitTime(facility) {
    const occupancyRatio = facility.currentOccupancy / facility.maxCapacity;

    // Base formula: wait time increases exponentially with occupancy
    if (occupancyRatio < 0.3) {
      return Math.round(facility.currentWaitTime * 0.5);
    } else if (occupancyRatio < 0.6) {
      return facility.currentWaitTime;
    } else if (occupancyRatio < 0.8) {
      return Math.round(facility.currentWaitTime * 1.5);
    } else {
      return Math.round(facility.currentWaitTime * 2.5);
    }
  }

  /**
   * Get occupancy trend
   */
  getOccupancyTrend(facilityId) {
    const history = this.facilityHistory.get(facilityId) || [];

    if (history.length < 2) {
      return 'stable'; // Not enough data
    }

    const recent = history.slice(-10);
    const occupancies = recent.map(h => h.currentOccupancy);

    const avg = occupancies.reduce((a, b) => a + b, 0) / occupancies.length;
    const latest = occupancies[occupancies.length - 1];

    const trend = latest - avg;

    if (trend > avg * 0.15) {
      return 'increasing';
    } else if (trend < -avg * 0.15) {
      return 'decreasing';
    } else {
      return 'stable';
    }
  }

  /**
   * Get optimal visit window (lowest expected wait time)
   */
  getOptimalVisitTime(facilityId) {
    const history = this.facilityHistory.get(facilityId) || [];

    if (history.length === 0) {
      return null;
    }

    // Group by hour
    const byHour = {};
    history.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      if (!byHour[hour]) {
        byHour[hour] = [];
      }
      byHour[hour].push(record.currentWaitTime);
    });

    // Find hour with minimum average wait time
    let minHour = null;
    let minWait = Infinity;

    Object.entries(byHour).forEach(([hour, waits]) => {
      const avgWait = waits.reduce((a, b) => a + b, 0) / waits.length;
      if (avgWait < minWait) {
        minWait = avgWait;
        minHour = hour;
      }
    });

    return {
      hour: minHour,
      expectedWait: Math.round(minWait),
      confidence: history.length >= 50 ? 'high' : 'low'
    };
  }

  /**
   * Get peak hours for a facility
   */
  getPeakHours(facilityId) {
    const history = this.facilityHistory.get(facilityId) || [];

    if (history.length === 0) {
      return [];
    }

    const byHour = {};
    history.forEach(record => {
      const hour = new Date(record.timestamp).getHours();
      if (!byHour[hour]) {
        byHour[hour] = [];
      }
      byHour[hour].push(record.currentOccupancy);
    });

    const peaks = Object.entries(byHour)
      .map(([hour, occupancies]) => ({
        hour: parseInt(hour),
        avgOccupancy: Math.round(
          occupancies.reduce((a, b) => a + b, 0) / occupancies.length
        )
      }))
      .sort((a, b) => b.avgOccupancy - a.avgOccupancy)
      .slice(0, 3);

    return peaks;
  }

  /**
   * Calculate facility score (0-100)
   * Considers wait time, occupancy, and status
   */
  calculateFacilityScore(facility) {
    let score = 100;

    // Wait time penalty (max -50 points)
    if (facility.currentWaitTime > 60) {
      score -= 50;
    } else if (facility.currentWaitTime > 30) {
      score -= Math.round((facility.currentWaitTime - 30) / 30 * 30);
    }

    // Occupancy penalty (max -30 points)
    const occupancyRatio = facility.currentOccupancy / facility.maxCapacity;
    if (occupancyRatio > 0.8) {
      score -= 30;
    } else if (occupancyRatio > 0.5) {
      score -= Math.round((occupancyRatio - 0.5) / 0.3 * 20);
    }

    // Status penalty (max -20 points)
    if (facility.status === 'closed') {
      score = 0;
    } else if (facility.status === 'maintenance') {
      score -= 20;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get facility recommendations sorted by score
   */
  getRankedFacilities(facilities, type = null) {
    let filtered = facilities;

    if (type) {
      filtered = facilities.filter(f => f.type === type);
    }

    return filtered
      .map(facility => ({
        ...facility,
        score: this.calculateFacilityScore(facility),
        predictedWait: this.predictWaitTime(facility),
        trend: this.getOccupancyTrend(facility.id)
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Generate facility report
   */
  generateReport(facility) {
    return {
      facilityId: facility.id,
      name: facility.name,
      type: facility.type,
      currentMetrics: {
        waitTime: facility.currentWaitTime,
        occupancy: facility.currentOccupancy,
        occupancyPercent: Math.round(
          (facility.currentOccupancy / facility.maxCapacity) * 100
        ),
        status: facility.status
      },
      predictions: {
        predictedWaitTime: this.predictWaitTime(facility),
        occupancyTrend: this.getOccupancyTrend(facility.id),
        optimalVisitTime: this.getOptimalVisitTime(facility.id),
        peakHours: this.getPeakHours(facility.id)
      },
      score: this.calculateFacilityScore(facility),
      recommendation: this.calculateFacilityScore(facility) > 70 ? '✅ Recommended' : '⚠️ High wait expected'
    };
  }
}

module.exports = new QueueAnalytics();
