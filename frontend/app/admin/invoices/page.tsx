"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, FileText, Send, DollarSign, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { invoiceApi } from '@/lib/api';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [postingId, setPostingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('ONLINE');
  const [registeringPayment, setRegisteringPayment] = useState(false);

  // Deposit Refund Modal State
  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(100);
  const [refundNote, setRefundNote] = useState<string>('Deposit returned in full');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    const res = await invoiceApi.getInvoices();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setInvoices(res.data);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePostInvoice = async (invoiceId: string) => {
    setPostingId(invoiceId);
    setMessage(null);
    const res = await invoiceApi.postInvoice(invoiceId);
    setPostingId(null);
    if (res.success) {
      setMessage({ type: 'success', text: 'Invoice posted successfully.' });
      fetchInvoices();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to post invoice.' });
    }
  };

  const handleOpenPaymentModal = (inv: any) => {
    const totalAmount = Number(inv.amount || 0);
    const amountPaid = Number(inv.amount_paid || 0);
    const remaining = Math.max(0, totalAmount - amountPaid);

    setSelectedInvoice(inv);
    setPaymentAmount(remaining > 0 ? remaining : totalAmount);
    setPaymentMethod('ONLINE');
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoice) return;
    setRegisteringPayment(true);
    setMessage(null);

    try {
      const res = await invoiceApi.registerPayment(selectedInvoice.id, Number(paymentAmount), paymentMethod);
      if (res.success) {
        setMessage({ type: 'success', text: `Payment of ₹${paymentAmount} registered successfully!` });
        setSelectedInvoice(null);
        fetchInvoices();
        setTimeout(() => setMessage(null), 3500);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to register payment.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred.' });
    } finally {
      setRegisteringPayment(false);
    }
  };

  const handleSubmitDepositRefund = async () => {
    if (!refundModalOrder) return;
    setProcessingRefund(true);

    try {
      const res = await invoiceApi.refundDeposit(refundModalOrder.id, Number(refundAmount), refundNote);
      if (res.success) {
        setMessage({ type: 'success', text: `Security deposit of ₹${refundAmount} refunded successfully!` });
        setRefundModalOrder(null);
        fetchInvoices();
        setTimeout(() => setMessage(null), 3500);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to process deposit refund.' });
      }
    } catch (e: any) {
      setMessage({ type: 'error', text: e.message || 'An error occurred.' });
    } finally {
      setProcessingRefund(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const invNum = (inv.invoice_number || inv.id || '').toLowerCase();
    const orderNum = (inv.order?.order_number || inv.order_id || '').toLowerCase();
    const custName = (inv.customer?.name || '').toLowerCase();
    const status = (inv.status || '').toLowerCase();
    const payStatus = (inv.payment_status || '').toLowerCase();
    return invNum.includes(q) || orderNum.includes(q) || custName.includes(q) || status.includes(q) || payStatus.includes(q);
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoices & Financial Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage billing, register partial/full payments, and process security deposit refunds.</p>
        </div>

        <button 
          onClick={fetchInvoices}
          className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice #, order #, customer, or payment status..." 
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
            No invoices found. Create an invoice from the Orders page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-right">Total Amount</th>
                  <th className="px-6 py-4 text-right">Amount Paid</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((inv) => {
                  const invNum = inv.invoice_number || `INV-${inv.id.slice(0, 8).toUpperCase()}`;
                  const orderNum = inv.order?.order_number || `#${(inv.order_id || '').slice(0, 8)}`;
                  const custName = inv.customer?.name || 'Customer';
                  const dueDate = inv.due_date || 'N/A';
                  const totalAmount = Number(inv.amount || 0);
                  const amountPaid = Number(inv.amount_paid || 0);
                  const remaining = Math.max(0, totalAmount - amountPaid);

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-[#CD2C58] flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        {invNum}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-700">{orderNum}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{custName}</td>
                      <td className="px-6 py-4 text-gray-600 text-xs">{dueDate}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-right">₹{totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 text-right">
                        ₹{amountPaid.toFixed(2)}
                        {remaining > 0 && amountPaid > 0 && (
                          <span className="block text-[10px] text-amber-600 font-semibold">Bal: ₹{remaining.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          inv.status === 'POSTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          inv.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          inv.payment_status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        {inv.status === 'DRAFT' && (
                          <button
                            disabled={postingId === inv.id}
                            onClick={() => handlePostInvoice(inv.id)}
                            className="px-3 py-1.5 bg-[#CD2C58] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#b02248] transition-colors flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" /> Post
                          </button>
                        )}

                        {inv.payment_status !== 'PAID' && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                          >
                            <DollarSign className="w-3.5 h-3.5" /> Register Payment
                          </button>
                        )}

                        <button
                          onClick={() => setRefundModalOrder({ id: inv.order_id, number: orderNum })}
                          className="px-2.5 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
                          title="Refund Security Deposit"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Deposit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Payment Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Register Invoice Payment</h3>
                <p className="text-xs text-gray-500">Invoice: {selectedInvoice.invoice_number}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500 block">Total Amount: ₹{Number(selectedInvoice.amount || 0).toFixed(2)}</span>
                  <span className="text-gray-500 block">Paid So Far: ₹{Number(selectedInvoice.amount_paid || 0).toFixed(2)}</span>
                </div>
                <div className="text-right font-bold text-amber-700 text-sm">
                  Remaining: ₹{Math.max(0, Number(selectedInvoice.amount || 0) - Number(selectedInvoice.amount_paid || 0)).toFixed(2)}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Payment Amount (₹)</label>
                <input 
                  type="number"
                  min="1"
                  max={Number(selectedInvoice.amount || 0)}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
                >
                  <option value="ONLINE">Online Payment (Card/UPI)</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setSelectedInvoice(null)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                disabled={registeringPayment}
                onClick={handleSubmitPayment}
                className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-emerald-700 flex items-center gap-2"
              >
                {registeringPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />} Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Deposit Refund Modal */}
      {refundModalOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Security Deposit Refund</h3>
                <p className="text-xs text-gray-500">Order: {refundModalOrder.number}</p>
              </div>
              <button onClick={() => setRefundModalOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Refund Amount (₹)</label>
                <input 
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-1">Inspection Note / Reason</label>
                <textarea 
                  rows={3}
                  value={refundNote}
                  onChange={(e) => setRefundNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => setRefundModalOrder(null)} 
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button 
                disabled={processingRefund}
                onClick={handleSubmitDepositRefund}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2"
              >
                {processingRefund ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />} Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
