"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, RefreshCw, Loader2, Info } from 'lucide-react';
import { catalogApi, adminApi } from '@/lib/api';

export default function SchedulePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes] = await Promise.all([
        catalogApi.getProducts(),
        adminApi.getAllOrders(),
      ]);

      if (prodRes.success && Array.isArray(prodRes.data)) {
        setProducts(prodRes.data);
      }
      if (orderRes.success && Array.isArray(orderRes.data)) {
        setOrders(orderRes.data);
      }
    } catch (e) {
      console.error('Failed to load schedule timeline', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // Helper to check if a product has a rental on a specific day in August 2026
  const getRentalForProductAndDay = (productId: string, day: number) => {
    for (const order of orders) {
      if (order.status === 'CANCELLED') continue;

      const items = order.items || [];
      const isProductInOrder = items.some((it: any) => it.product_id === productId || it.product?.id === productId);

      if (isProductInOrder) {
        const start = order.start_date ? new Date(order.start_date).getDate() : 1;
        const end = order.end_date ? new Date(order.end_date).getDate() : 15;

        if (day >= start && day <= end) {
          return {
            status: order.status,
            orderNumber: order.order_number || order.id.slice(0, 8),
            customerName: order.customer?.name || order.Customer?.name || 'Customer',
          };
        }
      }
    }
    return null;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Schedule & Availability Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Live timeline of product rentals mapped from customer purchases (PostgreSQL).</p>
        </div>

        <button 
          onClick={fetchData}
          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
        <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#CD2C58]" />
            <h2 className="text-lg font-bold text-gray-900">August 2026 Timeline</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Today: Aug 8, 2026</span>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Loading rental schedule matrix...
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="min-w-max">
              {/* Header Row (Days) */}
              <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20 shadow-sm">
                <div className="w-64 shrink-0 border-r border-gray-200 p-4 font-bold text-gray-700 flex items-center bg-gray-50">
                  Equipment Product
                </div>
                <div className="flex">
                  {days.map(day => (
                    <div key={day} className="w-12 shrink-0 border-r border-gray-200 py-2 flex flex-col items-center justify-center bg-white">
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'][(day + 5) % 7]}
                      </span>
                      <span className={`text-sm font-bold ${day === 8 ? 'bg-[#CD2C58] text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm' : 'text-gray-900'}`}>
                        {day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Rows */}
              {products.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No products in inventory catalog.</div>
              ) : (
                products.map((product) => (
                  <div key={product.id} className="flex border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <div className="w-64 shrink-0 border-r border-gray-200 p-4 font-medium text-gray-800 text-sm bg-white sticky left-0 z-10 flex flex-col justify-center shadow-sm">
                      <span className="font-bold text-gray-900 truncate">{product.name}</span>
                      <span className="text-xs text-[#CD2C58] font-semibold">₹{product.base_price}/day</span>
                    </div>
                    <div className="flex relative">
                      {days.map(day => {
                        const rental = getRentalForProductAndDay(product.id, day);
                        return (
                          <div key={day} className="w-12 shrink-0 border-r border-gray-200 h-16 relative bg-white flex items-center justify-center p-0.5">
                            {rental ? (
                              <div 
                                className={`w-full h-10 rounded text-[9px] font-bold text-white flex flex-col items-center justify-center p-0.5 leading-tight truncate shadow-xs ${
                                  rental.status === 'CONFIRMED' ? 'bg-[#CD2C58]' :
                                  rental.status === 'ACTIVE' ? 'bg-blue-600' :
                                  rental.status === 'COMPLETED' ? 'bg-emerald-600' :
                                  'bg-amber-600'
                                }`}
                                title={`Order #${rental.orderNumber} - ${rental.customerName} (${rental.status})`}
                              >
                                <span>{rental.orderNumber}</span>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-[#CD2C58]"></div> Confirmed Purchase</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-blue-600"></div> Active Rental</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-600"></div> Completed</div>
        </div>
      </div>
    </div>
  );
}
