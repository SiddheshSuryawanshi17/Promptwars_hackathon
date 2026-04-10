import React from 'react';
import './EventsList.css';

const EventsList = ({ events }) => {
  const getEventIcon = (title) => {
    if (title.toLowerCase().includes('movie')) return '🎬';
    if (title.toLowerCase().includes('concert')) return '🎵';
    if (title.toLowerCase().includes('sport')) return '⚽';
    return '🎪';
  };

  const getTimeRemaining = (startTime) => {
    try {
      const [hours, minutes] = startTime.split(':');
      const eventDate = new Date();
      eventDate.setHours(parseInt(hours), parseInt(minutes), 0);

      const now = new Date();
      const diff = eventDate - now;

      if (diff <= 0) return 'Ongoing';

      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minsLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hoursLeft > 0) {
        return `${hoursLeft}h ${minsLeft}m`;
      }
      return `${minsLeft}m`;
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="events-list">
      <div className="events-header">
        <h2>📺 Upcoming Events</h2>
        <p className="events-subtitle">Check timings and plan your visit</p>
      </div>

      <div className="events-container">
        {events.map(event => (
          <div key={event.id} className={`event-card ${event.status}`}>
            <div className="event-content">
              <div className="event-title-section">
                <span className="event-icon">
                  {getEventIcon(event.title)}
                </span>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <p className="event-location">📍 {event.location}</p>
                </div>
              </div>

              <div className="event-meta">
                <div className="meta-item">
                  <span className="meta-label">Start Time</span>
                  <span className="meta-value">{event.startTime}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Duration</span>
                  <span className="meta-value">{event.duration} min</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Attendees</span>
                  <span className="meta-value">{event.attendees.toLocaleString()}</span>
                </div>
              </div>

              <div className="event-countdown">
                <span className="countdown-label">Starts in:</span>
                <span className="countdown-value">
                  {getTimeRemaining(event.startTime)}
                </span>
              </div>

              <button className="event-btn">
                🔔 Add Reminder
              </button>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="empty-state">
          <p>No upcoming events</p>
        </div>
      )}
    </div>
  );
};

export default EventsList;
