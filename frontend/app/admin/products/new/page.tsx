"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

export default function NewProductPage() {
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex flex-col">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Product</h1>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Unsaved</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            Discard
          </button>
          <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
        
        {/* Name and Image Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 flex gap-8 items-start">
          <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition-colors shrink-0">
            <ImageIcon className="w-8 h-8 mb-2" />
            <span className="text-xs font-medium">Add Image</span>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name</label>
              <input 
                type="text" 
                placeholder="e.g. Premium Executive Chair" 
                className="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-[#CD2C58] focus:ring-0 px-0 py-2 bg-transparent text-gray-900 placeholder-gray-300"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="can_be_sold" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
                <label htmlFor="can_be_sold" className="text-sm font-medium text-gray-700">Can be Sold</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="can_be_rented" defaultChecked className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
                <label htmlFor="can_be_rented" className="text-sm font-medium text-gray-700">Can be Rented</label>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Form Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-2 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-[#CD2C58] text-[#CD2C58]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              General Information
            </button>
            <button 
              onClick={() => setActiveTab('rental')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'rental' ? 'border-[#CD2C58] text-[#CD2C58]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Rental Rules
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-[#CD2C58] text-[#CD2C58]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Inventory
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Type</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]">
                      <option>Storable Product</option>
                      <option>Service</option>
                      <option>Consumable</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Product Category</label>
                    <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]">
                      <option>All / Furniture</option>
                      <option>All / Electronics</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Internal Reference</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Barcode</label>
                    <input type="text" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rental' && (
              <div className="space-y-10">
                
                {/* Pricing Rules */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Pricing Rules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Hourly Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input type="number" placeholder="0.00" className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Daily Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input type="number" placeholder="0.00" className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Weekly Rate</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                        <input type="number" placeholder="0.00" className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Fees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Security Deposit</h3>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Deposit Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input type="number" placeholder="0.00" className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 mb-4">Late Fees</h3>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Fee per Hour/Day</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                      <input type="number" placeholder="0.00" className="w-full pl-8 pr-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Weight</label>
                    <div className="relative">
                      <input type="number" placeholder="0.00" className="w-full pr-10 pl-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">kg</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Volume</label>
                    <div className="relative">
                      <input type="number" placeholder="0.00" className="w-full pr-10 pl-3 border border-gray-300 rounded-md py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">m³</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
