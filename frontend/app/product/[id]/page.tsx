"use client";
import React, { useState } from 'react';
import { Calendar as CalendarIcon, GitCompare, Heart, ChevronRight, X, Star } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import Link from "next/link";

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState('Black');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Mock product data
  const product = { 
    id: unwrappedParams.id, 
    name: 'Premium Office Chair', 
    code: 'PRD-001-OC',
    rating: 4.8,
    reviews: 124,
    price: 15, 
    period: 'day', 
    img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1000&q=80',
    description: 'Experience ultimate comfort with our premium ergonomic office chair. Perfect for long working hours with adjustable lumbar support, breathable mesh, and customizable recline settings.',
    variants: ['Black', 'Grey', 'White'],
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#CD2C58]">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/product" className="hover:text-[#CD2C58]">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left: Product Image */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className="absolute top-4 left-4 bg-[#FFE6D4] text-[#CD2C58] text-xs font-bold px-3 py-1 rounded-full">
            In Stock
          </div>
          <img
            src={product.img} 
            alt={product.name} 
            className="w-full max-w-md h-auto object-contain drop-shadow-xl" 
          />
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
          <div className="mb-2 text-xs text-gray-500 font-medium uppercase tracking-widest">
            {product.code}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">{product.rating} Rating</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500 hover:text-[#CD2C58] cursor-pointer transition-colors">{product.reviews} Reviews</span>
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-black text-[#CD2C58]">₹{product.price}</span>
            <span className="text-lg text-gray-500 font-medium">/ {product.period}</span>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {product.description}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#CD2C58]" /> Rental Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal py-5 ${!startDate && "text-gray-500"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal py-5 ${!endDate && "text-gray-500"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* Quantity */}
              <div className="flex items-center border border-gray-300 rounded-lg h-12 w-32 bg-white">
                <button 
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-[#CD2C58] hover:bg-gray-50 transition-colors rounded-l-lg"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  -
                </button>
                <span className="flex-1 text-center font-semibold text-gray-900">{qty}</span>
                <button 
                  className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-[#CD2C58] hover:bg-gray-50 transition-colors rounded-r-lg"
                  onClick={() => setQty(qty + 1)}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button 
                className="flex-1 h-12 bg-[#CD2C58] text-white rounded-lg font-semibold shadow-md shadow-[#CD2C58]/20 hover:bg-[#E06B80] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#CD2C58]/30 transition-all flex items-center justify-center gap-2"
                onClick={() => setShowConfigModal(true)}
              >
                Configure & Add to Cart
              </button>

              <button className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 hover:text-[#CD2C58] hover:border-[#CD2C58] hover:bg-red-50 transition-all">
                <Heart className="w-5 h-5" />
              </button>
              
              <button className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-lg text-gray-600 hover:text-[#CD2C58] hover:border-[#CD2C58] hover:bg-blue-50 transition-all">
                <GitCompare className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configure Options Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Configure Options</h3>
              <button 
                onClick={() => setShowConfigModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Color</h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        selectedVariant === v 
                          ? 'border-[#CD2C58] bg-[#FFE6D4] text-[#CD2C58]' 
                          : 'border-gray-200 text-gray-700 hover:border-gray-300 bg-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Add-ons</h4>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#CD2C58] transition-colors">
                  <input type="checkbox" className="w-4 h-4 text-[#CD2C58] rounded border-gray-300 focus:ring-[#CD2C58]" />
                  <span className="text-sm text-gray-700 font-medium">Extended Warranty (+₹5/day)</span>
                </label>
              </div>

              <button 
                className="w-full py-3 bg-[#CD2C58] text-white rounded-lg font-semibold hover:bg-[#E06B80] transition-colors"
                onClick={() => {
                  alert('Added to cart!');
                  setShowConfigModal(false);
                }}
              >
                Confirm & Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
