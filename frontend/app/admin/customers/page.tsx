"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, LayoutGrid, LayoutList, Download, Mail, Phone } from 'lucide-react';

const mockCustomers = [
  { id: 'C001', name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', city: 'Mumbai', orders: 12, spent: '₹45,000', tags: ['VIP', 'Renter'] },
  { id: 'C002', name: 'Acme Corp', email: 'billing@acme.com', phone: '+91 98765 12345', city: 'Delhi', orders: 3, spent: '₹120,000', tags: ['B2B'] },
  { id: 'C003', name: 'Jane Smith', email: 'jane@example.com', phone: '+91 98765 67890', city: 'Bangalore', orders: 1, spent: '₹2,500', tags: ['New'] },
  { id: 'C004', name: 'TechStart Inc', email: 'hello@techstart.io', phone: '+91 98765 09876', city: 'Pune', orders: 5, spent: '₹89,000', tags: ['B2B', 'Frequent'] },
];

export default function CustomersPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your customer relationships.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Customer
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic View Area */}
      <div className={`bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden ${viewMode === 'grid' ? 'p-6 bg-gray-50/50' : ''}`}>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockCustomers.map((cust) => (
              <div key={cust.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                    {cust.name.charAt(0)}
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                    {cust.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wide">{tag}</span>
                    ))}
                  </div>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg">{cust.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{cust.city}</p>
                
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" /> <span className="truncate">{cust.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" /> <span>{cust.phone}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-medium uppercase">Orders</span>
                    <span className="font-bold text-gray-900">{cust.orders}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 font-medium uppercase">Spent</span>
                    <span className="font-bold text-[#CD2C58]">{cust.spent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">City</th>
                  <th className="px-6 py-4 text-right">Orders</th>
                  <th className="px-6 py-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {cust.name.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900">{cust.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{cust.email}</td>
                    <td className="px-6 py-4 text-gray-600">{cust.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{cust.city}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 text-right">{cust.orders}</td>
                    <td className="px-6 py-4 font-bold text-[#CD2C58] text-right">{cust.spent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
