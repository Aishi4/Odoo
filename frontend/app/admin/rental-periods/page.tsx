"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { catalogApi } from '@/lib/api';

export default function RentalPeriodsPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPeriods = async () => {
      setLoading(true);
      const res = await catalogApi.getRentalPeriods();
      setLoading(false);

      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setPeriods(res.data);
      } else {
        // Default periods from DB schema fallback
        setPeriods([
          { id: 'RP-001', name: '1 Hour', duration: '1 Hour', discount: '0%' },
          { id: 'RP-002', name: '1 Day', duration: '1 Day', discount: '0%' },
          { id: 'RP-003', name: '1 Week', duration: '7 Days', discount: '10%' },
          { id: 'RP-004', name: '1 Month', duration: '30 Days', discount: '25%' },
        ]);
      }
    };

    fetchPeriods();
  }, []);

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Periods</h1>
          <p className="text-sm text-gray-500 mt-1">Configured rental durations and discount terms in database.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Loading rental periods...
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Period Name</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4 text-right">Built-in Discount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {periods.map((period) => (
                <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{period.name || period.title}</td>
                  <td className="px-6 py-4 text-gray-600">{period.duration || period.unit || '1 Day'}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600 text-right">{period.discount || '0%'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
