import React, { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';

export const NotificationPreferences = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    queueAlerts: true,
    eventReminders: true,
    reservationConfirmation: true,
    leaderboardUpdates: false,
    crowdDensity: true,
    facilityClosed: true
  });

  useEffect(() => {
    // Check if browser supports notifications
    if ('Notification' in window && navigator.serviceWorker) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        setNotificationsEnabled(true);

        // Register service worker
        if (navigator.serviceWorker) {
          navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('✓ Service Worker registered'))
            .catch(err => console.error('✗ Service Worker registration failed:', err));
        }

        // Show test notification
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          new Notification('VenueFlow Notifications Enabled!', {
            body: 'You will now receive real-time updates.',
            icon: '/logo.png'
          });
        }
      }
    } catch (error) {
      console.error('Notification permission error:', error);
    }
  };

  const togglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const disableNotifications = () => {
    setNotificationsEnabled(false);
  };

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Notification Settings</h3>
      </div>

      {/* Enable/Disable Notifications */}
      <div className="bg-slate-900 bg-opacity-50 p-4 rounded border border-slate-500 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-semibold">Push Notifications</p>
            <p className="text-gray-400 text-sm">Receive real-time alerts on your device</p>
          </div>
          {notificationsEnabled ? (
            <button
              onClick={disableNotifications}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Disable
            </button>
          ) : (
            <button
              onClick={requestNotificationPermission}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Enable
            </button>
          )}
        </div>

        {notificationsEnabled && (
          <div className="flex items-center gap-2 text-green-300 text-sm">
            <Check className="w-4 h-4" />
            Notifications enabled
          </div>
        )}
      </div>

      {/* Notification Preferences */}
      {notificationsEnabled && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm mb-3">Notification Types</h4>

          {[
            { key: 'queueAlerts', label: 'Queue Alerts', desc: 'Get notified of long waits' },
            { key: 'eventReminders', label: 'Event Reminders', desc: 'Reminders for upcoming events' },
            { key: 'reservationConfirmation', label: 'Reservation Confirmation', desc: 'Confirm food orders' },
            { key: 'crowdDensity', label: 'Crowd Alerts', desc: 'When sector reaches high capacity' },
            { key: 'facilityClosed', label: 'Facility Closed', desc: 'When facilities are unavailable' },
            { key: 'leaderboardUpdates', label: 'Leaderboard Updates', desc: 'When you rank up' }
          ].map(item => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-slate-700 bg-opacity-50 rounded border border-slate-500 hover:border-blue-400 transition"
            >
              <div>
                <p className="text-white font-semibold text-sm">{item.label}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
              <button
                onClick={() => togglePreference(item.key)}
                className={`px-4 py-2 rounded transition text-white text-sm font-semibold ${
                  preferences[item.key]
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                {preferences[item.key] ? '✓ On' : '○ Off'}
              </button>
            </div>
          ))}
        </div>
      )}

      {!notificationsEnabled && (
        <div className="bg-blue-900 bg-opacity-30 border border-blue-500 rounded p-3">
          <p className="text-blue-200 text-sm">
            💡 Enable notifications to stay updated on queue times, events, and more!
          </p>
        </div>
      )}
    </div>
  );
};
