"use client";

import React from 'react';
import { Save } from 'lucide-react';

export default function QuotationTemplatesPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotation Templates</h1>
          <p className="text-sm text-gray-500 mt-1">Design default templates for rental quotations.</p>
        </div>
        <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Template Name</label>
            <input type="text" defaultValue="Standard Rental Quotation" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Subject</label>
            <input type="text" defaultValue="Your Rental Quotation from Odoo Rentals" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Body</label>
            <textarea rows={6} className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" defaultValue={"Hello,\n\nPlease find attached the quotation for your upcoming rental.\n\nThank you,\nOdoo Rentals Team"}></textarea>
          </div>
        </div>
      </div>
    </div>
  );
}
