"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { catalogApi } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('25.00');
  const [securityDeposit, setSecurityDeposit] = useState('100.00');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80');
  const [category, setCategory] = useState('Furniture');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Product name is required.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const res = await catalogApi.createProduct({
      name,
      description: description || 'Premium equipment for rental',
      base_price: parseFloat(basePrice) || 25,
      security_deposit: parseFloat(securityDeposit) || 100,
      image_url: imageUrl,
      category,
      is_active: true,
    });

    setLoading(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Product created successfully in database!' });
      setTimeout(() => router.push('/admin/products'), 1200);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to save product.' });
    }
  };

  return (
    <form onSubmit={handleSave} className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex flex-col">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Product</h1>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Catalog Management</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors text-sm">
            Discard
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors text-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Product
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{message.text}</span>
          </div>
        )}
        
        {/* Name and Image Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shrink-0 overflow-hidden relative">
            {imageUrl ? (
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon className="w-8 h-8 mb-2" />
                <span className="text-xs font-medium">Add Image</span>
              </>
            )}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Premium Executive Office Chair" 
                className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-[#CD2C58] focus:ring-0 px-0 py-2 bg-transparent text-gray-900 placeholder-gray-300"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Image URL</label>
              <input 
                type="url" 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-[#CD2C58]"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Detailed Form Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-2 bg-gray-50/50">
            <button 
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-[#CD2C58] text-[#CD2C58]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              General Information
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('rental')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'rental' ? 'border-[#CD2C58] text-[#CD2C58]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Rental Pricing
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Photography">Photography</option>
                      <option value="Office">Office Equipment</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Product specifications and features..."
                    className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]"
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === 'rental' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Rental Price (per day)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input 
                        type="number" 
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                        className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]" 
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Security Deposit</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input 
                        type="number" 
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58]" 
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
