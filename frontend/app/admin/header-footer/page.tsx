"use client";

import React from 'react';
import { Save } from 'lucide-react';

export default function HeaderFooterPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Document Header/Footer</h1>
          <p className="text-sm text-gray-500 mt-1">Configure company details for PDF reports.</p>
        </div>
        <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
          <Save className="w-4 h-4" /> Save
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Company Details</h2>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Company Name</label>
            <input type="text" defaultValue="Odoo Rentals" className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Company Tagline</label>
            <input type="text" defaultValue="Premium equipment at your fingertips." className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Address</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" defaultValue={"123 Rental Street\nTech Park, City 400001"}></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">Footer Configuration</h2>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Footer Text</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]" defaultValue={"Odoo Rentals - Phone: +91 98765 43210 - Email: contact@odoorentals.com\nRegistered Company No: 123456789"}></textarea>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="page_numbers" defaultChecked className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" />
            <label htmlFor="page_numbers" className="text-sm font-medium text-gray-700">Display Page Numbers</label>
          </div>
        </div>
      </div>
    </div>
  );
}
