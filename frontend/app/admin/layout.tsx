import React from 'react';
import Link from 'next/link';
import { Search, Bell, LayoutGrid, ChevronDown } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header Navbar */}
      <header className="bg-[#CD2C58] text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-6">
            <Link href="/admin/orders" className="flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-white/90" />
              <span className="font-bold text-lg tracking-tight">Odoo</span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              
              {/* Order Dropdown */}
              <div className="relative group">
                <Link href="/admin/orders" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer">
                  Order <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Link>
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block w-40">
                  <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <Link href="/admin/invoices" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Invoice</Link>
                    <Link href="/admin/customers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Customer</Link>
                  </div>
                </div>
              </div>

              {/* Schedule (No Dropdown) */}
              <Link href="/admin/schedule" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors">
                Schedule
              </Link>
              
              {/* Product Dropdown */}
              <div className="relative group">
                <Link href="/admin/products" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer">
                  Product <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Link>
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block w-40">
                  <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <Link href="/admin/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Product</Link>
                    <Link href="/admin/pricelists" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Price list</Link>
                    <Link href="/admin/attributes" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Attribute</Link>
                    <Link href="/admin/rental-periods" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rental Period</Link>
                  </div>
                </div>
              </div>

              {/* Report (No Dropdown) */}
              <Link href="/admin/reports" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors">
                Report
              </Link>
              
              {/* Configuration Dropdown */}
              <div className="relative group">
                <Link href="/admin/settings" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-white/10 transition-colors flex items-center gap-1 cursor-pointer">
                  Configuration <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </Link>
                <div className="absolute left-0 top-full pt-1 hidden group-hover:block w-48">
                  <div className="bg-white rounded-md shadow-lg py-1 border border-gray-200">
                    <Link href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Setting</Link>
                    <Link href="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">User</Link>
                    <Link href="/admin/quotation-templates" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Quotation Template</Link>
                    <Link href="/admin/header-footer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Header/Footer</Link>
                  </div>
                </div>
              </div>
              
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden lg:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-white/10 border-transparent text-white placeholder-white/60 text-sm rounded-full pl-9 pr-4 py-1.5 focus:bg-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all w-48"
              />
            </div>
            
            <button className="text-white/80 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute 0 right-0 w-2 h-2 bg-yellow-400 rounded-full border border-[#CD2C58]"></span>
            </button>
            
            <div className="w-8 h-8 rounded-full bg-white text-[#CD2C58] flex items-center justify-center text-sm font-bold shadow-sm cursor-pointer border border-gray-200">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
