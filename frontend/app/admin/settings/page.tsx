"use client";

import React, { useState } from 'react';
import { Save, CheckCircle2, Mail, Eye, Send } from 'lucide-react';

export default function SettingsPage() {
  const [lateFees, setLateFees] = useState(true);
  const [deposit, setDeposit] = useState(true);
  const [variants, setVariants] = useState(true);
  const [uom, setUom] = useState(false);
  const [taxes, setTaxes] = useState(true);

  // Email Notification Settings
  const [autoQuotationEmail, setAutoQuotationEmail] = useState(true);
  const [autoConfirmationEmail, setAutoConfirmationEmail] = useState(true);
  const [autoInvoiceEmail, setAutoInvoiceEmail] = useState(true);
  const [autoReminderEmail, setAutoReminderEmail] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<'quotation' | 'confirmation' | 'invoice' | 'reminder'>('quotation');

  const [message, setMessage] = useState<string | null>(null);

  const handleSave = () => {
    setMessage('System configuration & notification preferences saved successfully!');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings & Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">Configure global rental rules, email notifications, and template workflows.</p>
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
        {/* Email & Notification Workflows */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#CD2C58]" /> Automated Email Notification Workflows
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoQuotationEmail} 
                onChange={(e) => setAutoQuotationEmail(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Quotation Proposal Email</span>
                <p className="text-xs text-gray-500">Automatically send quotation proposal emails when clicking "Send Quotation".</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoConfirmationEmail} 
                onChange={(e) => setAutoConfirmationEmail(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Sale Order Confirmation Email</span>
                <p className="text-xs text-gray-500">Send order confirmation details to customer upon confirming rental order.</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoInvoiceEmail} 
                onChange={(e) => setAutoInvoiceEmail(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Invoice Issuance Email</span>
                <p className="text-xs text-gray-500">Send invoice PDF & payment instructions when creating or posting invoices.</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoReminderEmail} 
                onChange={(e) => setAutoReminderEmail(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" 
              />
              <div>
                <span className="font-bold text-gray-900 block mb-1">Pickup & Return Reminders</span>
                <p className="text-xs text-gray-500">Send automated 24-hour advance reminders for pickups and returns.</p>
              </div>
            </label>
          </div>

          {/* Email Template Previewer */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#CD2C58]" /> Live Email Template Preview
              </span>
              <div className="flex gap-2">
                {(['quotation', 'confirmation', 'invoice', 'reminder'] as const).map((tmpl) => (
                  <button
                    key={tmpl}
                    onClick={() => setPreviewTemplate(tmpl)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                      previewTemplate === tmpl 
                        ? 'bg-[#CD2C58] text-white shadow-xs' 
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {tmpl}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-2xl mx-auto shadow-xs space-y-3 font-sans">
              <div className="text-xs text-gray-500 border-b border-gray-100 pb-2">
                <strong>From:</strong> Odoo Rentals &lt;noreply@odoo-rentals.com&gt;
              </div>

              {previewTemplate === 'quotation' && (
                <div>
                  <h3 className="text-lg font-bold text-[#CD2C58]">Rental Quotation Proposal #SO-20260808-1024</h3>
                  <p className="text-sm text-gray-700 mt-2">Hello John Doe,</p>
                  <p className="text-sm text-gray-600">Please review your requested quotation for upcoming rental dates (Aug 10 - Aug 15). Total rate: <strong>₹4,500.00</strong>.</p>
                </div>
              )}

              {previewTemplate === 'confirmation' && (
                <div>
                  <h3 className="text-lg font-bold text-emerald-600">Rental Order Confirmed #SO-20260808-1024</h3>
                  <p className="text-sm text-gray-700 mt-2">Hello John Doe,</p>
                  <p className="text-sm text-gray-600">Your rental order is confirmed! Your equipment will be ready for pickup on <strong>Aug 10, 2026</strong>.</p>
                </div>
              )}

              {previewTemplate === 'invoice' && (
                <div>
                  <h3 className="text-lg font-bold text-indigo-600">Invoice Issued #INV-20260808-0001</h3>
                  <p className="text-sm text-gray-700 mt-2">Hello John Doe,</p>
                  <p className="text-sm text-gray-600">Invoice #INV-20260808-0001 for ₹4,500.00 has been issued. Status: <strong>POSTED</strong>.</p>
                </div>
              )}

              {previewTemplate === 'reminder' && (
                <div>
                  <h3 className="text-lg font-bold text-amber-600">Equipment Return Reminder</h3>
                  <p className="text-sm text-gray-700 mt-2">Hello John Doe,</p>
                  <p className="text-sm text-gray-600">This is a reminder that your rental equipment is due for return tomorrow. Please return on time to avoid late fee penalties.</p>
                </div>
              )}
            </div>
          </div>
        </div>

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

        {/* Product Catalog */}
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
      </div>
    </div>
  );
}
