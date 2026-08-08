import React from 'react';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row gap-12">
        <div className="flex flex-col items-center shrink-0">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            <User className="w-12 h-12" />
          </div>
          <button className="text-sm font-bold text-[#CD2C58] hover:underline">Change Photo</button>
        </div>
        
        <div className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
              <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
              <input type="text" defaultValue="+91 98765 43210" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input type="email" defaultValue="john@example.com" disabled className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg py-2.5 px-4" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
          </div>
          
          <hr className="my-6 border-gray-200" />
          
          <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Address</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Street Address</label>
              <input type="text" placeholder="123 Main St, Apt 4B" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">City</label>
                <input type="text" placeholder="Mumbai" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">State</label>
                <input type="text" placeholder="Maharashtra" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ZIP Code</label>
                <input type="text" placeholder="400001" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
              </div>
            </div>
          </div>

          <button className="bg-[#CD2C58] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#b02248] transition-colors mt-8 block w-fit">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
