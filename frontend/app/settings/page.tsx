import React from 'react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <div className="font-bold text-gray-900">Order Updates</div>
                <div className="text-sm text-gray-500">Receive emails about your rental status.</div>
              </div>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <div className="font-bold text-gray-900">Promotions & Offers</div>
                <div className="text-sm text-gray-500">Get notified about special discounts.</div>
              </div>
            </label>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Security</h2>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition-colors">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
