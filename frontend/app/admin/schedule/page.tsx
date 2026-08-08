"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Download, Search } from 'lucide-react';

const mockProducts = ['Premium Office Chair', 'MacBook Pro 16"', 'Canon EOS R5', 'Standing Desk', 'Sony A7S III'];
const days = Array.from({ length: 31 }, (_, i) => i + 1);

export default function SchedulePage() {
  const [currentMonth, setCurrentMonth] = useState('August 2026');

  // Generate some mock bookings for the grid
  const getBooking = (product: string, day: number) => {
    if (product === 'Premium Office Chair' && day >= 5 && day <= 12) return { type: 'active', label: 'R001 - John Doe' };
    if (product === 'MacBook Pro 16"' && day >= 1 && day <= 4) return { type: 'completed', label: 'R002 - Acme Corp' };
    if (product === 'Canon EOS R5' && day >= 15 && day <= 20) return { type: 'active', label: 'R003 - Jane Smith' };
    if (product === 'Standing Desk' && day >= 22 && day <= 28) return { type: 'late', label: 'R004 - TechStart Inc' };
    if (product === 'Sony A7S III' && day >= 2 && day <= 5) return { type: 'active', label: 'R005 - Michael Chen' };
    return null;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of all product bookings and availability.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 min-w-[140px] text-center">{currentMonth}</h2>
            <button className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="px-3 py-1.5 text-sm font-medium border border-gray-300 bg-white rounded-md hover:bg-gray-50">
              Today
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-64 pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
              />
            </div>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="min-w-max">
            {/* Header Row (Days) */}
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="w-64 shrink-0 border-r border-gray-200 p-4 font-bold text-gray-700 flex items-center bg-gray-50">
                Products
              </div>
              <div className="flex">
                {days.map(day => (
                  <div key={day} className="w-12 shrink-0 border-r border-gray-200 py-2 flex flex-col items-center justify-center bg-white">
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'][(day + 5) % 7]}
                    </span>
                    <span className={`text-sm font-bold ${day === 12 ? 'bg-[#CD2C58] text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-900'}`}>
                      {day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Rows */}
            {mockProducts.map((product, idx) => (
              <div key={idx} className="flex border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                <div className="w-64 shrink-0 border-r border-gray-200 p-4 font-medium text-gray-800 text-sm bg-white sticky left-0 z-10 shadow-[1px_0_2px_rgba(0,0,0,0.02)] flex flex-col justify-center">
                  {product}
                </div>
                <div className="flex relative">
                  {days.map(day => {
                    const booking = getBooking(product, day);
                    // Determine if we should render the start of a booking block
                    const isStart = booking && (!getBooking(product, day - 1) || getBooking(product, day - 1)?.label !== booking.label);
                    // Determine duration
                    let duration = 0;
                    if (isStart) {
                      let d = day;
                      while (d <= 31 && getBooking(product, d)?.label === booking.label) {
                        duration++;
                        d++;
                      }
                    }

                    return (
                      <div key={day} className={`w-12 shrink-0 border-r border-gray-200 h-16 relative ${[0,6].includes((day + 5) % 7) ? 'bg-gray-100/50' : 'bg-white'}`}>
                        {isStart && (
                          <div 
                            className={`absolute top-2 bottom-2 left-1 rounded-md px-2 py-1 z-20 flex items-center shadow-sm overflow-hidden text-xs font-bold text-white whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity
                              ${booking.type === 'active' ? 'bg-[#CD2C58]' : ''}
                              ${booking.type === 'completed' ? 'bg-emerald-500' : ''}
                              ${booking.type === 'late' ? 'bg-red-500' : ''}
                            `}
                            style={{ width: `calc(${duration * 100}% - 8px)` }}
                          >
                            {booking.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="p-3 border-t border-gray-200 bg-white flex items-center justify-center gap-6 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#CD2C58]"></div> Active Rental</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Completed</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Late Return</div>
        </div>
      </div>
    </div>
  );
}
