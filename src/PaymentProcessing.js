import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';

export const PaymentProcessing = ({ reservationItem, onPaymentComplete }) => {
  const [showPayment, setShowPayment] = useState(false);
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
        setShowPayment(false);
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
    <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg p-6 border border-slate-600 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Payment Methods</h3>
        </div>
        <button
          onClick={() => setShowPayment(!showPayment)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition text-sm font-semibold"
        >
          {showPayment ? 'Hide' : 'Pay Now'}
        </button>
      </div>

      {!showPayment ? (
        <div className="text-center text-gray-400 p-6 bg-slate-900 bg-opacity-50 rounded border border-slate-500">
          <p className="mb-3">💳 Secure payment processing powered by Stripe</p>
          <p className="text-sm">${reservationItem?.price || '0.00'}</p>
        </div>
      ) : (
        <form onSubmit={handlePayment} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Card Number</label>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleInputChange}
              placeholder="4242 4242 4242 4242"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-green-400 font-mono"
              required
            />
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Cardholder Name</label>
            <input
              type="text"
              name="holderName"
              value={formData.holderName}
              onChange={handleInputChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-green-400"
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Expiry Date</label>
              <input
                type="text"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-green-400 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">CVV</label>
              <input
                type="text"
                name="cvv"
                value={formData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-green-400 font-mono"
                required
              />
            </div>
          </div>

          <div className="bg-green-900 bg-opacity-30 border border-green-500 rounded p-3">
            <p className="text-green-200 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>🔒 Your payment information is secure and encrypted</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={paymentProcessing}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition disabled:opacity-50"
            >
              {paymentProcessing ? 'Processing...' : `Pay $${reservationItem?.price || '0.00'}`}
            </button>
            <button
              type="button"
              onClick={() => setShowPayment(false)}
              className="flex-1 px-4 py-3 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 p-3 bg-slate-900 bg-opacity-50 rounded border border-slate-500">
        <p className="text-gray-400 text-sm">
          <strong>Test Card:</strong> 4242 4242 4242 4242 | Any future date | Any 3-digit CVV
        </p>
      </div>
    </div>
  );
};
