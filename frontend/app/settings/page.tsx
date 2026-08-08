"use client";

import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#CD2C58]" /> Email Notifications
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={orderUpdates} 
                onChange={(e) => setOrderUpdates(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <div className="font-bold text-gray-900 text-sm">Order & Return Reminders</div>
                <div className="text-xs text-gray-500">Receive transactional emails about your active pickup and return dates.</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={promotions} 
                onChange={(e) => setPromotions(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <div className="font-bold text-gray-900 text-sm">Promotions & Offers</div>
                <div className="text-xs text-gray-500">Get notified about special discounts and new equipment additions.</div>
              </div>
            </label>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#CD2C58]" /> Security & Password
          </h2>
          <p className="text-xs text-gray-500 mb-4">Protect your account with standard JWT authorization.</p>
          <button 
            onClick={handleSave}
            className="bg-[#CD2C58] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#b02248] transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
