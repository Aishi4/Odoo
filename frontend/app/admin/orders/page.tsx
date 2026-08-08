"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, LayoutList, LayoutGrid, MoreVertical, ChevronDown, Download } from 'lucide-react';

const mockOrders = [
  { id: 'R001', customer: 'John Doe', status: 'To Pickup', pickup: '2026-08-09', return: '2026-08-15', total: '₹4,500', payment: 'Paid' },
  { id: 'R002', customer: 'Acme Corp', status: 'Active', pickup: '2026-08-01', return: '2026-08-10', total: '₹12,000', payment: 'Invoiced' },
  { id: 'R003', customer: 'Jane Smith', status: 'Late', pickup: '2026-07-20', return: '2026-07-30', total: '₹2,500', payment: 'Paid' },
  { id: 'R004', customer: 'TechStart Inc', status: 'To Return', pickup: '2026-08-05', return: '2026-08-08', total: '₹8,900', payment: 'Pending' },
  { id: 'R005', customer: 'Michael Chen', status: 'Completed', pickup: '2026-07-01', return: '2026-07-05', total: '₹1,200', payment: 'Paid' },
];

export default function OrdersDashboard() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const stats = [
    { label: 'Total Revenue (7d)', value: '₹42,500', trend: '+12%' },
    { label: 'Active Rentals', value: '45', trend: '+5%' },
    { label: 'Late Returns', value: '3', trend: '-2', isDanger: true },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage quotations, active rentals, and returns.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/admin/orders/new" className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#5c3c53] flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Order
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-500">{stat.label}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-sm font-medium ${stat.isDanger ? 'text-red-600' : 'text-emerald-600'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic View Area */}
      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></th>
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Pickup Date</th>
                  <th className="px-6 py-4">Return Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></td>
                    <td className="px-6 py-4 font-semibold text-[#CD2C58]">{order.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-600">{order.pickup}</td>
                    <td className="px-6 py-4 text-gray-600">{order.return}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{order.total}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${order.status === 'Active' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'To Pickup' ? 'bg-amber-100 text-amber-800' : ''}
                        ${order.status === 'To Return' ? 'bg-purple-100 text-purple-800' : ''}
                        ${order.status === 'Late' ? 'bg-red-100 text-red-800' : ''}
                        ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 bg-gray-50 overflow-x-auto min-h-[600px]">
            <div className="flex gap-6 min-w-max">
              {/* Kanban Columns */}
              {['To Pickup', 'Active', 'To Return', 'Late'].map((columnTitle) => (
                <div key={columnTitle} className="w-80 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">{columnTitle}</h3>
                    <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">
                      {mockOrders.filter(o => o.status === columnTitle).length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {mockOrders.filter(o => o.status === columnTitle).map(order => (
                      <div key={order.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-grab active:cursor-grabbing hover:border-[#CD2C58]/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-[#CD2C58] text-sm">{order.id}</span>
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{order.payment}</span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-3">{order.customer}</h4>
                        <div className="flex flex-col gap-1 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Pickup:</span> <span className="font-medium text-gray-700">{order.pickup}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Return:</span> <span className="font-medium text-gray-700">{order.return}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
