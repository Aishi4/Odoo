"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, Filter, LayoutGrid, LayoutList, Download } from 'lucide-react';

const mockProducts = [
  { id: 'P001', name: 'Premium Office Chair', category: 'Furniture', stock: 15, rentPrice: '₹15/day', status: 'Available', img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80' },
  { id: 'P002', name: 'MacBook Pro 16"', category: 'Electronics', stock: 5, rentPrice: '₹850/day', status: 'Available', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' },
  { id: 'P003', name: 'Canon EOS R5', category: 'Photography', stock: 0, rentPrice: '₹1200/day', status: 'Out of Stock', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80' },
  { id: 'P004', name: 'Standing Desk', category: 'Furniture', stock: 8, rentPrice: '₹40/day', status: 'Available', img: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=500&q=80' },
  { id: 'P005', name: 'Sony A7S III', category: 'Photography', stock: 2, rentPrice: '₹950/day', status: 'Low Stock', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80' },
];

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your rental inventory and pricing.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <Link href="/admin/products/new" className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Create Product
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dynamic View Area */}
      <div className={`bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden ${viewMode === 'grid' ? 'p-6 bg-gray-50/50' : ''}`}>
        
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                <div className="h-48 bg-gray-100 relative">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover mix-blend-multiply p-4 group-hover:scale-105 transition-transform duration-300" />
                  <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
                    ${product.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : ''}
                    ${product.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : ''}
                    ${product.status === 'Out of Stock' ? 'bg-red-100 text-red-700' : ''}
                  `}>
                    {product.status}
                  </span>
                </div>
                <div className="p-4 border-t border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-gray-900 text-sm truncate pr-2">{product.name}</h3>
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{product.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{product.category}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-[#CD2C58] text-sm">{product.rentPrice}</span>
                    <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">Stock: {product.stock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></th>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Internal Reference</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-right">Rent Price</th>
                  <th className="px-6 py-4 text-right">Stock</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {mockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer">
                    <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                        <img src={product.img} alt={product.name} className="w-8 h-8 object-contain" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-500">{product.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 font-bold text-[#CD2C58] text-right">{product.rentPrice}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-right">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
                        ${product.status === 'Available' ? 'bg-emerald-100 text-emerald-700' : ''}
                        ${product.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' : ''}
                        ${product.status === 'Out of Stock' ? 'bg-red-100 text-red-700' : ''}
                      `}>
                        {product.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
