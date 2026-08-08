"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, Trash2, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

export default function NewOrderPage() {
  const [status, setStatus] = useState('Quotation');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  
  const [orderLines, setOrderLines] = useState([
    { id: 1, product: '', description: '', qty: 1, unitPrice: 0, taxes: '18%', subtotal: 0 }
  ]);

  const addOrderLine = () => {
    setOrderLines([...orderLines, { id: Date.now(), product: '', description: '', qty: 1, unitPrice: 0, taxes: '18%', subtotal: 0 }]);
  };

  const removeOrderLine = (id: number) => {
    setOrderLines(orderLines.filter(line => line.id !== id));
  };

  const statuses = ['Quotation', 'Quotation Sent', 'Sale Order'];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 flex flex-col">
      {/* Top Action Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">New Quotation</h1>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Unsaved</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 transition-colors">
            Discard
          </button>
          <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Status Pipeline */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={() => setStatus('Quotation Sent')}
                className="px-3 py-1.5 bg-white border border-[#CD2C58] text-[#CD2C58] text-sm font-medium rounded hover:bg-[#FFE6D4] transition-colors"
              >
                Send by Email
              </button>
              <button 
                onClick={() => setStatus('Sale Order')}
                className="px-3 py-1.5 bg-[#CD2C58] text-white text-sm font-medium rounded hover:bg-[#b02248] transition-colors"
              >
                Confirm
              </button>
            </div>
            
            <div className="flex items-center">
              {statuses.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div 
                    onClick={() => setStatus(s)}
                    className={`cursor-pointer px-4 py-1.5 text-sm font-semibold uppercase tracking-wide
                      ${status === s 
                        ? 'text-[#CD2C58]' 
                        : statuses.indexOf(status) > i 
                          ? 'text-gray-500' 
                          : 'text-gray-400'
                      }`}
                  >
                    {s}
                  </div>
                  {i < statuses.length - 1 && (
                    <div className="w-4 h-px bg-gray-300 mx-1"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            {/* Top Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-10">
              
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Customer</label>
                  <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]">
                    <option value="">Select a customer...</option>
                    <option value="1">John Doe</option>
                    <option value="2">Acme Corp</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Invoice Address</label>
                  <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]">
                    <option value="">Select invoice address...</option>
                  </select>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price List</label>
                  <select className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]">
                    <option value="public">Public Pricelist (INR)</option>
                    <option value="b2b">B2B Wholesale</option>
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Pickup Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal border-gray-300 ${!startDate && "text-gray-500"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Return Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal border-gray-300 ${!endDate && "text-gray-500"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Lines Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex space-x-8">
                <a href="#" className="border-b-2 border-[#CD2C58] py-2 px-1 text-sm font-bold text-[#CD2C58]">
                  Order Lines
                </a>
                <a href="#" className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Other Info
                </a>
              </nav>
            </div>

            {/* Order Lines Table */}
            <div className="overflow-x-auto min-h-[200px]">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 font-semibold border-b-2 border-gray-200">
                  <tr>
                    <th className="py-3 px-2 w-1/3">Product</th>
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2 text-right w-24">Quantity</th>
                    <th className="py-3 px-2 text-right w-28">Unit Price</th>
                    <th className="py-3 px-2 text-right w-24">Taxes</th>
                    <th className="py-3 px-2 text-right w-28">Subtotal</th>
                    <th className="py-3 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orderLines.map((line) => (
                    <tr key={line.id} className="group">
                      <td className="py-2 px-2">
                        <input type="text" placeholder="Search product..." className="w-full border-0 border-b border-transparent group-hover:border-gray-300 focus:border-[#CD2C58] focus:ring-0 bg-transparent py-1 text-gray-900 font-medium" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" className="w-full border-0 border-b border-transparent group-hover:border-gray-300 focus:border-[#CD2C58] focus:ring-0 bg-transparent py-1 text-gray-600" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="number" defaultValue={line.qty} className="w-full text-right border-0 border-b border-transparent group-hover:border-gray-300 focus:border-[#CD2C58] focus:ring-0 bg-transparent py-1 text-gray-900" />
                      </td>
                      <td className="py-2 px-2">
                        <input type="text" defaultValue={`₹ ${line.unitPrice}`} className="w-full text-right border-0 border-b border-transparent group-hover:border-gray-300 focus:border-[#CD2C58] focus:ring-0 bg-transparent py-1 text-gray-900" />
                      </td>
                      <td className="py-2 px-2">
                        <select className="w-full text-right border-0 border-b border-transparent group-hover:border-gray-300 focus:border-[#CD2C58] focus:ring-0 bg-transparent py-1 text-gray-600 appearance-none text-sm">
                          <option>{line.taxes}</option>
                          <option>0%</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-gray-900">
                        ₹{line.subtotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <button onClick={() => removeOrderLine(line.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={7} className="py-3 px-2">
                      <button onClick={addOrderLine} className="text-[#CD2C58] font-semibold text-sm hover:underline flex items-center gap-1">
                        <Plus className="w-4 h-4" /> Add a product
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Totals Section */}
            <div className="flex justify-end mt-8 border-t border-gray-200 pt-6">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Untaxed Amount:</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Taxes:</span>
                  <span className="font-semibold">₹0.00</span>
                </div>
                <div className="flex justify-between text-xl text-gray-900 font-bold border-t border-gray-200 pt-3 mt-3">
                  <span>Total:</span>
                  <span>₹0.00</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
