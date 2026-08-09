"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Package, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Clock, 
  DollarSign, 
  Activity, 
  Layers, 
  ArrowRight,
  ShieldAlert,
  Award
} from 'lucide-react';
import { adminApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, prioritiesRes, topProductsRes] = await Promise.all([
        adminApi.getDashboardOverview(),
        adminApi.getPriorities(),
        adminApi.getTopRentedProducts(5),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (prioritiesRes.success && Array.isArray(prioritiesRes.data?.items)) {
        setPriorities(prioritiesRes.data.items);
      }
      if (topProductsRes.success && Array.isArray(topProductsRes.data)) {
        setTopProducts(topProductsRes.data);
      }
    } catch (e) {
      console.error('Error fetching dashboard metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)] space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Analytics & Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time performance metrics, rental utilization, and priority fulfillment alerts.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/schedule"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl shadow-xs hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#CD2C58]" /> View Schedule Matrix
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-[#CD2C58] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#b02248] transition-colors flex items-center gap-1.5"
          >
            Manage Orders <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center bg-white rounded-2xl border border-gray-200 shadow-xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
          Loading analytics metrics...
        </div>
      ) : (
        <>
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* Total Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</span>
                <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">₹{Number(overview?.rental_revenue || 0).toLocaleString()}</span>
                <span className="text-xs text-emerald-600 block mt-1 font-semibold">Active & Completed Sales</span>
              </div>
            </div>

            {/* Active Rentals */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Rentals</span>
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{overview?.active_rentals || 0}</span>
                <span className="text-xs text-blue-600 block mt-1 font-semibold">Orders in field</span>
              </div>
            </div>

            {/* Equipment Utilization */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Equipment Utilization</span>
                <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{overview?.utilization_rate || 0}%</span>
                <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${overview?.utilization_rate || 0}%` }} />
                </div>
              </div>
            </div>

            {/* Due Today */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Returns Due Today</span>
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-gray-900">{overview?.due_today || 0}</span>
                <span className="text-xs text-amber-600 block mt-1 font-semibold">Scheduled for return</span>
              </div>
            </div>

            {/* Overdue Returns */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overdue Alerts</span>
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-rose-600">{overview?.overdue_rentals || 0}</span>
                <span className="text-xs text-rose-600 block mt-1 font-semibold">Requires follow-up</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Priority Action Items */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
              <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#CD2C58]" /> Priority Action Center
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Automated workflow alerts requiring vendor attention.</p>
                </div>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full">
                  {priorities.length} Tasks
                </span>
              </div>

              {priorities.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All operations are up to date! No pending priority tasks.
                </div>
              ) : (
                <div className="space-y-3">
                  {priorities.map((item, idx) => {
                    const isHigh = item.priority === 'HIGH';
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-colors ${
                          isHigh ? 'bg-rose-50/40 border-rose-200' : 'bg-amber-50/40 border-amber-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${isHigh ? 'text-rose-600' : 'text-amber-600'}`} />
                          <div>
                            <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                              <span>Order #{item.order_number || 'ORD'}</span>
                              {item.customer_name && <span className="text-xs font-normal text-gray-500">({item.customer_name})</span>}
                            </div>
                            <p className="text-xs text-gray-700 mt-0.5">{item.message}</p>
                          </div>
                        </div>

                        <Link
                          href="/admin/orders"
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-800 text-xs font-bold rounded-lg hover:bg-gray-50 shadow-2xs whitespace-nowrap"
                        >
                          Action
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Rented Products Leaderboard */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" /> Top Rented Equipment
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">Most popular inventory items.</p>
                  </div>
                </div>

                {topProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No equipment rental data yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((prod, idx) => (
                      <div key={prod.product_id || idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#CD2C58]/10 text-[#CD2C58] font-black text-xs flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-gray-900 text-sm block line-clamp-1">{prod.product_name || 'Product'}</span>
                            <span className="text-xs text-gray-500">Total Rented: {prod.total_quantity} units</span>
                          </div>
                        </div>
                        <div className="text-right font-bold text-emerald-600 text-sm">
                          ₹{Number(prod.total_revenue || 0).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6">
                <Link
                  href="/admin/products"
                  className="w-full py-2.5 bg-gray-900 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  Manage Product Inventory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
