"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, Loader2, X, Tag } from 'lucide-react';
import { rentalPeriodApi } from '@/lib/api';

export default function RentalPeriodsPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<any | null>(null);

  const [name, setName] = useState('');
  const [duration, setDuration] = useState('1');
  const [unit, setUnit] = useState('DAY');
  const [discountPercent, setDiscountPercent] = useState('0');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchPeriods = async () => {
    setLoading(true);
    const res = await rentalPeriodApi.getAll();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setPeriods(res.data);
    }
  };

  useEffect(() => { fetchPeriods(); }, []);

  const handleOpenModal = (period: any = null) => {
    setMessage(null);
    if (period) {
      setEditingPeriod(period);
      setName(period.name || '');
      setDuration(String(period.duration || 1));
      setUnit(period.unit || 'DAY');
      setDiscountPercent(String(period.discount_percent ?? 0));
    } else {
      setEditingPeriod(null);
      setName('');
      setDuration('1');
      setUnit('DAY');
      setDiscountPercent('0');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Period name is required.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const payload = {
      name: name.trim(),
      duration: Number(duration),
      unit,
      discount_percent: Number(discountPercent),
    };

    const res = editingPeriod
      ? await rentalPeriodApi.update(editingPeriod.id, payload)
      : await rentalPeriodApi.create(payload);

    setSubmitting(false);

    if (res.success) {
      setMessage({ type: 'success', text: `Rental period ${editingPeriod ? 'updated' : 'created'} successfully!` });
      setIsModalOpen(false);
      fetchPeriods();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to save rental period.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rental period? This cannot be undone.')) return;
    const res = await rentalPeriodApi.delete(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Rental period deleted.' });
      fetchPeriods();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to delete rental period.' });
    }
  };

  const unitLabel: Record<string, string> = {
    HOUR: 'Hour(s)', DAY: 'Day(s)', WEEK: 'Week(s)', MONTH: 'Month(s)',
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)] space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-[#CD2C58] rounded-full text-xs font-bold mb-2">
            <Clock className="w-3.5 h-3.5" /> Product Rental Term Configurations
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rental Periods & Discount Rules</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure your own rental duration options (Hours, Days, Weeks, Months) and built-in discounts.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-3 bg-[#CD2C58] hover:bg-[#b02248] text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-[#CD2C58]/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Rental Period
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center justify-between shadow-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              : <AlertCircle className="w-5 h-5 text-red-600" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="p-1 hover:bg-black/5 rounded-full">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
            Loading rental period configurations...
          </div>
        ) : periods.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700">No rental periods configured</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Rental Period" to create your first duration option.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Period Name</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Built-in Discount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Scope</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {periods.map((period) => {
                const isGlobal = !period.vendor_id;
                return (
                  <tr key={period.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{period.name}</td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{period.duration}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-800 font-bold rounded-lg uppercase text-[10px]">
                        {unitLabel[period.unit] || period.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-[#CD2C58]">
                      {Number(period.discount_percent || 0).toFixed(0)}% Off
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        period.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isGlobal
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        <Tag className="w-3 h-3" />
                        {isGlobal ? 'Platform Default' : 'My Custom'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {!isGlobal && (
                        <>
                          <button
                            onClick={() => handleOpenModal(period)}
                            className="p-2 text-gray-600 hover:text-[#CD2C58] hover:bg-pink-50 rounded-lg transition-colors"
                            title="Edit Period"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(period.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Period"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {isGlobal && (
                        <span className="text-[10px] text-gray-400 italic pr-2">Read-only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPeriod ? 'Edit Rental Period' : 'Create Rental Period'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Period Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weekly Rental / Weekend Special"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duration *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Unit *</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58] bg-white"
                  >
                    <option value="HOUR">HOUR</option>
                    <option value="DAY">DAY</option>
                    <option value="WEEK">WEEK</option>
                    <option value="MONTH">MONTH</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Built-in Discount (%) <span className="text-gray-400 font-normal">— applied when customer selects this period</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-black text-[#CD2C58] focus:outline-none focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58] pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  e.g. 10% off for weekly rentals, 25% off for monthly — encourages longer bookings.
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#CD2C58] text-white text-sm font-bold rounded-xl hover:bg-[#b02248] transition-all flex items-center gap-2 shadow-md shadow-[#CD2C58]/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Period Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
