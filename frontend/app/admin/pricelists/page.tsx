"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Loader2, CheckCircle2, AlertCircle, Tag, ChevronDown, ChevronUp, DollarSign, Layers, Calendar } from 'lucide-react';
import { pricelistApi, productApi } from '@/lib/api';

export default function PricelistsPage() {
  const [pricelists, setPricelists] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [showPricelistModal, setShowPricelistModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState<string | null>(null); // pricelistId
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Unified Pricelist & Initial Rule Form State
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [includeRule, setIncludeRule] = useState(true);
  const [productId, setProductId] = useState('');
  const [minQuantity, setMinQuantity] = useState(1);
  const [ruleType, setRuleType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [fixedPrice, setFixedPrice] = useState(500);

  // Separate Rule Modal State
  const [ruleProductId, setRuleProductId] = useState('');
  const [ruleMinQuantity, setRuleMinQuantity] = useState(1);
  const [ruleRuleType, setRuleRuleType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [ruleDiscountPercentage, setRuleDiscountPercentage] = useState(10);
  const [ruleFixedPrice, setRuleFixedPrice] = useState(500);

  const fetchData = async () => {
    setLoading(true);
    const [pRes, prodRes] = await Promise.all([
      pricelistApi.getPricelists(),
      productApi.getAll(),
    ]);
    setLoading(false);
    if (pRes.success && Array.isArray(pRes.data)) {
      setPricelists(pRes.data);
    }
    if (prodRes.success && Array.isArray(prodRes.data)) {
      setProducts(prodRes.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateFullPricelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setMessage(null);
    // 1. Create Pricelist container
    const res = await pricelistApi.createPricelist({ name: name.trim(), currency });
    if (res.success && res.data) {
      const newId = res.data.id;

      // 2. Attach initial rule if requested
      if (includeRule) {
        const rulePayload = {
          product_id: productId || null,
          min_quantity: Number(minQuantity) || 1,
          rule_type: ruleType,
          discount_percentage: ruleType === 'PERCENT' ? Number(discountPercentage) : 0,
          fixed_price: ruleType === 'FIXED' ? Number(fixedPrice) : 0,
        };
        await pricelistApi.addRule(newId, rulePayload).catch(console.error);
      }

      setMessage({ type: 'success', text: 'Pricelist & Pricing Rule created successfully!' });
      setShowPricelistModal(false);
      setName('');
      setExpandedId(newId);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to create pricelist' });
    }
  };

  const handleDeletePricelist = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricelist?')) return;
    const res = await pricelistApi.deletePricelist(id);
    if (res.success) {
      setMessage({ type: 'success', text: 'Pricelist deleted successfully.' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Delete failed.' });
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRuleModal) return;

    const payload = {
      product_id: ruleProductId || null,
      min_quantity: Number(ruleMinQuantity),
      rule_type: ruleRuleType,
      discount_percentage: ruleRuleType === 'PERCENT' ? Number(ruleDiscountPercentage) : 0,
      fixed_price: ruleRuleType === 'FIXED' ? Number(ruleFixedPrice) : 0,
    };

    setMessage(null);
    const res = await pricelistApi.addRule(showRuleModal, payload);
    if (res.success) {
      setMessage({ type: 'success', text: 'Pricing Rule added to pricelist!' });
      setShowRuleModal(null);
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to add rule' });
    }
  };

  const handleDeleteRule = async (pricelistId: string, ruleId: string) => {
    const res = await pricelistApi.deleteRule(pricelistId, ruleId);
    if (res.success) {
      setMessage({ type: 'success', text: 'Rule deleted!' });
      fetchData();
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to delete rule' });
    }
  };

  const filteredLists = pricelists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto min-h-[calc(100vh-3.5rem)] font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Pricelists & Dynamic Rules</h1>
          <p className="text-sm text-gray-500 mt-1">Configure volume pricing rules, promotional discounts, and custom rental rates.</p>
        </div>
        
        <button 
          onClick={() => setShowPricelistModal(true)}
          className="px-5 py-2.5 bg-[#CD2C58] text-white font-bold rounded-xl shadow-md hover:bg-[#b02248] flex items-center gap-2 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Create New Pricelist
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-t-2xl border border-gray-200 border-b-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pricelists by name..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58]"
          />
        </div>
      </div>

      {/* Table & Rules List */}
      <div className="bg-white rounded-b-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-3" />
            <span className="text-sm font-semibold">Loading vendor pricelists & rules...</span>
          </div>
        ) : filteredLists.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-bold text-gray-700">No pricelists found</p>
            <p className="text-xs text-gray-400 mt-1">Click 'Create New Pricelist' to set up pricing rules or discounts.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredLists.map((list) => {
              const isExpanded = expandedId === list.id;
              const ruleCount = list.rules?.length || 0;

              return (
                <div key={list.id} className="transition-colors">
                  <div className="p-5 flex items-center justify-between hover:bg-gray-50/60">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : list.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-[#CD2C58]" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

                      <div>
                        <div className="font-bold text-gray-900 text-base flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#CD2C58]" />
                          {list.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                          <span className="font-semibold text-gray-700">Currency: {list.currency}</span>
                          <span>•</span>
                          <span className="text-gray-600">{ruleCount} {ruleCount === 1 ? 'Rule' : 'Rules'} configured</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                        {list.status || 'ACTIVE'}
                      </span>
                      <button
                        onClick={() => {
                          setShowRuleModal(list.id);
                          setExpandedId(list.id);
                        }}
                        className="px-3.5 py-1.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl hover:bg-gray-200 flex items-center gap-1.5 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Rule
                      </button>
                      <button 
                        onClick={() => handleDeletePricelist(list.id)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-xl hover:bg-red-50 transition-colors"
                        title="Delete Pricelist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Rules View */}
                  {isExpanded && (
                    <div className="bg-gray-50/80 p-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-xs uppercase tracking-wider text-gray-600">
                          Configured Rules for {list.name}
                        </div>
                        <button
                          onClick={() => setShowRuleModal(list.id)}
                          className="text-xs font-bold text-[#CD2C58] hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add another rule
                        </button>
                      </div>

                      {ruleCount === 0 ? (
                        <div className="text-xs text-gray-500 italic p-4 bg-white rounded-xl border border-gray-200 flex items-center justify-between">
                          <span>No pricing rules added yet for this pricelist.</span>
                          <button
                            onClick={() => setShowRuleModal(list.id)}
                            className="px-3 py-1 bg-[#CD2C58] text-white rounded-lg text-xs font-bold hover:bg-[#b02248]"
                          >
                            + Add Rule Now
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-gray-100/80 text-gray-700 font-bold border-b border-gray-200">
                              <tr>
                                <th className="px-4 py-3">Applied Product</th>
                                <th className="px-4 py-3">Min Quantity</th>
                                <th className="px-4 py-3">Rule Type</th>
                                <th className="px-4 py-3 text-right">Price / Discount</th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {list.rules.map((rule: any) => (
                                <tr key={rule.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 font-bold text-gray-900">
                                    {rule.product ? rule.product.name : '🌐 All Products (Global)'}
                                  </td>
                                  <td className="px-4 py-3 font-semibold text-gray-700">{rule.min_quantity} {rule.min_quantity === 1 ? 'unit' : 'units'}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black ${rule.rule_type === 'PERCENT' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                      {rule.rule_type === 'PERCENT' ? 'Percentage Discount' : 'Fixed Rate'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 font-black text-[#CD2C58] text-base text-right">
                                    {rule.rule_type === 'PERCENT' ? `${rule.discount_percentage}% OFF` : `₹${Number(rule.fixed_price).toFixed(2)}`}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => handleDeleteRule(list.id, rule.id)}
                                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                                      title="Delete rule"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Unified "Create New Pricelist & Rule" Modal */}
      {showPricelistModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Create New Pricelist</h3>
            <p className="text-xs text-gray-500 mb-5">Define a pricelist name, currency, and initial pricing rule all in one place.</p>
            
            <form onSubmit={handleCreateFullPricelist} className="space-y-5">
              
              {/* Pricelist Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pricelist Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bulk Rental Offer 15% Off"
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-semibold focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Currency</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-[#CD2C58]/20 focus:border-[#CD2C58] outline-none bg-white"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              {/* Toggle Initial Rule */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-gray-900 flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={includeRule}
                      onChange={(e) => setIncludeRule(e.target.checked)}
                      className="accent-[#CD2C58] w-4 h-4 rounded"
                    />
                    Add Pricing / Discount Rule Now
                  </label>
                  <span className="text-xs text-gray-400">Step 2</span>
                </div>

                {includeRule && (
                  <div className="space-y-4 pt-2 border-t border-gray-200">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Apply To Product</label>
                      <select 
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl p-2 text-xs font-semibold focus:ring-1 focus:ring-[#CD2C58] bg-white outline-none"
                      >
                        <option value="">🌐 All Products (Global Rule)</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Rule Type</label>
                        <select 
                          value={ruleType}
                          onChange={(e) => setRuleType(e.target.value as any)}
                          className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-[#CD2C58] bg-white outline-none"
                        >
                          <option value="PERCENT">Percentage Discount (%)</option>
                          <option value="FIXED">Fixed Rate (₹)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Min Quantity Tier</label>
                        <input 
                          type="number"
                          min="1"
                          value={minQuantity}
                          onChange={(e) => setMinQuantity(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold focus:ring-1 focus:ring-[#CD2C58] outline-none"
                          required
                        />
                      </div>
                    </div>

                    {ruleType === 'PERCENT' ? (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Discount Percentage (%)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            min="1"
                            max="100"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-xl p-2 text-sm font-black text-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] outline-none pr-8"
                            required
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Fixed Rate Amount (₹)</label>
                        <div className="relative">
                          <input 
                            type="number"
                            min="0"
                            value={fixedPrice}
                            onChange={(e) => setFixedPrice(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-xl p-2 text-sm font-black text-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] outline-none pl-7"
                            required
                          />
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowPricelistModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#CD2C58] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#b02248] transition-colors"
                >
                  Save Pricelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Add Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Add Pricing Rule</h3>
            <p className="text-xs text-gray-500 mb-4">Add a new discount tier or fixed price to this pricelist.</p>
            
            <form onSubmit={handleAddRule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Apply To Product</label>
                <select 
                  value={ruleProductId}
                  onChange={(e) => setRuleProductId(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2 text-xs font-semibold focus:ring-1 focus:ring-[#CD2C58] bg-white outline-none"
                >
                  <option value="">🌐 All Products (Global Rule)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Rule Type</label>
                  <select 
                    value={ruleRuleType}
                    onChange={(e) => setRuleRuleType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold text-gray-900 focus:ring-1 focus:ring-[#CD2C58] bg-white outline-none"
                  >
                    <option value="PERCENT">Percentage Discount (%)</option>
                    <option value="FIXED">Fixed Rate (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Min Quantity Tier</label>
                  <input 
                    type="number"
                    min="1"
                    value={ruleMinQuantity}
                    onChange={(e) => setRuleMinQuantity(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-xl p-2 text-xs font-bold focus:ring-1 focus:ring-[#CD2C58] outline-none"
                    required
                  />
                </div>
              </div>

              {ruleRuleType === 'PERCENT' ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Discount Percentage (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="1"
                      max="100"
                      value={ruleDiscountPercentage}
                      onChange={(e) => setRuleDiscountPercentage(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl p-2 text-sm font-black text-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] outline-none pr-8"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">%</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fixed Rate Amount (₹)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min="0"
                      value={ruleFixedPrice}
                      onChange={(e) => setRuleFixedPrice(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl p-2 text-sm font-black text-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] outline-none pl-7"
                      required
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">₹</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setShowRuleModal(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-[#CD2C58] text-white rounded-xl text-sm font-bold shadow-md hover:bg-[#b02248] transition-colors"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
