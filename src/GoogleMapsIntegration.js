import React, { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export const GoogleMapsIntegration = () => {
  const [showMap, setShowMap] = useState(false);

  // Venue coordinates (example: Stadium in a major city)
  const venueCoordinates = {
    lat: 40.7128,
    lng: -74.0060,
    name: 'Stadium Central'
  };

  const facilities = [
    { name: 'Pizza Stand', sector: 'North', lat: 40.7135, lng: -74.0055 },
    { name: 'Burger Hut', sector: 'South', lat: 40.7121, lng: -74.0055 },
    { name: 'Medical Tent', sector: 'Center', lat: 40.7128, lng: -74.0060 },
    { name: 'Lost & Found', sector: 'Center', lat: 40.7128, lng: -74.0065 }
  ];

  const getDirections = (facility) => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}&travelmode=walking`;
    window.open(mapsUrl, '_blank');
  };

  const openVenueLocation = () => {
    const mapsUrl = `https://www.google.com/maps?q=${venueCoordinates.lat},${venueCoordinates.lng}`;
    window.open(mapsUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-red-400" />
          <h3 className="text-xl font-bold text-white">Venue Location & Navigation</h3>
        </div>
        <button
          onClick={() => setShowMap(!showMap)}
          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition"
        >
          {showMap ? 'Hide' : 'Show'} Map
        </button>
      </div>

      {showMap ? (
        <div className="space-y-4">
          {/* Venue Map Placeholder */}
          <div className="bg-slate-900 rounded h-64 flex items-center justify-center border border-slate-500 mb-4">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-red-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm mb-3">
                Google Maps Embed
                <br />
                (API Key required for production)
              </p>
              <button
                onClick={openVenueLocation}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
              >
                Open in Google Maps
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {facilities.map((facility, idx) => (
              <div key={idx} className="bg-slate-700 bg-opacity-50 p-3 rounded border border-slate-500 hover:border-red-400 transition">
                <p className="text-white font-semibold text-sm mb-2">
                  {facility.name}
                </p>
                <p className="text-gray-400 text-xs mb-3">{facility.sector} Sector</p>
                <button
                  onClick={() => getDirections(facility)}
                  className="w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3 h-3" />
                  Get Directions
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded p-6 text-center border border-slate-500">
          <MapPin className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-gray-300 mb-4">
            Click "Show Map" to view the venue location and get directions to facilities
          </p>
          <button
            onClick={openVenueLocation}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition"
          >
            View Venue on Google Maps
          </button>
        </div>
      )}

      <div className="mt-4 p-3 bg-red-900 bg-opacity-30 rounded border border-red-500">
        <p className="text-red-200 text-sm">
          📍 <span className="font-semibold">Pro Tip:</span> Use navigation to find facilities quickly!
        </p>
      </div>
    </div>
  );
};
