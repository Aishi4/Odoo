"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

export default function AttributesPage() {
  const [attributes, setAttributes] = useState<Array<{ id: string; name: string; values: string; type: string }>>([]);
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [values, setValues] = useState('');
  const [type, setType] = useState('Select');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const key = user?.id ? `vendor_attributes_${user.id}` : 'vendor_attributes';
      const saved = localStorage.getItem(key);
      if (saved) {
        setAttributes(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToStorage = (updated: Array<{ id: string; name: string; values: string; type: string }>) => {
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      const key = user?.id ? `vendor_attributes_${user.id}` : 'vendor_attributes';
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAttr = {
      id: Date.now().toString(),
      name: name.trim(),
      values: values.trim() || 'Default Option',
      type,
    };

    const updated = [...attributes, newAttr];
    setAttributes(updated);
    saveToStorage(updated);
    setName('');
    setValues('');
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = attributes.filter((a) => a.id !== id);
    setAttributes(updated);
    saveToStorage(updated);
  };

  const filteredAttributes = attributes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Attributes & Variants</h1>
          <p className="text-sm text-gray-500 mt-1">Manage custom attributes for your products.</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add New Attribute
        </button>
      </div>

      <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attributes..." 
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
          />
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        {filteredAttributes.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No attributes found. Click 'Add New Attribute' to create one for your store.</div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Attribute Name</th>
                <th className="px-6 py-4">Values</th>
                <th className="px-6 py-4">Display Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{attr.name}</td>
                  <td className="px-6 py-4 text-gray-600 truncate max-w-md">{attr.values}</td>
                  <td className="px-6 py-4 text-gray-500">{attr.type}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(attr.id)} className="text-red-500 hover:text-red-700">
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Product Attribute</h3>
            <form onSubmit={handleAddAttribute} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Attribute Name</label>
                <input 
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Color, Size, Storage"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Values (comma separated)</label>
                <input 
                  type="text"
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                  placeholder="Red, Blue, Green"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Display Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#CD2C58]"
                >
                  <option value="Select">Select Dropdown</option>
                  <option value="Radio">Radio Button</option>
                  <option value="Color">Color Swatch</option>
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
                  Save Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
