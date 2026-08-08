"use client";

import React from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, Download, MoreVertical } from 'lucide-react';

const mockInvoices = [
  { id: 'INV/2026/08/0001', customer: 'John Doe', date: '2026-08-09', total: '₹4,500', status: 'Posted', payment: 'Paid' },
  { id: 'INV/2026/08/0002', customer: 'Acme Corp', date: '2026-08-01', total: '₹12,000', status: 'Draft', payment: 'Not Paid' },
  { id: 'INV/2026/08/0003', customer: 'Jane Smith', date: '2026-07-20', total: '₹2,500', status: 'Posted', payment: 'In Payment' },
];

export default function InvoicesPage() {
  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing and payments.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/admin/orders/new" className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Invoice
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search invoices..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></th>
                <th className="px-6 py-4">Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Invoice Date</th>
                <th className="px-6 py-4 text-right">Total in Currency</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></td>
                  <td className="px-6 py-4 font-bold text-[#CD2C58]">{inv.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{inv.customer}</td>
                  <td className="px-6 py-4 text-gray-600">{inv.date}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900 text-right">{inv.total}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                      ${inv.status === 'Draft' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'}
                    `}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider
                      ${inv.payment === 'Paid' ? 'bg-emerald-100 text-emerald-700' : ''}
                      ${inv.payment === 'Not Paid' ? 'bg-red-100 text-red-700' : ''}
                      ${inv.payment === 'In Payment' ? 'bg-blue-100 text-blue-700' : ''}
                    `}>
                      {inv.payment}
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
      </div>
    </div>
  );
}
