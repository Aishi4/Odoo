"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, Package, Calendar, CreditCard, ChevronRight, X, CheckCircle2, AlertCircle, FileText, XCircle } from 'lucide-react';
import { orderApi } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'SENT' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await orderApi.getOrders();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setOrders(res.data);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleAcceptQuotation = async (orderId: string) => {
    setActionLoadingId(orderId);
    setMessage(null);
    try {
      const res = await orderApi.acceptQuotation(orderId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Quotation accepted! Your rental order is officially confirmed.' });
        setSelectedOrder(null);
        fetchOrders();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to accept quotation.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectQuotation = async (orderId: string) => {
    setActionLoadingId(orderId);
    setMessage(null);
    try {
      const res = await orderApi.rejectQuotation(orderId);
      if (res.success) {
        setMessage({ type: 'success', text: 'Quotation proposal declined.' });
        setSelectedOrder(null);
        fetchOrders();
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to decline quotation.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingQuotations = orders.filter(o => o.status === 'SENT' || o.status === 'DRAFT');

  const filteredOrders = orders.filter((order) => {
    if (filter === 'ALL') return true;
    if (filter === 'SENT') return order.status === 'SENT' || order.status === 'DRAFT';
    return order.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 min-h-[calc(100vh-5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Customer Portal — My Rentals</h1>
          <p className="text-sm text-gray-500 mt-1">Review quotation proposals, accept rental orders online, and inspect active equipment rentals.</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Pending Quotations Alert Banner */}
      {pendingQuotations.length > 0 && filter !== 'SENT' && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 text-base">You have {pendingQuotations.length} Quotation Proposal(s) Pending Action!</h3>
              <p className="text-xs text-amber-700 mt-0.5">Please review and accept your quotation proposal to confirm your equipment reservation dates.</p>
            </div>
          </div>
          <button 
            onClick={() => setFilter('SENT')}
            className="px-4 py-2 bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-amber-700 transition-colors whitespace-nowrap"
          >
            View Quotations ({pendingQuotations.length})
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex gap-3 flex-wrap">
          {(['ALL', 'SENT', 'CONFIRMED', 'ACTIVE', 'COMPLETED'] as const).map((status) => (
            <button 
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                filter === status ? 'bg-[#CD2C58] text-white shadow-sm' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status === 'SENT' ? `Quotations Pending (${pendingQuotations.length})` : status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Fetching your rental orders...
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
              const isQuotation = order.status === 'SENT' || order.status === 'DRAFT';

              return (
                <div key={order.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 text-base flex items-center gap-2">
                        {isQuotation && <FileText className="w-4 h-4 text-amber-500" />}
                        Order #{orderNum}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        order.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                        isQuotation ? 'bg-amber-100 text-amber-800 animate-pulse' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {isQuotation ? 'QUOTATION PROPOSAL' : order.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Period: {order.start_date || orderDate} to {order.end_date || 'N/A'}</span>
                      <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> Total Rate: ₹{amount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    {isQuotation && (
                      <div className="flex items-center gap-2">
                        <button
                          disabled={actionLoadingId === order.id}
                          onClick={() => handleAcceptQuotation(order.id)}
                          className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                        >
                          {actionLoadingId === order.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Accept Proposal
                        </button>
                        <button
                          disabled={actionLoadingId === order.id}
                          onClick={() => handleRejectQuotation(order.id)}
                          className="px-3 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-red-500" /> Decline
                        </button>
                      </div>
                    )}

                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-bold text-[#CD2C58] hover:underline flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Inspect <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</h3>
                <span className="text-xs text-gray-500">Placed on {new Date(selectedOrder.created_at || selectedOrder.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm mb-6 max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                <div>
                  <span className="text-xs text-gray-500 block">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedOrder.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                    selectedOrder.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                    (selectedOrder.status === 'SENT' || selectedOrder.status === 'DRAFT') ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Total Quotation Rate</span>
                  <span className="font-black text-[#CD2C58] text-base">₹{Number(selectedOrder.subtotal || selectedOrder.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Rented Items List */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-xs uppercase tracking-wider">Rented Equipment Items</h4>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="space-y-2.5">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={item.id || idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center">
                        <div>
                          <div className="font-bold text-gray-900 text-sm">{item.product_name || item.product?.name || 'Equipment Item'}</div>
                          <div className="text-xs text-[#CD2C58] font-semibold mt-0.5">
                            {item.start_date && item.end_date ? `${item.start_date} to ${item.end_date}` : 'Rental Period Active'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity || 1}</div>
                        </div>
                        <div className="text-right font-black text-gray-900">
                          ₹{Number(item.total_price || item.unit_price || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 rounded-xl border border-gray-200">
                    Standard Rental Equipment Item
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              {(selectedOrder.status === 'SENT' || selectedOrder.status === 'DRAFT') ? (
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptQuotation(selectedOrder.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Proposal
                  </button>
                  <button 
                    onClick={() => handleRejectQuotation(selectedOrder.id)}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              ) : <div />}

              <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
