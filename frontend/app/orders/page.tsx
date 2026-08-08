"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Package, Calendar, CreditCard, ChevronRight } from 'lucide-react';
import { orderApi } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CONFIRMED' | 'COMPLETED' | 'PENDING_PAYMENT'>('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const res = await orderApi.getOrders();
      setLoading(false);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    return order.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Rental Orders ({orders.length})</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-3 flex-wrap">
          {(['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${filter === status ? 'bg-[#CD2C58] text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Fetching your rental orders from database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-gray-300 mb-3" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">No orders found</h2>
            <p className="text-gray-500 text-sm mb-6">You don't have any ongoing or past rentals under this filter.</p>
            <Link href="/" className="px-5 py-2.5 bg-[#CD2C58] text-white text-sm font-bold rounded-xl hover:bg-[#b02248] transition-colors">
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map((order) => {
              const orderDate = new Date(order.created_at || order.createdAt || Date.now()).toLocaleDateString();
              const amount = Number(order.subtotal || order.total_amount || 0);
              const orderNum = order.order_number || (order.id ? order.id.slice(0, 8) : 'ORD');

              return (
                <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold text-gray-900 text-base">Order #{orderNum}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'PENDING_PAYMENT' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Date: {orderDate}</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Subtotal: ₹{amount.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/orders`}
                    className="text-sm font-bold text-[#CD2C58] hover:underline flex items-center gap-1"
                  >
                    View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
