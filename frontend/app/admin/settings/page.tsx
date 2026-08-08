"use client";

import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [lateFees, setLateFees] = useState(true);
  const [deposit, setDeposit] = useState(true);
  const [variants, setVariants] = useState(true);
  const [uom, setUom] = useState(false);
  const [taxes, setTaxes] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage('System configuration saved successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global rental rules and invoicing behaviors.</p>
        </div>
        <button 
          onClick={handleSave}
          className="px-5 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors text-sm"
        >
          <Save className="w-4 h-4" /> Save Preferences
        </button>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-12">
        {/* Rental Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
            Rental Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={lateFees} 
                onChange={(e) => setLateFees(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Global Late Fees</span>
                <p className="text-xs text-gray-500">Automatically calculate and apply late fees on returns past their due date.</p>
              </div>
            </label>
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={deposit} 
                onChange={(e) => setDeposit(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Security Deposits</span>
                <p className="text-xs text-gray-500">Require a security deposit before confirming a rental order.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Product Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
            Product Catalog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={variants} 
                onChange={(e) => setVariants(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Product Variants</span>
                <p className="text-xs text-gray-500">Support multiple variants using attributes (color, size, etc.)</p>
              </div>
            </label>
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={uom} 
                onChange={(e) => setUom(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Units of Measure</span>
                <p className="text-xs text-gray-500">Track and rent products in custom units of measure.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Invoicing Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">
            Invoicing & Tax
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={taxes} 
                onChange={(e) => setTaxes(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Default GST / Tax (18%)</span>
                <p className="text-xs text-gray-500">Apply tax calculations to generated rental orders.</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
