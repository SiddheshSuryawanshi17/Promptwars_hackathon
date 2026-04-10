import React, { useState } from 'react';
import './VenueDashboard.css';

const VenueDashboard = ({ facilities }) => {
  const [expandedFacility, setExpandedFacility] = useState(null);

  const getWaitTimeColor = (waitTime) => {
    if (waitTime <= 5) return '#22c55e'; // Green
    if (waitTime <= 15) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const getOccupancyPercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const getFacilityIcon = (type) => {
    switch (type) {
      case 'food':
        return '🍽️';
      case 'washroom':
        return '🚻';
      case 'restroom':
        return '🪑';
      case 'parking':
        return '🅿️';
      default:
        return '📍';
    }
  };

  return (
    <div className="venue-dashboard">
      <div className="dashboard-header">
        <h2>Real-Time Facility Status</h2>
        <p className="last-updated">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>

      <div className="facilities-grid">
        {facilities.map(facility => {
          const occupancyPercent = getOccupancyPercentage(
            facility.currentOccupancy,
            facility.maxCapacity
          );
          const isExpanded = expandedFacility === facility.id;

          return (
            <div
              key={facility.id}
              className={`facility-card ${facility.status}`}
              onClick={() =>
                setExpandedFacility(isExpanded ? null : facility.id)
              }
            >
              {/* Facility Header */}
              <div className="facility-header">
                <span className="facility-icon">
                  {getFacilityIcon(facility.type)}
                </span>
                <h3>{facility.name}</h3>
                <span className="status-badge" title={facility.status}>
                  {facility.status === 'open' ? '🟢' : '🔴'}
                </span>
              </div>

              {/* Wait Time Display */}
              <div className="wait-time-container">
                <div className="wait-time" style={{ color: getWaitTimeColor(facility.currentWaitTime) }}>
                  <span className="wait-label">Wait Time</span>
                  <span className="wait-value">{facility.currentWaitTime} min</span>
                </div>
              </div>

              {/* Occupancy Bar */}
              <div className="occupancy-section">
                <div className="occupancy-header">
                  <span>Occupancy</span>
                  <span className="occupancy-percent">{occupancyPercent}%</span>
                </div>
                <div className="occupancy-bar">
                  <div
                    className="occupancy-fill"
                    style={{
                      width: `${occupancyPercent}%`,
                      backgroundColor:
                        occupancyPercent > 80
                          ? '#ef4444'
                          : occupancyPercent > 50
                          ? '#eab308'
                          : '#22c55e'
                    }}
                  />
                </div>
                <p className="occupancy-text">
                  {facility.currentOccupancy} / {facility.maxCapacity} people
                </p>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="facility-details">
                  <div className="detail-item">
                    <span className="detail-label">Hours</span>
                    <span className="detail-value">
                      {facility.openingTime} - {facility.closingTime}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className="detail-value">
                      {facility.status === 'open'
                        ? '✅ Open'
                        : '❌ Closed'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated</span>
                    <span className="detail-value">
                      {new Date(facility.lastUpdated).toLocaleTimeString()}
                    </span>
                  </div>
                  <button className="check-in-btn">
                    📍 Navigate Here
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {facilities.length === 0 && (
        <div className="empty-state">
          <p>Loading facility information...</p>
        </div>
      )}
    </div>
  );
};

export default VenueDashboard;
