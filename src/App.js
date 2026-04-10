import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './Login';
import { Signup } from './Signup';
import { ClockAndSchedule } from './ClockAndSchedule';
import { Leaderboard } from './Leaderboard';
import { ConcessionReservations } from './ConcessionReservations';
import { GoogleMapsIntegration } from './GoogleMapsIntegration';
import { AdminPanel } from './AdminPanel';
import { NotificationPreferences } from './NotificationPreferences';
import { PaymentProcessing } from './PaymentProcessing';
import {
  MapPin, Clock, Users, AlertCircle, MessageCircle, Award,
  Accessibility, Home, Zap, Navigation, Activity, Bell, Lightbulb, X, TrendingDown
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

// ==================== LANDING PAGE ====================
const LandingPage = ({ onEnter, userName, onLogout }) => {
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4 relative"
      style={{
        backgroundImage: 'url(/images/Gemini_generated_image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4">
        {userName && (
          <div className="absolute top-4 right-4 z-20 bg-slate-800 rounded-lg p-4 flex items-center gap-3 border border-slate-600">
            <span className="text-gray-300">Welcome, <span className="text-yellow-400 font-bold">{userName}</span></span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
            >
              Logout
            </button>
          </div>
        )}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Zap className="w-16 h-16 text-yellow-400" />
          <h1 className="text-5xl md:text-6xl font-bold text-white">VenueFlow</h1>
        </div>
        <p className="text-xl text-gray-300 mb-4">
          Real-Time Event Coordination for Large Scale Venues
        </p>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Navigate crowds smarter. Find restrooms & food faster. Experience events like never before.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-12 max-w-4xl">
        <div className="bg-slate-700 bg-opacity-50 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 transition">
          <MapPin className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Live Venue Map</h3>
          <p className="text-gray-300 text-sm">Interactive crowd density heatmap</p>
        </div>

        <div className="bg-slate-700 bg-opacity-50 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 transition">
          <Clock className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Smart Queues</h3>
          <p className="text-gray-300 text-sm">Real-time wait times & predictions</p>
        </div>

        <div className="bg-slate-700 bg-opacity-50 p-6 rounded-lg border border-slate-600 hover:border-yellow-400 transition">
          <Award className="w-8 h-8 text-yellow-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Earn Points</h3>
          <p className="text-gray-300 text-sm">Gamified crowd engagement</p>
        </div>
      </div>

      <button
        onClick={onEnter}
        className="px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-lg transition transform hover:scale-105"
      >
        Enter Dashboard →
      </button>

      <div className="mt-16 text-gray-400 text-sm">
        <p>✓ 75,000+ capacity stadium</p>
        <p>✓ 5 concession stands • 4 restroom blocks</p>
        <p>✓ Real-time updates every 10 seconds</p>
      </div>
      </div>
    </div>
  );
};

// ==================== VENUE MAP WITH HEATMAP ====================
const VenueMap = ({ crowdDensity, queues, userSector }) => {
  const [hoveredSector, setHoveredSector] = useState(null);

  const getDensityLevel = (density) => {
    if (density > 75) return { level: 'Critical', color: '#ef4444', rgb: '239, 68, 68' };
    if (density > 50) return { level: 'High', color: '#f97316', rgb: '249, 115, 22' };
    if (density > 25) return { level: 'Medium', color: '#eab308', rgb: '234, 179, 8' };
    return { level: 'Low', color: '#22c55e', rgb: '34, 197, 94' };
  };

  const getSectorConfig = (sector) => {
    const configs = {
      North: { x: 25, y: 5, width: 50, height: 20, label: '🎯 NORTH' },
      South: { x: 25, y: 75, width: 50, height: 20, label: '🎯 SOUTH' },
      East: { x: 75, y: 25, width: 20, height: 50, label: '➡️ EAST' },
      West: { x: 5, y: 25, width: 20, height: 50, label: '⬅️ WEST' },
      Center: { x: 35, y: 35, width: 30, height: 30, label: '⭐ CENTER' }
    };
    return configs[sector];
  };

  const density = crowdDensity[hoveredSector] || -1;
  const densityInfo = density >= 0 ? getDensityLevel(density) : null;

  // Check if we have data
  const hasData = Object.keys(crowdDensity).length > 0;

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 mb-6 border border-slate-600 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-yellow-400" />
          Live Venue Map & Crowd Heatmap
        </h2>
        {hoveredSector && densityInfo && (
          <div className="text-right text-sm">
            <p className="text-gray-300">Current Sector:</p>
            <p className="text-lg font-bold text-white">{hoveredSector}</p>
            <p style={{ color: densityInfo.color }} className="font-semibold">{densityInfo.level} - {density}%</p>
          </div>
        )}
      </div>

      <div className="relative w-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg overflow-hidden shadow-inner" style={{ aspectRatio: '16/10' }}>
        {!hasData ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin mb-4 inline-block">
                <Activity className="w-12 h-12 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-lg">Loading venue data...</p>
              <p className="text-gray-500 text-sm mt-2">Connecting to live heatmap</p>
            </div>
          </div>
        ) : (
          <>
            <style>{`
              @keyframes pulse-glow {
                0%, 100% { filter: drop-shadow(0 0 3px rgba(239, 68, 68, 0.6)); }
                50% { filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.8)); }
              }
              @keyframes pulse-orange {
                0%, 100% { filter: drop-shadow(0 0 3px rgba(249, 115, 22, 0.4)); }
                50% { filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.7)); }
              }
              .sector-critical { animation: pulse-glow 2s ease-in-out infinite; }
              .sector-high { animation: pulse-orange 2.5s ease-in-out infinite; }
              .sector-rect { transition: all 0.3s ease; }
              .sector-rect:hover { filter: brightness(1.2); stroke-width: 3; }
            `}</style>

            <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            {/* Gradients for each density level */}
            <radialGradient id="grad-critical" cx="40%" cy="40%">
              <stop offset="0%" style={{ stopColor: '#fca5a5', stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: '#dc2626', stopOpacity: 0.6 }} />
            </radialGradient>
            <radialGradient id="grad-high" cx="40%" cy="40%">
              <stop offset="0%" style={{ stopColor: '#fed7aa', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#ea580c', stopOpacity: 0.5 }} />
            </radialGradient>
            <radialGradient id="grad-medium" cx="40%" cy="40%">
              <stop offset="0%" style={{ stopColor: '#fef08a', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#ca8a04', stopOpacity: 0.5 }} />
            </radialGradient>
            <radialGradient id="grad-low" cx="40%" cy="40%">
              <stop offset="0%" style={{ stopColor: '#bbf7d0', stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 0.5 }} />
            </radialGradient>
          </defs>

          {/* Stadium outer border with glow */}
          <rect x="5" y="5" width="90" height="90" fill="none" stroke="#1e293b" strokeWidth="1" opacity="0.5" />
          <rect x="4.5" y="4.5" width="91" height="91" fill="none" stroke="#475569" strokeWidth="1.5" opacity="0.8" />

          {/* Sectors with enhanced heatmap */}
          {Object.entries(crowdDensity).map(([sector, dens]) => {
            const config = getSectorConfig(sector);
            const densInfo = getDensityLevel(dens);
            let gradientId = 'grad-low';
            let className = 'sector-rect';

            if (dens > 75) { gradientId = 'grad-critical'; className = 'sector-rect sector-critical'; }
            else if (dens > 50) { gradientId = 'grad-high'; className = 'sector-rect sector-high'; }
            else if (dens > 25) gradientId = 'grad-medium';

            return (
              <g key={sector} className="cursor-pointer" onMouseEnter={() => setHoveredSector(sector)} onMouseLeave={() => setHoveredSector(null)}>
                {/* Sector background with gradient */}
                <rect
                  x={config.x} y={config.y} width={config.width} height={config.height}
                  fill={`url(#${gradientId})`}
                  stroke={densInfo.color} strokeWidth="1.5"
                  className={className}
                  opacity={hoveredSector === sector ? 0.9 : 0.8}
                />

                {/* Inner highlight for depth */}
                <rect
                  x={config.x + 0.5} y={config.y + 0.5} width={config.width - 1} height={config.height - 1}
                  fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"
                />

                {/* Sector label and density */}
                <text
                  x={config.x + config.width / 2} y={config.y + config.height / 2 - 2}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="5" fontWeight="bold"
                  opacity="0.9"
                >
                  {config.label}
                </text>
                <text
                  x={config.x + config.width / 2} y={config.y + config.height / 2 + 4}
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="7" fontWeight="bold"
                  opacity="0.95"
                >
                  {dens}%
                </text>
              </g>
            );
          })}

          {/* Facilities with glow effect */}
          {queues && Object.values(queues).slice(0, 5).map((q) => (
            <g key={q.id}>
              <circle cx={q.location.x} cy={q.location.y} r="2.5" fill="rgba(59, 130, 246, 0.3)" />
              <circle
                cx={q.location.x} cy={q.location.y} r="1.5"
                fill="#60a5fa"
                stroke="#93c5fd" strokeWidth="0.5"
              />
            </g>
          ))}
        </svg>

        {/* Enhanced Legend */}
        <div className="absolute bottom-4 left-4 bg-gradient-to-br from-slate-900 to-slate-950 bg-opacity-95 p-4 rounded-lg text-xs text-gray-300 border border-slate-700 shadow-lg backdrop-blur">
          <p className="mb-3 font-bold text-white text-sm">📊 Crowd Density Legend:</p>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-green-500 rounded border border-green-400"></div>
              <span className="text-gray-200">Low (0-25%)</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded border border-yellow-400"></div>
              <span className="text-gray-200">Medium (25-50%)</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-orange-500 rounded border border-orange-400"></div>
              <span className="text-gray-200">High (50-75%)</span>
            </div>
            <div className="flex gap-2 items-center">
              <div className="w-4 h-4 bg-red-500 rounded border border-red-400 shadow-lg"></div>
              <span className="text-gray-200">Critical (&gt;75%)</span>
            </div>
          </div>
          <p className="text-gray-400 mt-3 text-xs">💡 Hover over sectors for details</p>
        </div>

            {/* Top right info box */}
            <div className="absolute top-4 right-4 bg-gradient-to-br from-slate-900 to-slate-950 bg-opacity-90 px-4 py-3 rounded-lg border border-slate-700 shadow-lg backdrop-blur">
              <p className="text-xs text-gray-400 mb-1">⏱️ Updates Every 10s</p>
              <p className="text-xs text-yellow-400 font-semibold">● Live</p>
            </div>
          </>
        )}
      </div>

      {/* Info text */}
      <p className="text-gray-400 text-xs mt-4">ℹ️ Real-time crowd density heatmap. Green = Safe | Yellow = Crowded | Orange = Very Crowded | Red = Overcrowded</p>
    </div>
  );
};

// ==================== SMART QUEUE DASHBOARD ====================
const QueueDashboard = ({ queues, onReportQueue, userPoints }) => {
  const [expandedQueue, setExpandedQueue] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const getWaitColor = (wait) => {
    if (wait > 20) return 'bg-red-500';
    if (wait > 10) return 'bg-orange-500';
    if (wait > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAccessibilityLabel = (value) => value ? '♿ Accessible' : 'Not Accessible';

  const handleSuggestAlternative = async (facilityId) => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`http://localhost:5000/api/suggest-alternative/${facilityId}`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({
        error: 'Failed to load suggestions',
        message: 'Could not fetch alternative facilities'
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="bg-slate-700 rounded-lg p-6 mb-6 border border-slate-600">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Clock className="w-6 h-6 text-yellow-400" />
        Smart Queue Management
      </h2>

      {/* Suggestions Modal */}
      {suggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full border border-slate-600 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold text-white">Alternative Suggestions</h3>
              </div>
              <button
                onClick={() => setSuggestions(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {suggestions.error ? (
              <div className="bg-red-900 bg-opacity-30 border border-red-500 rounded p-4">
                <p className="text-red-300 text-sm">{suggestions.message}</p>
              </div>
            ) : (
              <>
                {/* Current Facility */}
                <div className="bg-slate-700 rounded p-4 mb-4">
                  <p className="text-gray-400 text-xs mb-1">Current Facility</p>
                  <p className="text-white font-bold">{suggestions.current.name}</p>
                  <p className="text-orange-400 font-semibold text-lg mt-1">{suggestions.current.waitTime} min wait</p>
                </div>

                {/* Message */}
                <p className="text-gray-300 text-sm mb-4">{suggestions.message}</p>

                {/* Alternatives */}
                {suggestions.alternatives.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {suggestions.alternatives.map((alt) => (
                      <div
                        key={alt.id}
                        className="bg-green-900 bg-opacity-30 border border-green-500 rounded p-3 hover:bg-opacity-50 transition"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-white font-semibold">{alt.name}</p>
                            <p className="text-green-400 text-sm">
                              <TrendingDown className="w-4 h-4 inline mr-1" />
                              {alt.waitTime} min (saves {alt.savings} min)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-900 bg-opacity-30 border border-yellow-500 rounded p-3 mb-4">
                    <p className="text-yellow-300 text-sm">No shorter alternatives available at this time</p>
                  </div>
                )}

                <button
                  onClick={() => setSuggestions(null)}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {queues && Object.values(queues).map((q) => (
          <div
            key={q.id}
            className={`p-4 rounded-lg border border-slate-500 cursor-pointer hover:border-yellow-400 transition ${
              expandedQueue === q.id ? 'bg-slate-600' : 'bg-slate-800'
            }`}
            onClick={() => setExpandedQueue(expandedQueue === q.id ? null : q.id)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-white">{q.name}</h3>
                <p className="text-gray-400 text-sm">{q.location.sector} Sector</p>
              </div>
              <span className={`px-3 py-1 rounded text-white text-sm font-bold ${getWaitColor(q.currentWait)}`}>
                {q.currentWait}m
              </span>
            </div>

            {expandedQueue === q.id && (
              <div className="mt-4 pt-4 border-t border-slate-500 text-gray-300 text-sm space-y-2">
                <p>Queue Length: <span className="text-white font-bold">{q.queueLength || q.occupancy}/{q.totalStalls || '∞'} people</span></p>
                <p>Status: <span className={`font-bold ${q.status === 'open' ? 'text-green-400' : 'text-red-400'}`}>
                  {q.status === 'open' ? '✓ Open' : '✗ Maintenance'}
                </span></p>
                <p className={q.accessible ? 'text-green-400' : 'text-gray-500'}>
                  {getAccessibilityLabel(q.accessible)}
                </p>
                {q.currentWait > 15 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuggestAlternative(q.id);
                    }}
                    disabled={loadingSuggestions}
                    className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 rounded transition disabled:opacity-50"
                  >
                    {loadingSuggestions ? 'Loading...' : '💡 Suggest Alternative'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== REAL-TIME NOTIFICATIONS ====================
const NotificationFeed = ({ notifications }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'event': return <Zap className="w-5 h-5" />;
      case 'lost_found': return <Home className="w-5 h-5" />;
      case 'medical': return <Activity className="w-5 h-5" />;
      return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type, urgent) => {
    if (urgent) return 'border-l-4 border-l-red-500 bg-red-900 bg-opacity-20';
    switch (type) {
      case 'alert': return 'border-l-4 border-l-yellow-400 bg-yellow-900 bg-opacity-20';
      case 'event': return 'border-l-4 border-l-blue-400 bg-blue-900 bg-opacity-20';
      case 'lost_found': return 'border-l-4 border-l-green-400 bg-green-900 bg-opacity-20';
      default: return 'border-l-4 border-l-gray-400 bg-gray-800 bg-opacity-50';
    }
  };

  return (
    <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Bell className="w-6 h-6 text-yellow-400" />
        Fan Sync Live Updates
      </h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications && notifications.slice(0, 10).map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-lg flex gap-3 items-start ${getNotificationColor(notif.type, notif.urgent)}`}
          >
            <div className="text-yellow-400 mt-1">{getNotificationIcon(notif.type)}</div>
            <div className="flex-1">
              <p className="text-white">{notif.message}</p>
              <p className="text-gray-400 text-xs mt-1">
                {new Date(notif.timestamp).toLocaleTimeString()}
              </p>
            </div>
            {notif.urgent && <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">URGENT</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== AI CHATBOT CONCIERGE ====================
const ChatbotConcierge = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Hi! 👋 I\'m your Digital Concierge. I can help with directions, wait times, food, restrooms, medical, and more!',
      category: 'greeting'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedReplies, setSuggestedReplies] = useState([]);
  const messagesEndRef = React.useRef(null);

  const suggestedTopics = [
    { text: '🍕 Shortest food queues', keyword: 'food' },
    { text: '🚻 Find nearest restroom', keyword: 'restroom' },
    { text: '⚕️ Medical tent location', keyword: 'medical' },
    { text: '📍 Get directions', keyword: 'directions' },
    { text: '🆘 Lost & Found', keyword: 'lost' },
    { text: '🎟️ Venue info', keyword: 'info' }
  ];

  const responseLibrary = {
    food: {
      keywords: ['food', 'eat', 'pizza', 'burger', 'soda', 'concession', 'hungry'],
      responses: [
        '🍕 Pizza Stand in North Sector has 8 min wait | 🍔 Burger Hut South has 12 min | 🥤 Soda Bar East has 5 min (shortest!)',
        '🍽️ Pre-order food through our Concession Reservations to skip the line!',
        '💰 Food prices: Pizza $8-9 | Burger $10-12 | Soda $4-5. All accept card payments.'
      ],
      category: 'food'
    },
    restroom: {
      keywords: ['restroom', 'bathroom', 'toilet', 'washroom', 'wc', 'lavatory'],
      responses: [
        '🚻 Restroom Block A (North Wing) - 5 min wait | Block B (South Wing) - 8 min wait | Block C (East) - 3 min wait ✓',
        '🧻 All restrooms are ADA accessible with baby changing facilities.',
        '💡 Tip: East Wing has the shortest wait right now!'
      ],
      category: 'restroom'
    },
    medical: {
      keywords: ['medical', 'doctor', 'nurse', 'emergency', 'sick', 'first aid', 'injured', 'help'],
      responses: [
        '⚕️ Medical Tent is in the Center Sector, near Gate 3. Staffed 24/7.',
        '🚑 For emergencies, go to the Main Medical Station or call security at Sector Beacons.',
        '💊 First Aid stations available in every sector. Look for the red cross signs.'
      ],
      category: 'medical'
    },
    directions: {
      keywords: ['direction', 'where', 'how to get', 'navigate', 'gate', 'entrance', 'exit', 'section'],
      responses: [
        '🗺️ Use our Interactive Map to navigate! Get real-time directions to any facility.',
        '📍 North Sector via Gate 1 | South Sector via Gate 2 | East via Gate 3 | West via Gate 4',
        '🧭 Your current location is shown on the map. Click any facility for turn-by-turn directions!'
      ],
      category: 'directions'
    },
    lost: {
      keywords: ['lost', 'found', 'missing', 'lost&found', 'lose', 'where\'s my'],
      responses: [
        '🆘 Lost & Found is at the Center Sector Information Desk.',
        '📝 Describe your item and I can help search our database. Common items: phones, wallets, keys.',
        '⏰ Lost & Found is open until 1 hour after the event ends.'
      ],
      category: 'lost'
    },
    info: {
      keywords: ['event', 'schedule', 'time', 'when', 'what time', 'info', 'venue', 'capacity'],
      responses: [
        '📅 Today\'s Schedule: 10:00 AM Gates Open | 1:00 PM Match Starts | 3:30 PM Halftime Show | 6:00 PM Post-Game',
        '🏟️ Venue Capacity: 75,000 | Current crowd: ~43,000 | Utilization: 57%',
        '⏱️ Check the Clock & Schedule widget at the top for real-time updates!'
      ],
      category: 'info'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const detectCategory = (text) => {
    const lower = text.toLowerCase();
    for (const [category, data] of Object.entries(responseLibrary)) {
      if (data.keywords.some(kw => lower.includes(kw))) {
        return category;
      }
    }
    return 'general';
  };

  const getBotResponse = (userInput) => {
    const category = detectCategory(userInput);
    if (responseLibrary[category]) {
      const responses = responseLibrary[category].responses;
      return {
        text: responses[Math.floor(Math.random() * responses.length)],
        category: responseLibrary[category].category
      };
    }
    return {
      text: '❓ I\'m not sure about that. Try asking about: food queues, restrooms, medical help, directions, lost items, or event info.',
      category: 'general'
    };
  };

  const getFollowUpSuggestions = (category) => {
    const suggestions = {
      food: ['🗺️ Get directions', '⏱️ Check wait times', '💳 Payment options'],
      restroom: ['📍 Find nearest one', '🚗 Get directions', '♿ Accessibility info'],
      medical: ['📍 Get directions', '☎️ Emergency info', '💊 First aid locations'],
      directions: ['🗺️ See map', '⏱️ Travel time', '♿ Accessible route'],
      lost: ['📝 Search database', '📞 Call info desk', '⏱️ Operating hours'],
      greeting: ['🍕 Hungry?', '🚻 Need restroom?', '📍 How to navigate?'],
      general: ['🔍 Search help', '📋 All topics', '💬 More info']
    };
    return suggestions[category] || suggestions['general'];
  };

  const handleSend = (text = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: text.trim(), category: 'user' }]);
    setInput('');
    setSuggestedReplies([]);

    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages(prev => [...prev, response]);
      setSuggestedReplies(getFollowUpSuggestions(response.category));
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleQuickReply = (topic) => {
    handleSend(topic.text);
  };

  return (
    <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-yellow-400" />
        Digital Concierge (AI Chat)
      </h2>
      <p className="text-gray-400 text-sm mb-4">Ask anything about the venue • Always here to help</p>

      {/* Messages Area */}
      <div className="bg-slate-800 rounded-lg p-4 h-80 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-yellow-400 text-black font-medium'
                  : 'bg-slate-600 text-white border border-slate-500'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-600 text-white px-4 py-3 rounded-lg border border-slate-500">
              <div className="flex gap-2 items-center">
                <span className="text-sm">Thinking</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Replies */}
      {suggestedReplies.length > 0 && !isTyping && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">Quick replies:</p>
          <div className="grid grid-cols-3 gap-2">
            {suggestedReplies.map((reply, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(reply);
                  setTimeout(() => handleSend(reply), 50);
                }}
                className="bg-slate-600 hover:bg-slate-500 text-white text-xs py-2 px-3 rounded transition border border-slate-500 hover:border-yellow-400"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Topics (if empty chat) */}
      {messages.length === 1 && !isTyping && (
        <div className="mb-4">
          <p className="text-gray-400 text-xs mb-2">Popular questions:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestedTopics.map((topic, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickReply(topic)}
                className="bg-slate-600 hover:bg-slate-500 text-white text-sm py-2 px-3 rounded transition border border-slate-500 hover:border-yellow-400 text-left"
              >
                {topic.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about food, restrooms, medical, directions..."
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
          disabled={isTyping}
        />
        <button
          onClick={() => handleSend()}
          disabled={isTyping || !input.trim()}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
};

// ==================== GAMIFICATION SYSTEM ====================
const GamificationPanel = ({ userPoints, onReportQueue }) => {
  const [selectedFacility, setSelectedFacility] = useState('conc_1');
  const [reportedLength, setReportedLength] = useState(5);

  const handleReport = () => {
    onReportQueue(selectedFacility, reportedLength);
    setReportedLength(5);
    alert(`✓ Reported! You earned 10 Fan Points. Total: ${(userPoints || 0) + 10}`);
  };

  return (
    <div className="bg-slate-700 rounded-lg p-6 border border-slate-600 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Award className="w-6 h-6 text-yellow-400" />
        Crowd-Source & Earn Fan Points
      </h2>

      <div className="bg-slate-800 rounded-lg p-4 mb-4">
        <p className="text-gray-300 mb-4">Help others by reporting queue lengths and earn points!</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">Select Facility:</label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-yellow-400"
            >
              <option value="conc_1">Pizza Stand</option>
              <option value="conc_2">Burger Hut</option>
              <option value="rest_1">Restroom Block A</option>
              <option value="rest_2">Restroom Block B</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-bold mb-2">
              Current Queue Length: <span className="text-yellow-400">{reportedLength} people</span>
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={reportedLength}
              onChange={(e) => setReportedLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={handleReport}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition"
          >
            Submit Report → +10 Points
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-4 border border-slate-600 flex items-center justify-between">
        <span className="text-gray-300">Your Fan Points Balance:</span>
        <span className="text-3xl font-bold text-yellow-400">{userPoints || 0}</span>
      </div>
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const Dashboard = ({ onLogout, userName }) => {
  const [socket, setSocket] = useState(null);
  const [queues, setQueues] = useState(null);
  const [crowdDensity, setCrowdDensity] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [userSector, setUserSector] = useState('North');
  const [userPoints, setUserPoints] = useState(0);
  const userId = `user_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    // Initialize socket connection with debugging
    console.log('Connecting to socket at:', SOCKET_URL);
    const newSocket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✓ Socket connected:', newSocket.id);
    });

    newSocket.on('connect_error', (error) => {
      console.error('✗ Socket connection error:', error);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('initial-data', (data) => {
      console.log('✓ Received initial data:', data);
      setQueues(data.queues);
      setCrowdDensity(data.crowdDensity);
      setNotifications(data.notifications);
    });

    newSocket.on('queue-update', (data) => {
      setQueues(data);
    });

    newSocket.on('crowd-density-update', (data) => {
      console.log('✓ Crowd density updated:', data);
      setCrowdDensity(data);
    });

    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 20));
    });

    newSocket.on('error', (error) => {
      console.error('✗ Socket error:', error);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const handleReportQueue = (facilityId, length) => {
    if (socket) {
      socket.emit('report-queue-update', { facilityId, length });
      setUserPoints(prev => prev + 10);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap className="w-10 h-10 text-yellow-400" />
            <h1 className="text-4xl font-bold">VenueFlow Dashboard</h1>
          </div>
          <div className="text-right flex items-center gap-4">
            <div>
              <p className="text-gray-400 text-sm">Logged in as: <span className="text-yellow-400 font-bold">{userName}</span></p>
              <p className="text-gray-400 text-sm">Fan Points: <span className="text-yellow-400 font-bold">{userPoints}</span></p>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
        <p className="text-gray-400">Real-time updates • Live crowd tracking • Smart recommendations</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Accessibility Banner */}
        <div className="bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg p-4 mb-6 flex items-start gap-3">
          <Accessibility className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-blue-200">Accessibility Features Available</p>
            <p className="text-blue-100">♿ Wheelchair-accessible routes • High-contrast mode • Screen reader support</p>
          </div>
        </div>

        <VenueMap crowdDensity={crowdDensity} queues={queues} userSector={userSector} />
        <ClockAndSchedule />
        <QueueDashboard queues={queues} onReportQueue={handleReportQueue} userPoints={userPoints} />
        <NotificationFeed notifications={notifications} />

        <div className="grid md:grid-cols-3 gap-6">
          <ChatbotConcierge />
          <GamificationPanel userPoints={userPoints} onReportQueue={handleReportQueue} />
          <Leaderboard userPoints={userPoints} userName={userName} />
        </div>

        <ConcessionReservations />

        <GoogleMapsIntegration />

        <AdminPanel isAdmin={false} userName={userName} />

        <NotificationPreferences />

        <PaymentProcessing reservationItem={{ price: '12.99' }} />

        {/* Footer */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>VenueFlow © 2026 • Real-time updates every 10 seconds</p>
          <p>🌟 Live data simulation active • ♿ ADA compliant interface</p>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN APP ====================
const AppContent = () => {
  const { user, logout } = useAuth();
  const [showDashboard, setShowDashboard] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

  // If user is authenticated and we're in dashboard, show dashboard
  if (user && showDashboard) {
    return (
      <Dashboard onLogout={() => { logout(); setShowDashboard(false); }} userName={user.name} />
    );
  }

  // If user is authenticated but not in dashboard, show landing page with logout
  if (user && !showDashboard) {
    return (
      <LandingPage
        onEnter={() => setShowDashboard(true)}
        userName={user.name}
        onLogout={() => { logout(); setShowDashboard(false); }}
      />
    );
  }

  // If not authenticated, show login/signup
  if (authMode === 'login') {
    return <Login onSwitchToSignup={() => setAuthMode('signup')} />;
  } else {
    return <Signup onSwitchToLogin={() => setAuthMode('login')} />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
