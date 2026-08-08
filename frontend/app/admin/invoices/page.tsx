"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Download, Loader2 } from 'lucide-react';
import { orderApi } from '@/lib/api';

export default function InvoicesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      const res = await orderApi.getOrders();
      setLoading(false);
      if (res.success && Array.isArray(res.data)) {
        setOrders(res.data);
      }
    };
    fetchInvoices();
  }, []);

  const filteredInvoices = orders.filter((inv) => {
    const q = search.toLowerCase();
    return inv.id?.toLowerCase().includes(q) || inv.order_number?.toLowerCase().includes(q) || inv.status?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Live order invoices generated from PostgreSQL database.</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice ID or status..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Fetching invoice records...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No invoices found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Invoice / Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4">Order Status</th>
                  <th className="px-6 py-4">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => {
                  const invNum = inv.order_number || (inv.id ? `INV-${inv.id.slice(0, 8).toUpperCase()}` : 'INV');
                  const invDate = new Date(inv.created_at || inv.createdAt || Date.now()).toLocaleDateString();
                  const amount = Number(inv.subtotal || inv.total_amount || 0);

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#CD2C58]">{invNum}</td>
                      <td className="px-6 py-4 text-gray-600">{invDate}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-right">₹{amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${inv.status === 'CONFIRMED' || inv.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {inv.status === 'CONFIRMED' || inv.status === 'COMPLETED' ? 'PAID' : 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
