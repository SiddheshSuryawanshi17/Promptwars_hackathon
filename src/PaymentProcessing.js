import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

export const PaymentProcessing = ({ reservationItem, onPaymentComplete, onCancel }) => {
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;

    if (name === 'cardNumber') {
      formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formatted.length > 19) formatted = formatted.slice(0, 19);
    } else if (name === 'expiryDate') {
      formatted = value.replace(/\D/g, '');
      if (formatted.length >= 2) {
        formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4);
      }
      if (formatted.length > 5) formatted = formatted.slice(0, 5);
    } else if (name === 'cvv') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formatted
    }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.holderName) {
      alert('Please fill in all payment details');
      return;
    }

    setPaymentProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentSuccess(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setPaymentSuccess(false);
        setFormData({
          cardNumber: '',
          expiryDate: '',
          cvv: '',
          holderName: ''
        });
        if (onPaymentComplete) onPaymentComplete();
      }, 2000);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <div className="bg-green-900 bg-opacity-50 border border-green-500 rounded-lg p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-green-300 mb-2">Payment Successful!</h3>
        <p className="text-green-200">Your order has been confirmed.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-5 border border-slate-600 shadow-inner mt-4">
      <div className="flex items-center gap-2 mb-4 text-green-400">
        <CreditCard className="w-5 h-5" />
        <h4 className="font-bold text-white text-lg">Complete Payment</h4>
      </div>

      <div className="text-center text-gray-400 p-4 bg-slate-900 bg-opacity-50 rounded border border-slate-500 mb-4">
        <p className="text-sm text-white font-semibold flex justify-between">
          <span>{reservationItem?.name || 'Item'}</span>
          <span className="text-yellow-400">${(reservationItem?.price || 0).toFixed(2)}</span>
        </p>
      </div>

      <form onSubmit={handlePayment} className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">Card Number</label>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            placeholder="4242 4242 4242 4242"
            className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-green-400 font-mono"
            required
          />
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="block text-gray-300 text-xs font-medium mb-1">Cardholder Name</label>
          <input
            type="text"
            name="holderName"
            value={formData.holderName}
            onChange={handleInputChange}
            placeholder="John Doe"
            className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-green-400"
            required
          />
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">Expiry Date</label>
            <input
              type="text"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleInputChange}
              placeholder="MM/YY"
              className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-green-400 font-mono"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 text-xs font-medium mb-1">CVV</label>
            <input
              type="text"
              name="cvv"
              value={formData.cvv}
              onChange={handleInputChange}
              placeholder="123"
              className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:outline-none focus:border-green-400 font-mono"
              required
            />
          </div>
        </div>

        <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded p-2">
          <p className="text-green-200 text-xs flex items-center gap-2">
            <Lock className="w-3 h-3" />
            <span>🔒 Secure & encrypted</span>
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={paymentProcessing}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition disabled:opacity-50 text-sm"
          >
            {paymentProcessing ? 'Processing' : `Pay $${(reservationItem?.price || 0).toFixed(2)}`}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-bold rounded transition text-sm"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-slate-900 bg-opacity-50 rounded border border-slate-500">
        <p className="text-gray-400 text-sm">
          <strong>Test Card:</strong> 4242 4242 4242 4242 | Any future date | Any 3-digit CVV
        </p>
      </div>
    </div>
  );
};
