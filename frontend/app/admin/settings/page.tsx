"use client";

import React from 'react';
import { Save, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global application behavior.</p>
        </div>
        <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-12">
        
        {/* Rental Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Rental Configurations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input type="checkbox" id="late_fees" defaultChecked className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <label htmlFor="late_fees" className="font-bold text-gray-900 block mb-1">Global Late Fees</label>
                <p className="text-sm text-gray-500">Automatically calculate and apply late fees on returns past their due date.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input type="checkbox" id="deposit" defaultChecked className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <label htmlFor="deposit" className="font-bold text-gray-900 block mb-1">Security Deposits</label>
                <p className="text-sm text-gray-500">Require a security deposit before confirming a rental order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Product Catalog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input type="checkbox" id="variants" defaultChecked className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <label htmlFor="variants" className="font-bold text-gray-900 block mb-1">Product Variants</label>
                <p className="text-sm text-gray-500">Sell variants of a product using attributes (size, color, etc.)</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input type="checkbox" id="uom" className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <label htmlFor="uom" className="font-bold text-gray-900 block mb-1">Units of Measure</label>
                <p className="text-sm text-gray-500">Sell and purchase products in different units of measure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoicing Settings */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Invoicing
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <input type="checkbox" id="taxes" defaultChecked className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
              <div>
                <label htmlFor="taxes" className="font-bold text-gray-900 block mb-1">Default Taxes</label>
                <p className="text-sm text-gray-500 mb-2">Apply default taxes to all orders.</p>
                <div className="mt-2 flex gap-2 w-full">
                  <select className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58] flex-1">
                    <option>Sales Tax (18%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
