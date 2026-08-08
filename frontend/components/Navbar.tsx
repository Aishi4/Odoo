"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, User, ChevronDown } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/vendor-register" || pathname === "/forgot-password";
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage || isAdminPage) {
    return null;
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      router.push(`/?q=${e.currentTarget.value.trim()}`);
    } else if (e.key === 'Enter') {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-[1280px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo and Left Links */}
        <div className="flex items-center gap-8">
          <a href="/" className="text-2xl font-bold text-[#CD2C58] tracking-tight">Odoo Rentals</a>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/" className="text-gray-600 hover:text-[#CD2C58] font-medium transition-colors">Products</a>
            <a href="#" className="text-gray-600 hover:text-[#CD2C58] font-medium transition-colors">Terms & Condition</a>
            <a href="#" className="text-gray-600 hover:text-[#CD2C58] font-medium transition-colors">About us</a>
            <a href="#" className="text-gray-600 hover:text-[#CD2C58] font-medium transition-colors">Contact Us</a>
          </nav>
        </div>

        {/* Middle Search */}
        <div className="flex-1 max-w-md mx-8 hidden lg:block">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search products, brands..." 
              onKeyDown={handleSearch}
              className="w-full bg-gray-100 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#E06B80] focus:bg-white transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#CD2C58]" />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-[#CD2C58] transition-colors relative">
            <Heart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1.5 bg-[#CD2C58] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">2</span>
          </button>
          <a href="/checkout" className="text-gray-600 hover:text-[#CD2C58] transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1.5 bg-[#CD2C58] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">3</span>
          </a>
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2 text-gray-700 hover:text-[#CD2C58] font-medium transition-colors">
              <div className="w-9 h-9 rounded-full bg-[#FFE6D4] text-[#CD2C58] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <span className="hidden sm:inline">My Account</span>
              <ChevronDown className="w-4 h-4" />
            </div>
            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col py-2 z-50">
              <a href="#" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CD2C58]">My Profile</a>
              <a href="#" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CD2C58]">My Orders</a>
              <a href="#" className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#CD2C58]">Settings</a>
              <div className="h-px bg-gray-100 my-2"></div>
              <a href="/login" className="px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
