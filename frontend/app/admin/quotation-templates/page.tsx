"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Loader2, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { quotationTemplateApi, productApi } from '@/lib/api';

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [note, setNote] = useState('Default Rental Quotation Terms & Conditions');
  const [items, setItems] = useState<Array<{ product_id: string; product_name: string; quantity: number; discount_pct: number }>>([]);

  const fetchData = async () => {
    setLoading(true);
    const [tRes, pRes] = await Promise.all([
      quotationTemplateApi.getTemplates(),
      productApi.getAll(),
    ]);
    setLoading(false);
    if (tRes.success && Array.isArray(tRes.data)) {
      setTemplates(tRes.data);
    }
    if (pRes.success && Array.isArray(pRes.data)) {
      setProducts(pRes.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setValidityDays(30);
    setNote('Default Rental Quotation Terms & Conditions');
    setItems([]);
    setShowModal(true);
  };

  const openEditModal = (t: any) => {
    setEditingId(t.id);
    setName(t.name || '');
    setValidityDays(t.validity_days || 30);
    setNote(t.note || '');
    setItems(Array.isArray(t.items) ? t.items : []);
    setShowModal(true);
  };

  const addItemLine = () => {
    if (products.length === 0) return;
    const p = products[0];
    setItems([...items, { product_id: p.id, product_name: p.name, quantity: 1, discount_pct: 0 }]);
  };

  const removeItemLine = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = [...items];
    updated[index].product_id = prod.id;
    updated[index].product_name = prod.name;
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      validity_days: Number(validityDays),
      note,
      items,
    };

    setMessage(null);
    let res;
    if (editingId) {
      res = await quotationTemplateApi.updateTemplate(editingId, payload);
    } else {
      res = await quotationTemplateApi.createTemplate(payload);
    }

    if (res.success) {
      setMessage({ type: 'success', text: `Quotation Template ${editingId ? 'updated' : 'created'} successfully!` });
      setShowModal(false);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Action failed' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    const res = await quotationTemplateApi.deleteTemplate(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Quotation template deleted successfully.' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Delete failed.' });
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotation Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Design and manage pre-configured rental quotation templates.</p>
        </div>

        <button 
          onClick={openCreateModal}
          className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> New Quotation Template
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 flex flex-col items-center justify-center shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-2" />
          Loading quotation templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
          No quotation templates found. Click 'New Quotation Template' to create your first template.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#CD2C58]" /> {tpl.name}
                  </span>
                  <span className="bg-purple-50 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {tpl.validity_days} Days Valid
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{tpl.note || 'No custom notes'}</p>

                <div className="border-t border-gray-100 pt-3 mb-4">
                  <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Pre-populated Items ({tpl.items?.length || 0})</div>
                  <div className="space-y-1 max-h-28 overflow-y-auto">
                    {tpl.items && tpl.items.length > 0 ? (
                      tpl.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-1.5 bg-gray-50 rounded">
                          <span className="font-medium text-gray-800">{item.product_name}</span>
                          <span className="font-bold text-gray-600">Qty: {item.quantity} {item.discount_pct ? `(${item.discount_pct}% OFF)` : ''}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No line items</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <button onClick={() => openEditModal(tpl)} className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-md hover:bg-gray-200">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(tpl.id)} className="p-2 text-red-600 hover:text-red-800 bg-red-50 rounded-md hover:bg-red-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{editingId ? 'Edit Quotation Template' : 'Create Quotation Template'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Template Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Sound Equipment Quotation" 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Validity (Days)</label>
                <input 
                  type="number" 
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Default Note & Terms</label>
                <textarea 
                  rows={3} 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">Pre-loaded Product Items</label>
                  <button 
                    type="button" 
                    onClick={addItemLine}
                    className="text-xs font-bold text-[#CD2C58] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                      <select
                        value={item.product_id}
                        onChange={(e) => handleProductChange(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded text-xs p-1.5 bg-white"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[index].quantity = Number(e.target.value);
                          setItems(updated);
                        }}
                        placeholder="Qty"
                        className="w-16 border border-gray-300 rounded text-xs p-1.5 bg-white text-center"
                      />
                      <button
                        type="button"
                        onClick={() => removeItemLine(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-[#CD2C58] text-white rounded-md text-sm font-medium hover:bg-[#b02248]"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
