"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, MapPin, ShoppingBag, CheckCircle, ArrowRight, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { orderApi, cartApi } from '@/lib/api';

export default function Checkout() {
  const [step, setStep] = useState(1);
  const [loadingCart, setLoadingCart] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'STORE_PICKUP'>('DELIVERY');
  const [address, setAddress] = useState({
    street: '123 Main St',
    city: 'Mumbai',
    state: 'Maharashtra',
    zip: '400001',
  });

  const steps = [
    { num: 1, name: 'Cart', icon: ShoppingBag },
    { num: 2, name: 'Address', icon: MapPin },
    { num: 3, name: 'Payment', icon: CreditCard },
    { num: 4, name: 'Success', icon: CheckCircle },
  ];

  const loadCart = async () => {
    setLoadingCart(true);
    let items: any[] = [];
    
    // 1. Fetch backend API cart
    const res = await cartApi.getCart();
    if (res.success && res.data) {
      items = res.data.CartItems || res.data.items || [];
    }

    // 2. Fetch local storage cart
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (Array.isArray(localCart) && localCart.length > 0) {
        localCart.forEach((lItem: any) => {
          const exists = items.some((bItem) => (bItem.product_id === lItem.id || bItem.id === lItem.id));
          if (!exists) {
            items.push(lItem);
          }
        });
      }
    } catch (e) {}

    setCartItems(items);
    setLoadingCart(false);
  };

  useEffect(() => {
    loadCart();
  }, []);

  const subtotal = cartItems.reduce((acc, item) => {
    const p = Number(item.price || item.unit_price || item.product?.base_price || item.base_price || 0);
    return acc + (p * (item.quantity || 1));
  }, 0);

  const deliveryFee = deliveryMethod === 'DELIVERY' && subtotal > 0 ? 500 : 0;
  const deposit = subtotal > 0 ? 1000 : 0;
  const totalAmount = subtotal + deliveryFee + deposit;

  const handlePlaceOrder = async () => {
    setPlacingOrder(true);
    setError(null);

    try {
      // 1. Sync local cart items to backend if necessary
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (Array.isArray(localCart) && localCart.length > 0) {
        for (const item of localCart) {
          await cartApi.addItem({
            product_id: item.id || item.product_id,
            quantity: item.quantity || 1,
          });
        }
      }

      // 2. Create order in PostgreSQL database
      const delAddress = deliveryMethod === 'DELIVERY' 
        ? `${address.street}, ${address.city}, ${address.state} ${address.zip}`
        : 'Store Pickup Location';

      const orderRes = await orderApi.createOrder({
        delivery_method: deliveryMethod,
        delivery_address: delAddress,
      });

      if (orderRes.success && orderRes.data) {
        const order = orderRes.data;

        // 3. Process Payment via ONLINE provider
        const payRes = await orderApi.payOrder(order.id, 'ONLINE');
        setPlacingOrder(false);

        if (payRes.success) {
          setCreatedOrder(payRes.data?.order || order);
          localStorage.removeItem('cart');
          window.dispatchEvent(new Event('cartUpdated'));
          setStep(4);
        } else {
          setError(payRes.message || 'Payment processing failed');
        }
      } else {
        setPlacingOrder(false);
        setError(orderRes.message || 'Failed to create order. Please ensure you are logged in as a customer.');
      }
    } catch (err: any) {
      setPlacingOrder(false);
      setError(err.message || 'An unexpected error occurred during checkout');
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 py-12">
      {/* Progress Tracker */}
      <div className="flex items-center justify-between mb-12 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#CD2C58] -z-10 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        ></div>
        
        {steps.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-2 bg-white px-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${
              step >= s.num 
                ? 'bg-[#CD2C58] border-white text-white shadow-md shadow-[#CD2C58]/20' 
                : 'bg-white border-gray-200 text-gray-400'
            }`}>
              <s.icon className="w-5 h-5" />
            </div>
            <span className={`text-sm font-bold ${step >= s.num ? 'text-[#CD2C58]' : 'text-gray-400'}`}>{s.name}</span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Step 1: Cart Review */}
        {step === 1 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Review your Cart ({cartItems.length} items)</h2>
            
            {loadingCart ? (
              <div className="py-12 text-center text-gray-500 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#CD2C58] mr-2" /> Loading cart items...
              </div>
            ) : cartItems.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <p className="mb-4">Your cart is empty.</p>
                <Link href="/" className="px-6 py-2.5 bg-[#CD2C58] text-white font-bold rounded-lg hover:bg-[#b02248]">
                  Browse Rentals
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {cartItems.map((item) => {
                    const price = Number(item.price || item.unit_price || item.product?.base_price || item.base_price || 0);
                    const name = item.product?.name || item.name || item.product_name || 'Rental Equipment';
                    const imgUrl = item.product?.image_url || item.img || item.image_url || 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=200&q=80';

                    return (
                      <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                        <img src={imgUrl} alt={name} className="w-16 h-16 object-cover rounded-lg bg-white border border-gray-200" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-sm">{name}</h3>
                          <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-base text-[#CD2C58]">₹{price * (item.quantity || 1)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-right w-full sm:w-auto ml-auto">
                    <div className="text-xs text-gray-500 mb-1">Rental Total</div>
                    <div className="text-3xl font-black text-gray-900">₹{subtotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => setStep(2)}
                    className="bg-[#CD2C58] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20"
                  >
                    Proceed to Address <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Delivery & Address */}
        {step === 2 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Delivery Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="col-span-full mb-2">
                <label className="text-sm font-semibold text-gray-700 block mb-3">Fulfillment Method</label>
                <div className="flex gap-4">
                  <label 
                    onClick={() => setDeliveryMethod('DELIVERY')}
                    className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${deliveryMethod === 'DELIVERY' ? 'border-[#CD2C58] bg-[#FFE6D4]/30' : 'border-gray-200'}`}
                  >
                    <input type="radio" checked={deliveryMethod === 'DELIVERY'} readOnly className="text-[#CD2C58] focus:ring-[#CD2C58]" />
                    <span className="font-semibold text-gray-900 text-sm">Standard Delivery</span>
                  </label>
                  <label 
                    onClick={() => setDeliveryMethod('STORE_PICKUP')}
                    className={`flex-1 flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${deliveryMethod === 'STORE_PICKUP' ? 'border-[#CD2C58] bg-[#FFE6D4]/30' : 'border-gray-200'}`}
                  >
                    <input type="radio" checked={deliveryMethod === 'STORE_PICKUP'} readOnly className="text-[#CD2C58] focus:ring-[#CD2C58]" />
                    <span className="font-semibold text-gray-700 text-sm">Store Pickup</span>
                  </label>
                </div>
              </div>

              {deliveryMethod === 'DELIVERY' && (
                <>
                  <div className="col-span-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input 
                      type="text" 
                      value={address.street} 
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" 
                      value={address.city} 
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input 
                      type="text" 
                      value={address.zip} 
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-[#CD2C58]" 
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-6">
              <button 
                onClick={() => setStep(1)}
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
              >
                Back
              </button>
              <button 
                onClick={() => setStep(3)}
                className="bg-[#CD2C58] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Payment & Backend Order Creation */}
        {step === 3 && (
          <div className="p-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Details</h2>
            <p className="text-gray-500 mb-8 flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Standard Mock Payment Gateway connected to PostgreSQL backend.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
              <div className="space-y-2 mb-6 text-sm border-b border-gray-200 pb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Rental Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee:</span>
                  <span className="font-semibold text-gray-900">₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Refundable Deposit:</span>
                  <span className="font-semibold text-gray-900">₹{deposit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-gray-900 pt-2">
                  <span>Total Payable:</span>
                  <span className="text-[#CD2C58]">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <div className="relative">
                  <input type="text" defaultValue="4242 4242 4242 4242" className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 pl-12 text-sm focus:outline-none focus:border-[#CD2C58]" />
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="text" defaultValue="12/28" className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-[#CD2C58]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                  <input type="text" defaultValue="123" className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-[#CD2C58]" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-gray-200 pt-6">
              <button 
                onClick={() => setStep(2)}
                disabled={placingOrder}
                className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
              >
                Back
              </button>
              <button 
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="bg-[#CD2C58] text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20 disabled:opacity-50"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Processing Payment...
                  </>
                ) : (
                  'Pay & Confirm Order'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="p-12 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Order Confirmed!</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm">
              Your rental order <span className="font-bold text-gray-900">#{createdOrder?.order_number || createdOrder?.id?.slice(0, 8)}</span> has been successfully processed and saved into PostgreSQL backend database.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/orders" className="bg-gray-100 text-gray-900 text-sm font-semibold px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors">
                View My Orders
              </Link>
              <Link href="/" className="bg-[#CD2C58] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#E06B80] transition-colors shadow-md shadow-[#CD2C58]/20">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
