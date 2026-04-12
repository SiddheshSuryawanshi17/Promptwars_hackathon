import React, { useState, useEffect } from 'react';
import { ShoppingCart, Heart, MapPin, Clock } from 'lucide-react';
import { useAuth } from './AuthContext';
import { PaymentProcessing } from './PaymentProcessing';

export const ConcessionReservations = () => {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [concessions, setConcessions] = useState([]);
  const [showReservations, setShowReservations] = useState(false);
  const [pendingItem, setPendingItem] = useState(null); // { concession, item }

  useEffect(() => {
    fetchConcessions();
    if (token) fetchOrders();
  }, [token]);

  const fetchConcessions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/concession-menu');
      const data = await res.json();
      setConcessions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReservations(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReserve = (concession, item) => {
    if (!token) return alert('Please log in to reserve items');
    setShowReservations(false);
    setPendingItem({ concession, item });
  };

  const submitOrder = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          concessionId: pendingItem.concession.id, 
          itemId: pendingItem.item.id 
        })
      });
      if (res.ok) {
        setPendingItem(null);
        fetchOrders();
        setShowReservations(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-bold text-white">Food & Drinks Pre-Order</h3>
        </div>
        <button
          onClick={() => { setShowReservations(!showReservations); setPendingItem(null); }}
          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
        >
          {reservations.length > 0 ? `My Orders (${reservations.length})` : 'Check Orders'}
        </button>
      </div>

      {showReservations && reservations.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-white font-semibold text-sm mb-3">Your Live Orders:</h4>
          {reservations.map((res) => (
            <div key={res.id} className="bg-slate-700 bg-opacity-50 p-3 rounded border border-orange-500">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold text-sm">{res.itemName}</p>
                  <p className="text-gray-400 text-sm">{res.concessionName} • {res.concessionSector}</p>
                  <p className="text-yellow-400 text-sm font-semibold mt-1">${(res.price || 0).toFixed(2)}</p>
                </div>
                <span className={`px-2 py-1 flex items-center text-xs font-bold rounded ${res.status === 'ready' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white animate-pulse'}`}>
                    {res.status === 'ready' ? '✓ Ready' : '⏳ Preparing'}
                </span>
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
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {concessions.map((concession) => (
            <div key={concession.id} className="bg-slate-700 bg-opacity-50 p-4 rounded border border-slate-500 hover:border-orange-400 transition" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold flex items-center gap-2">
                    {concession.name}
                    <span className="text-xs bg-orange-600 px-2 py-1 rounded shadow-inner">
                      {concession.currentWait} min wait
                    </span>
                  </h4>
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" /> {concession.sector} Sector
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {concession.items.map((item, idx) => {
                  const isPending = pendingItem?.item?.id === item.id && pendingItem?.concession?.id === concession.id;
                  return (
                  <div key={item.id || idx} className={`flex flex-col bg-slate-800 bg-opacity-50 p-2 rounded transition border ${isPending ? 'border-orange-500' : 'border-transparent'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm font-medium">{item.name}</p>
                        <p className="text-gray-500 text-xs">{item.estimatedTime}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-400 font-bold">${(item.price || 0).toFixed(2)}</span>
                        {!isPending && (
                          <button
                            onClick={() => handleReserve(concession, item)}
                            className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded transition ml-2"
                          >
                            Order
                          </button>
                        )}
                      </div>
                    </div>
                    {isPending && (
                        <PaymentProcessing 
                          reservationItem={{ name: `${item.name} at ${concession.name}`, price: item.price }}
                          onCancel={() => setPendingItem(null)}
                          onPaymentComplete={submitOrder}
                        />
                    )}
                  </div>
                )})}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 bg-slate-900 bg-opacity-50 rounded border border-slate-500">
        <p className="text-gray-300 text-sm flex items-center gap-2">
          💳 <span className="font-semibold text-orange-300">Skip the lines:</span> Pre-order food and drinks. We ping you when it's ready!
        </p>
      </div>
    </div>
  );
};
