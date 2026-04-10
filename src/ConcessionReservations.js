import React, { useState } from 'react';
import { ShoppingCart, Heart, MapPin, Clock } from 'lucide-react';

export const ConcessionReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [showReservations, setShowReservations] = useState(false);
  const [selectedConcession, setSelectedConcession] = useState(null);

  const concessions = [
    {
      id: 'conc_1',
      name: 'Pizza Stand',
      sector: 'North',
      items: [
        { name: 'Cheese Pizza Slice', price: 8, estimatedTime: '5 mins' },
        { name: 'Pepperoni Pizza Slice', price: 9, estimatedTime: '5 mins' }
      ],
      currentWait: 12
    },
    {
      id: 'conc_2',
      name: 'Burger Hut',
      sector: 'South',
      items: [
        { name: 'Classic Burger', price: 10, estimatedTime: '8 mins' },
        { name: 'Deluxe Burger', price: 12, estimatedTime: '10 mins' }
      ],
      currentWait: 15
    },
    {
      id: 'conc_3',
      name: 'Soda Bar',
      sector: 'East',
      items: [
        { name: 'Soda (Small)', price: 4, estimatedTime: '2 mins' },
        { name: 'Soda (Large)', price: 5, estimatedTime: '2 mins' }
      ],
      currentWait: 8
    }
  ];

  const handleReserve = (concession, item) => {
    const reservation = {
      id: `res_${Date.now()}`,
      concession: concession.name,
      item: item.name,
      price: item.price,
      estimatedTime: item.estimatedTime,
      pickedUp: false,
      timestamp: new Date()
    };

    setReservations([...reservations, reservation]);
    setSelectedConcession(null);
    alert(`✓ Reservation confirmed! Pick up: ${item.name} at ${concession.name}`);
  };

  const cancelReservation = (resId) => {
    setReservations(reservations.filter(r => r.id !== resId));
  };

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">Concession Reservations</h3>
        </div>
        <button
          onClick={() => setShowReservations(!showReservations)}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
        >
          {reservations.length > 0 ? `My Orders (${reservations.length})` : 'Check Orders'}
        </button>
      </div>

      {showReservations && reservations.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm mb-3">Your Reservations:</h4>
          {reservations.map((res) => (
            <div key={res.id} className="bg-slate-700 bg-opacity-50 p-3 rounded border border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold text-sm">{res.item}</p>
                  <p className="text-gray-400 text-sm">{res.concession}</p>
                  <p className="text-yellow-400 text-sm font-semibold mt-1">${res.price}</p>
                </div>
                <button
                  onClick={() => cancelReservation(res.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                >
                  Cancel
                </button>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {res.estimatedTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {concessions.map((concession) => (
            <div key={concession.id} className="bg-slate-700 bg-opacity-50 p-4 rounded border border-slate-500 hover:border-orange-400 transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    {concession.name}
                    <span className="text-xs bg-orange-600 px-2 py-1 rounded">
                      {concession.currentWait} min wait
                    </span>
                  </h4>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {concession.sector} Sector
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {concession.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-800 bg-opacity-50 p-2 rounded">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">{item.name}</p>
                      <p className="text-gray-500 text-xs">{item.estimatedTime}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-bold">${item.price}</span>
                      <button
                        onClick={() => handleReserve(concession, item)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition"
                      >
                        Reserve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-orange-900 bg-opacity-30 rounded border border-orange-500">
        <p className="text-orange-200 text-sm">
          💳 <span className="font-semibold">Tip:</span> Reserve ahead to skip lines! Pay at pickup.
        </p>
      </div>
    </div>
  );
};
