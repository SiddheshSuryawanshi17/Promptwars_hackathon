import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

export const ClockAndSchedule = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scheduleEvents = [
    { time: '10:00 AM', event: 'Gates Open', status: 'completed' },
    { time: '12:00 PM', event: 'Pre-Game Show', status: 'completed' },
    { time: '1:00 PM', event: 'Match Starts', status: 'in_progress' },
    { time: '3:30 PM', event: 'Halftime Show', status: 'upcoming' },
    { time: '4:00 PM', event: 'Second Half', status: 'upcoming' },
    { time: '6:00 PM', event: 'Post-Game', status: 'upcoming' }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-yellow-400 font-bold animate-pulse';
      case 'upcoming': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-900 bg-opacity-30';
      case 'in_progress': return 'bg-yellow-900 bg-opacity-30 border border-yellow-500';
      case 'upcoming': return 'bg-slate-700 bg-opacity-30';
      default: return 'bg-slate-800';
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Clock Widget */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">Current Time</h3>
        </div>

        <div className="text-center">
          <div className="text-5xl font-bold text-blue-400 font-mono mb-2">
            {formatTime(time)}
          </div>
          <div className="text-gray-400 text-sm">
            {formatDate(time)}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Today's Schedule</h3>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {scheduleEvents.map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded flex justify-between items-center transition ${getStatusBg(item.status)}`}
            >
              <span className="text-gray-300 font-mono text-sm">{item.time}</span>
              <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                {item.event}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
