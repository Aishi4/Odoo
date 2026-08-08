"use client";
import React, { useState } from 'react';
import { ChevronRight, CreditCard, MapPin, ShoppingBag, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Checkout() {
  const [step, setStep] = useState(1);

  const steps = [
    { num: 1, name: 'Cart', icon: ShoppingBag },
    { num: 2, name: 'Address', icon: MapPin },
    { num: 3, name: 'Payment', icon: CreditCard },
    { num: 4, name: 'Success', icon: CheckCircle },
  ];

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#CD2C58] -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
        
        {steps.map((s, i) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${
              step >= s.num 
                ? 'bg-[#CD2C58] border-white text-white shadow-md shadow-[#CD2C58]/20' 
                : 'bg-white border-gray-200 text-gray-400'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-sm font-bold ${step >= s.num ? 'text-[#CD2C58]' : 'text-gray-400'}`}>{s.name}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Step 1: Cart */}
        {step === 1 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review your Cart</h2>
            
            <div className="space-y-6 mb-8">
              {/* Cart Item */}
              <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                <img src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=200&q=80" alt="Chair" className="w-24 h-24 object-cover rounded-lg bg-white border border-gray-200 p-2" />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">Premium Office Chair</h3>
                  <p className="text-sm text-gray-500 mb-2">Variant: Black</p>
                  <p className="text-xs text-gray-400">Duration: 1 Month (Aug 15 - Sep 14)</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-[#CD2C58]">$250.00</div>
                  <div className="text-sm text-gray-500 mt-2">Qty: 1</div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="text" placeholder="Promo code" className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" />
                <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Apply</button>
              </div>
              <div className="text-right w-full sm:w-auto">
                <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                <div className="text-3xl font-black text-gray-900">$250.00</div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setStep(2)}
                className="bg-[#CD2C58] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20"
              >
                Proceed to Address <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Address */}
        {step === 2 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Delivery Methods */}
              <div className="col-span-full mb-2">
                <label className="text-sm font-semibold text-gray-700 block mb-3">Delivery Method</label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center gap-3 p-4 border-2 border-[#CD2C58] bg-[#FFE6D4]/30 rounded-xl cursor-pointer">
                    <input type="radio" name="delivery" defaultChecked className="text-[#CD2C58] focus:ring-[#CD2C58]" />
                    <span className="font-semibold text-gray-900">Standard Delivery</span>
                  </label>
                  <label className="flex-1 flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300">
                    <input type="radio" name="delivery" className="text-[#CD2C58] focus:ring-[#CD2C58]" />
                    <span className="font-semibold text-gray-700">Store Pickup</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="John" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="Doe" />
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="123 Main St" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="New York" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="10001" />
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-6">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="bg-[#CD2C58] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {step === 3 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
            <p className="text-gray-500 mb-8 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-green-500" /> Secure 256-bit SSL encryption.</p>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pl-12 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="0000 0000 0000 0000" />
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input type="text" className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" placeholder="123" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-6">
              <button 
                onClick={() => setStep(2)}
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(4)}
                className="bg-[#CD2C58] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20"
              >
                Pay $250.00
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Your rental order <span className="font-bold text-gray-900">#ORD-2023-8901</span> has been successfully placed. We've sent a confirmation email to john.doe@example.com.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/orders" className="bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
                View Order Status
              </a>
              <a href="/" className="bg-[#CD2C58] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20">
                Continue Shopping
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
