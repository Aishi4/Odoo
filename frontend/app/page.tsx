import React from 'react';
import { Search, ChevronRight, Check, Heart } from "lucide-react";

export default function Home() {
  const products = [
    { id: 1, name: 'Premium Office Chair', price: 15, period: 'day', img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80', variants: ['Black', 'Grey', 'White'], stock: true },
    { id: 2, name: 'MacBook Pro 16"', price: 45, period: 'day', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80', variants: ['Space Gray', 'Silver'], stock: true },
    { id: 3, name: 'Sony A7III Camera', price: 30, period: 'day', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80', variants: ['Black'], stock: false },
    { id: 4, name: '4K Monitor 27"', price: 10, period: 'day', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80', variants: ['Black', 'Silver'], stock: true },
    { id: 5, name: 'Ergonomic Desk', price: 20, period: 'day', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80', variants: ['Oak', 'Walnut', 'White'], stock: true },
    { id: 6, name: 'Studio Microphone', price: 12, period: 'day', img: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80', variants: ['Black'], stock: true },
    { id: 7, name: 'iPad Pro 12.9"', price: 25, period: 'day', img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80', variants: ['Space Gray', 'Silver'], stock: true },
    { id: 8, name: 'Wireless Headphones', price: 8, period: 'day', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', variants: ['Black', 'White', 'Blue'], stock: false },
    { id: 9, name: 'Standing Desk Converter', price: 18, period: 'day', img: 'https://images.unsplash.com/photo-1595514535415-0816911c42de?w=500&q=80', variants: ['Black', 'White'], stock: true },
    { id: 10, name: 'Logitech MX Master 3', price: 5, period: 'day', img: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=500&q=80', variants: ['Graphite', 'Mid Grey'], stock: true },
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <a href="/" className="hover:text-[#CD2C58]">Home</a>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Rental Catalog</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Filters</h2>
              <button className="text-sm text-[#CD2C58] hover:underline">Clear all</button>
            </div>
            
            {/* Brand Filter */}
            <div className="border-t border-gray-200 py-6">
              <h3 className="font-semibold text-gray-900 mb-4">Brand</h3>
              <div className="relative mb-4">
                <input 
                  type="text" 
                  placeholder="Search brand..." 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]" 
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {['Apple', 'Sony', 'Herman Miller', 'Dell', 'Logitech', 'Samsung', 'Bose'].map((brand, idx) => (
                  <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${idx === 0 || idx === 2 ? 'bg-[#CD2C58] border-[#CD2C58]' : 'border-gray-300 group-hover:border-[#CD2C58]'}`}>
                      {(idx === 0 || idx === 2) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="border-t border-gray-200 py-6">
              <h3 className="font-semibold text-gray-900 mb-4">Color</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { hex: '#000000', name: 'Black' },
                  { hex: '#FFFFFF', name: 'White', border: true },
                  { hex: '#9CA3AF', name: 'Grey' },
                  { hex: '#EF4444', name: 'Red' },
                  { hex: '#3B82F6', name: 'Blue' },
                  { hex: '#10B981', name: 'Green' }
                ].map((color, idx) => (
                  <button 
                    key={color.hex}
                    title={color.name}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${color.border ? 'border border-gray-300' : ''} ${idx === 0 ? 'ring-2 ring-offset-2 ring-[#CD2C58]' : ''}`}
                    style={{ backgroundColor: color.hex }}
                  >
                    {idx === 0 && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div className="border-t border-gray-200 py-6">
              <h3 className="font-semibold text-gray-900 mb-4">Duration</h3>
              <div className="space-y-3">
                {['1 Month', '6 Month', '1 Year', '2 Years', '3 Years'].map((dur, idx) => (
                  <label key={dur} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${idx === 1 ? 'bg-[#CD2C58] border-[#CD2C58]' : 'border-gray-300 group-hover:border-[#CD2C58]'}`}>
                      {idx === 1 && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 group-hover:text-gray-900">{dur}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="border-t border-gray-200 py-6">
              <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
              <div className="px-2">
                {/* Simplified range slider representation */}
                <div className="relative h-1.5 bg-gray-200 rounded-full mb-6">
                  <div className="absolute left-[20%] right-[40%] h-full bg-[#CD2C58] rounded-full"></div>
                  <div className="absolute left-[20%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#CD2C58] rounded-full cursor-grab"></div>
                  <div className="absolute right-[40%] top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-white border-2 border-[#CD2C58] rounded-full cursor-grab"></div>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-center">
                    <span className="text-xs text-gray-500 block mb-0.5">Min ($)</span>
                    <span className="text-sm font-medium text-gray-900">200</span>
                  </div>
                  <div className="text-gray-400">-</div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-center">
                    <span className="text-xs text-gray-500 block mb-0.5">Max ($)</span>
                    <span className="text-sm font-medium text-gray-900">6000</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 py-6">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div className="w-10 h-6 bg-gray-200 rounded-full relative transition-colors group-hover:bg-gray-300">
                   <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                 </div>
                 <span className="text-sm font-medium text-gray-900">Hide Out of Stock</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Rentals</h1>
              <p className="text-sm text-gray-500 mt-1">Showing 1-10 of 142 products</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select className="bg-white border border-gray-200 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58]">
                <option>Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest Arrivals</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all hover:border-[#E06B80] flex flex-col">
                <div className="relative h-56 overflow-hidden bg-gray-50">
                  {!product.stock && (
                    <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                      Out of Stock
                    </div>
                  )}
                  <button className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur rounded-full text-gray-400 hover:text-[#CD2C58] hover:bg-white transition-all shadow-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                  <a href={`/product/${product.id}`} className="block h-full">
                    <img 
                      src={product.img} 
                      alt={product.name} 
                      className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!product.stock ? 'opacity-50 grayscale' : ''}`}
                    />
                  </a>
                </div>
                
                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-1 text-xs text-gray-500 font-medium uppercase tracking-wider">
                    {product.variants.length} Colors
                  </div>
                  <a href={`/product/${product.id}`} className="block mb-2 group-hover:text-[#CD2C58] transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                  </a>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-[#CD2C58]">${product.price}</span>
                    <span className="text-sm text-gray-500 font-medium">/ {product.period}</span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                    <button 
                      className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                        product.stock 
                          ? 'bg-[#CD2C58] text-white hover:bg-[#E06B80] shadow-md shadow-[#CD2C58]/20 hover:shadow-lg hover:shadow-[#CD2C58]/30 hover:-translate-y-0.5' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={!product.stock}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-12 flex justify-center items-center gap-2">
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#CD2C58] hover:text-[#CD2C58] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button className="w-10 h-10 rounded-lg bg-[#CD2C58] text-white font-medium flex items-center justify-center shadow-md shadow-[#CD2C58]/20">1</button>
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 font-medium hover:border-[#CD2C58] hover:text-[#CD2C58] transition-colors">2</button>
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 font-medium hover:border-[#CD2C58] hover:text-[#CD2C58] transition-colors">3</button>
            <span className="text-gray-400 px-1">...</span>
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700 font-medium hover:border-[#CD2C58] hover:text-[#CD2C58] transition-colors">15</button>
            <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#CD2C58] hover:text-[#CD2C58] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
