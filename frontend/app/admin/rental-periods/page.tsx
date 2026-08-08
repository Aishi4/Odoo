"use client";

import React from 'react';
import { Search, Plus, Download } from 'lucide-react';

const mockPeriods = [
  { id: 'RP-001', name: '1 Hour', duration: '1 Hour(s)', discount: '0%' },
  { id: 'RP-002', name: '1 Day', duration: '1 Day(s)', discount: '0%' },
  { id: 'RP-003', name: '1 Week', duration: '7 Day(s)', discount: '10%' },
  { id: 'RP-004', name: '1 Month', duration: '30 Day(s)', discount: '25%' },
];

export default function RentalPeriodsPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Periods</h1>
          <p className="text-sm text-gray-500 mt-1">Define standard durations and discounts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Period
          </button>
        </div>
      </div>

      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search periods..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
          />
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></th>
              <th className="px-6 py-4">Period Name</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4 text-right">Built-in Discount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {mockPeriods.map((period) => (
              <tr key={period.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></td>
                <td className="px-6 py-4 font-bold text-gray-900">{period.name}</td>
                <td className="px-6 py-4 text-gray-600">{period.duration}</td>
                <td className="px-6 py-4 font-medium text-emerald-600 text-right">{period.discount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
