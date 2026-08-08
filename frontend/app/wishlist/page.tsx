import React from 'react';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-[#CD2C58]" />
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
        <Heart className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Explore our catalog and save your favorite items for later.</p>
        <a href="/" className="bg-[#CD2C58] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#b02248] transition-colors">
          Browse Products
        </a>
      </div>
    </div>
  );
}
