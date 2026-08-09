"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, RefreshCw, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Filter, Eye, X, CheckCircle2 } from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 1)); // Default Aug 2026
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const monthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSchedule(monthStr);
      if (res.success && res.data) {
        setScheduleData(res.data);
      }
    } catch (e) {
      console.error('Failed to load schedule timeline', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [monthStr]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const products = scheduleData?.products || [];
  const orders = scheduleData?.orders || [];
  const conflicts = scheduleData?.conflicts || [];
  const daysInMonth = scheduleData?.daysInMonth || 31;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Extract unique categories
  const categories = ['ALL', ...Array.from(new Set(products.map((p: any) => p.category).filter(Boolean))) as string[]];

  const filteredProducts = selectedCategory === 'ALL' 
    ? products 
    : products.filter((p: any) => p.category === selectedCategory);

  // Helper to check if a product has rental order on specific day of month
  const getOrderForProductAndDay = (productId: string, day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const targetDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    for (const order of orders) {
      if (order.status === 'CANCELLED') continue;

      const items = order.items || [];
      const isProductInOrder = items.some((it: any) => it.product_id === productId || it.product?.id === productId);

      if (isProductInOrder) {
        if (order.start_date <= targetDateStr && order.end_date >= targetDateStr) {
          const isStartDay = order.start_date === targetDateStr;
          const isEndDay = order.end_date === targetDateStr;

          return {
            order,
            isStartDay,
            isEndDay,
            status: order.status,
            orderNumber: order.order_number || order.id.slice(0, 8),
            customerName: order.customer?.name || 'Customer',
          };
        }
      }
    }
    return null;
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Schedule & Gantt Matrix</h1>
          <p className="text-sm text-gray-500 mt-1">Live timeline matrix & conflict detection engine for equipment rentals.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden text-sm">
            <button onClick={handlePrevMonth} className="px-3 py-2 hover:bg-gray-100 text-gray-700 border-r border-gray-200">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-bold text-gray-900 min-w-[140px] text-center">{monthName}</span>
            <button onClick={handleNextMonth} className="px-3 py-2 hover:bg-gray-100 text-gray-700 border-l border-gray-200">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button 
            onClick={handleCurrentMonth}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50"
          >
            Today
          </button>

          <button 
            onClick={fetchSchedule}
            className="px-3 py-2 bg-[#CD2C58] text-white text-sm font-medium rounded-lg shadow-sm hover:bg-[#b02248] flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Conflict Warnings Banner */}
      {conflicts.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-sm mb-2 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            Overbooking Conflict Detected ({conflicts.length} incidents in {monthName})
          </div>
          <div className="flex flex-wrap gap-2">
            {conflicts.slice(0, 5).map((c: any, idx: number) => (
              <span key={idx} className="bg-white border border-amber-300 text-xs px-2.5 py-1 rounded-md font-semibold shadow-xs">
                📅 {c.date}: <strong>{c.product_name}</strong> ({c.booked_qty} booked / {c.quantity_on_hand} in stock)
              </span>
            ))}
            {conflicts.length > 5 && (
              <span className="text-xs text-amber-700 font-bold self-center">+{conflicts.length - 5} more conflicts</span>
            )}
          </div>
        </div>
      )}

      {/* Toolbar & Category Filter */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-bold uppercase text-gray-600">Category Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md py-1 px-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'ALL' ? 'All Equipment Categories' : cat}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-500 font-medium">
          Showing {filteredProducts.length} Products & {orders.length} Active Orders
        </div>
      </div>

      {/* Main Gantt Grid Container */}
      <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[650px]">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Calculating rental matrix & conflicts for {monthName}...
          </div>
        ) : (
          <div className="flex-1 overflow-auto bg-gray-50">
            <div className="min-w-max">
              {/* Header Row (Days) */}
              <div className="flex border-b border-gray-200 sticky top-0 bg-white z-20 shadow-sm">
                <div className="w-64 shrink-0 border-r border-gray-200 p-4 font-bold text-gray-700 flex items-center bg-gray-50 text-xs uppercase tracking-wider">
                  Equipment Product
                </div>
                <div className="flex">
                  {daysArray.map(day => {
                    const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];
                    const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                    return (
                      <div 
                        key={day} 
                        className={`w-12 shrink-0 border-r border-gray-200 py-2 flex flex-col items-center justify-center ${isWeekend ? 'bg-gray-100/70' : 'bg-white'}`}
                      >
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{dayOfWeek}</span>
                        <span className="text-xs font-bold text-gray-900">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Rows */}
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No equipment products found matching category filter.</div>
              ) : (
                filteredProducts.map((product: any) => (
                  <div key={product.id} className="flex border-b border-gray-200 hover:bg-gray-50/50 transition-colors">
                    <div className="w-64 shrink-0 border-r border-gray-200 p-3 font-medium text-gray-800 text-xs bg-white sticky left-0 z-10 flex flex-col justify-center shadow-xs">
                      <span className="font-bold text-gray-900 truncate">{product.name}</span>
                      <div className="flex items-center justify-between mt-1 text-[11px]">
                        <span className="text-[#CD2C58] font-bold">₹{product.base_price}/day</span>
                        <span className="text-gray-500 font-semibold bg-gray-100 px-1.5 py-0.5 rounded">Stock: {product.quantity_on_hand}</span>
                      </div>
                    </div>

                    <div className="flex relative">
                      {daysArray.map(day => {
                        const cell = getOrderForProductAndDay(product.id, day);
                        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;

                        return (
                          <div 
                            key={day} 
                            className={`w-12 shrink-0 border-r border-gray-200 h-14 relative flex items-center justify-center p-0.5 ${isWeekend ? 'bg-gray-100/40' : 'bg-white'}`}
                          >
                            {cell ? (
                              <div 
                                onClick={() => setSelectedOrder(cell.order)}
                                className={`w-full h-9 cursor-pointer transition-transform hover:scale-105 rounded text-[9px] font-bold text-white flex flex-col items-center justify-center p-0.5 leading-tight truncate shadow-xs ${
                                  cell.status === 'CONFIRMED' ? 'bg-[#CD2C58]' :
                                  cell.status === 'PICKED_UP' || cell.status === 'ACTIVE' ? 'bg-blue-600' :
                                  cell.status === 'RETURNED' || cell.status === 'COMPLETED' ? 'bg-emerald-600' :
                                  'bg-amber-600'
                                }`}
                                title={`Order #${cell.orderNumber} - ${cell.customerName} (${cell.status})`}
                              >
                                <span className="truncate">{cell.orderNumber}</span>
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

        {/* Legend */}
        <div className="p-3 border-t border-gray-200 bg-white flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-xs bg-[#CD2C58]"></div> Confirmed Order</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-xs bg-blue-600"></div> Picked Up / Active</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-xs bg-emerald-600"></div> Returned / Completed</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-xs bg-amber-600"></div> Draft / Sent Quotation</div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Order #{selectedOrder.order_number}</h3>
                <p className="text-xs text-gray-500">Customer: {selectedOrder.customer?.name || 'Guest'}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-xl">
                <div>
                  <span className="text-xs text-gray-500 block">Start Date</span>
                  <span className="font-bold text-gray-800">{selectedOrder.start_date}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 block">End Date</span>
                  <span className="font-bold text-gray-800">{selectedOrder.end_date}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Status</span>
                <span className="font-bold text-xs uppercase px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                  {selectedOrder.status}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">₹{selectedOrder.subtotal}</span>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Booked Items</span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {selectedOrder.items?.map((it: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded-lg">
                      <span className="font-semibold text-gray-800">{it.product?.name || 'Equipment'}</span>
                      <span className="font-bold text-gray-600">Qty: {it.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
