import React from 'react';

export default function OrdersPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-4">
            <button className="px-4 py-2 bg-[#CD2C58] text-white text-sm font-bold rounded-lg shadow-sm">Active</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50">Completed</button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50">Cancelled</button>
          </div>
        </div>
        
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No active orders found</h2>
          <p className="text-gray-500">You don't have any ongoing rentals at the moment.</p>
        </div>
      </div>
    </div>
  );
}
