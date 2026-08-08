"use client";

import React, { useState } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

export default function PricelistsPage() {
  const [pricelists, setPricelists] = useState<Array<{ id: string; name: string; currency: string; active: boolean }>>([
    { id: '1', name: 'Standard Public Pricelist (INR)', currency: 'INR', active: true },
    { id: '2', name: 'B2B Wholesale Discount List', currency: 'INR', active: true },
  ]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [showModal, setShowModal] = useState(false);

  const handleAddPricelist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newList = {
      id: Date.now().toString(),
      name: name.trim(),
      currency,
      active: true,
    };

    setPricelists([...pricelists, newList]);
    setName('');
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setPricelists(pricelists.filter((p) => p.id !== id));
  };

  const filteredLists = pricelists.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pricelists & Discounts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage pricing rules and customer price tiers.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> New Pricelist
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search pricelists..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
          />
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredLists.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No pricelists found. Click 'New Pricelist' to add one.</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Pricelist Name</th>
                <th className="px-6 py-4">Currency</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLists.map((list) => (
                <tr key={list.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{list.name}</td>
                  <td className="px-6 py-4 text-gray-600">{list.currency}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                      ACTIVE
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(list.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Pricelist</h3>
            <form onSubmit={handleAddPricelist} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Pricelist Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. VIP Corporate Discount List"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
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
                  Save Pricelist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
