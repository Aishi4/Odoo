"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, GitCompare, Heart, ChevronRight, X, Star, Loader2, CheckCircle2, PackageX, ShoppingBag, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { catalogApi, cartApi } from '@/lib/api';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [message, setMessage] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const res = await catalogApi.getProductById(unwrappedParams.id);
      setLoading(false);

      if (res.success && res.data) {
        setProduct(res.data);
        
        try {
          const list = JSON.parse(localStorage.getItem('wishlist') || '[]');
          if (Array.isArray(list)) {
            setIsWishlisted(list.some((i: any) => i.id === res.data.id));
          }
        } catch (e) {}
      } else {
        setProduct(null);
      }
    };

    fetchProduct();
  }, [unwrappedParams.id]);

  const toggleWishlist = () => {
    if (!product) return;

    let list: any[] = [];
    try {
      list = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!Array.isArray(list)) list = [];
    } catch (err) {
      list = [];
    }

    const itemObj = {
      id: product.id,
      name: product.name,
      base_price: product.base_price,
      price: product.base_price,
      img: product.image_url || 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80',
      description: product.description,
    };

    const exists = list.some((item) => item.id === product.id);
    let updated = [];
    if (exists) {
      updated = list.filter((item) => item.id !== product.id);
      setIsWishlisted(false);
    } else {
      updated = [...list, itemObj];
      setIsWishlisted(true);
    }

    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    const isAvailable = product.status === 'ACTIVE' && product.is_active !== false;
    if (!isAvailable) return;

    setAdding(true);
    setMessage(null);

    const sDateStr = startDate ? startDate.toISOString().split('T')[0] : undefined;
    const eDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;

    const res = await cartApi.addItem({
      product_id: product.id,
      quantity: qty,
      start_date: sDateStr,
      end_date: eDateStr,
    });

    if (!res.success) {
      try {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = localCart.find((i: any) => i.id === product.id);
        if (existing) {
          existing.quantity += qty;
        } else {
          localCart.push({
            id: product.id,
            product: product,
            name: product.name,
            price: product.base_price,
            img: product.image_url,
            quantity: qty,
          });
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
      } catch (err) {}
    }

    setAdding(false);
    window.dispatchEvent(new Event('cartUpdated'));

    setMessage('Item successfully added to your cart!');
    setTimeout(() => router.push('/cart'), 800);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16 text-center text-gray-500 min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mb-3" />
        <span>Loading product details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <PackageX className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The requested product could not be found in the live database.</p>
        <Link href="/" className="px-6 py-3 bg-[#CD2C58] text-white font-bold rounded-xl hover:bg-[#b02248] transition-colors">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const name = product.name;
  const price = product.base_price || 0;
  const description = product.description || 'High-performance rental equipment.';
  const imgUrl = product.image_url || 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=1000&q=80';
  const isAvailable = product.status === 'ACTIVE' && product.is_active !== false;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-[#CD2C58]">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/" className="hover:text-[#CD2C58]">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{name}</span>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left: Product Image */}
        <div className="w-full lg:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-200">
          <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 flex items-center gap-1'}`}>
            {!isAvailable && <AlertTriangle className="w-3 h-3" />}
            {isAvailable ? 'In Stock' : 'Out of Stock'}
          </div>
          
          <img
            src={imgUrl} 
            alt={name} 
            className={`w-full max-w-md h-auto object-contain drop-shadow-xl ${!isAvailable ? 'grayscale opacity-75' : ''}`} 
          />
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
          <div className="mb-2 text-xs text-gray-500 font-medium uppercase tracking-widest">
            {product?.category || 'EQUIPMENT'}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium text-gray-700">4.9 Rating</span>
            <span className="text-gray-300">•</span>
            <span className="text-sm text-gray-500">Verified Equipment</span>
          </div>

          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-4xl font-black text-[#CD2C58]">₹{price}</span>
            <span className="text-lg text-gray-500 font-medium">/ day</span>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {description}
          </p>

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#CD2C58]" /> Select Rental Dates
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
                      {startDate ? format(startDate, "PPP") : <span>Pick start date</span>}
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
                      {endDate ? format(endDate, "PPP") : <span>Pick end date</span>}
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

          <div className="flex gap-4">
            <button 
              onClick={handleAddToCart}
              disabled={adding || !isAvailable}
              className={`flex-1 py-4 px-6 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
                !isAvailable 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                  : 'bg-[#CD2C58] hover:bg-[#b02248]'
              }`}
            >
              {adding ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isAvailable ? (
                <>
                  <ShoppingBag className="w-5 h-5" /> Add to Cart & Rent
                </>
              ) : (
                'Currently Out of Stock'
              )}
            </button>

            <button 
              onClick={toggleWishlist}
              className={`p-4 rounded-xl border border-gray-300 transition-colors flex items-center justify-center ${
                isWishlisted ? 'bg-red-50 border-red-200 text-[#CD2C58]' : 'hover:bg-gray-50 text-gray-600'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
