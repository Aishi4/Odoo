"use client";
import React from 'react';
import Link from 'next/link';
import { Mail, Lock, Building, Briefcase, FileText, ArrowRight } from 'lucide-react';

export default function VendorRegister() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left*/}
        <div className="w-full md:w-[60%] p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Vendor Sign-up</h1>
            <p className="text-gray-500">Partner with Odoo Rentals to list your premium equipment.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = '/'; }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="Ayan" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="Pal" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                <div className="relative">
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="XYZ" required />
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">GST No</label>
                <div className="relative">
                  <input type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="22AAAAA0000A1Z5" required />
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email ID</label>
                <div className="relative">
                  <input type="email" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="vendorname@example.com" required />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Product Category</label>
                <div className="relative">
                  <select className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all appearance-none" required>
                    <option value="">Select category...</option>
                    <option value="electronics">Electronics</option>
                    <option value="furniture">Furniture</option>
                    <option value="photography">Photography</option>
                    <option value="vehicles">Vehicles</option>
                  </select>
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="••••••••" required />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input type="password" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 pl-10 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" placeholder="••••••••" required />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-[#CD2C58] text-white rounded-xl font-bold hover:bg-[#E06B80] transition-colors shadow-lg shadow-[#CD2C58]/30 flex items-center justify-center gap-2 mt-4">
              Register as Vendor <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 flex flex-col gap-2">
            <div>
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#CD2C58] hover:underline">
                Sign in
              </Link>
            </div>
            <div>
              <Link href="/register" className="font-medium text-[#E06B80] hover:underline text-xs">
                Register as a customer instead
              </Link>
            </div>
          </div>
        </div>

        {/* Right Branding Side */}
        <div className="w-full md:w-[40%] bg-[#CD2C58] p-12 hidden md:flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-2xl font-black text-white tracking-tight mb-8">Odoo Rentals Partner</div>
            <h2 className="text-4xl font-black text-white leading-tight mb-4">
              Grow your<br/>Rental Business.
            </h2>
            <p className="text-[#FFE6D4] text-lg font-medium">
              List your inventory and reach thousands of daily professionals.
            </p>
          </div>

          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#E06B80] rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#FFC69D] rounded-full blur-3xl opacity-20"></div>
        </div>

      </div>
    </div>
  );
}
