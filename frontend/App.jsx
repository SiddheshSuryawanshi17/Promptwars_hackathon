import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';
import VenueDashboard from './components/VenueDashboard';
import EventsList from './components/EventsList';

const socket = io('http://localhost:4000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

function App() {
  const [facilities, setFacilities] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedTab, setSelectedTab] = useState('facilities');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Connect to server
    socket.on('connect', () => {
      setConnectionStatus('connected');
      console.log('Connected to server');
    });

    // Receive initial data
    socket.on('initialData', (data) => {
      setFacilities(Object.values(data.facilities));
      setEvents(Object.values(data.events));
    });

    // Receive real-time facility updates
    socket.on('facilityUpdate', (data) => {
      setFacilities(prev =>
        prev.map(f => f.id === data.facilityId ? data.facility : f)
      );
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionStatus('error');
    });

    return () => {
      socket.off('connect');
      socket.off('initialData');
      socket.off('facilityUpdate');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 Venue Event Coordinator</h1>
        <div className="status-badge">
          <span className={`connection-status ${connectionStatus}`}>
            {connectionStatus === 'connected' ? '🟢' : '🔴'} {connectionStatus}
          </span>
        </div>
      </header>

      <nav className="tab-navigation">
        <button
          className={`tab-btn ${selectedTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setSelectedTab('facilities')}
        >
          🏪 Facilities
        </button>
        <button
          className={`tab-btn ${selectedTab === 'events' ? 'active' : ''}`}
          onClick={() => setSelectedTab('events')}
        >
          🎭 Events
        </button>
      </nav>

      <main className="app-main">
        {selectedTab === 'facilities' && <VenueDashboard facilities={facilities} />}
        {selectedTab === 'events' && <EventsList events={events} />}
      </main>
    </div>
  );
}

export default App;
