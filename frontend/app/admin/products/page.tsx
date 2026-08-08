"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, LayoutGrid, LayoutList, RefreshCw, Trash2, CheckCircle2 } from 'lucide-react';
import { catalogApi } from '@/lib/api';

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [message, setMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await catalogApi.getProducts();
    setLoading(false);
    if (res.success && Array.isArray(res.data)) {
      setProducts(res.data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate product "${name}"?`)) return;
    
    const res = await catalogApi.deleteProduct(id);
    if (res.success) {
      setMessage(`Product "${name}" deactivated successfully.`);
      fetchProducts();
      setTimeout(() => setMessage(null), 3000);
    } else {
      alert(res.message || 'Failed to deactivate product.');
    }
  };

  const activeCount = products.filter(p => (p.status || 'ACTIVE') === 'ACTIVE').length;
  const inactiveCount = products.filter(p => (p.status || 'ACTIVE') === 'INACTIVE').length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    
    const productStatus = p.status || (p.is_active !== false ? 'ACTIVE' : 'INACTIVE');
    const matchesStatus = statusFilter === 'ALL' || productStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Showing {filteredProducts.length} items ({activeCount} Active, {inactiveCount} Inactive in PostgreSQL database).</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={fetchProducts}
            className="px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <Link href="/admin/products/new" className="px-4 py-2 bg-[#CD2C58] text-white text-sm font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Create Product
          </Link>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span>{message}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white focus:ring-1 focus:ring-[#CD2C58]"
          >
            <option value="ACTIVE">ACTIVE Products ({activeCount})</option>
            <option value="INACTIVE">INACTIVE Products ({inactiveCount})</option>
            <option value="ALL">All Records ({products.length})</option>
          </select>
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
        {loading ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Loading products from PostgreSQL database...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No products found matching criteria.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const statusStr = product.status || (product.is_active !== false ? 'ACTIVE' : 'INACTIVE');
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                  <div className="h-48 bg-gray-100 relative">
                    <img src={product.image_url || 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&q=80'} alt={product.name} className="w-full h-full object-cover p-2 group-hover:scale-105 transition-transform duration-300" />
                    <span className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${statusStr === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                      {statusStr}
                    </span>
                  </div>
                  <div className="p-4 border-t border-gray-100 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm truncate pr-2">{product.name}</h3>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{product.description || 'No description'}</p>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                      <span className="font-bold text-[#CD2C58] text-sm">₹{product.base_price || 0}</span>
                      {statusStr === 'ACTIVE' && (
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                          title="Deactivate Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Base Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const statusStr = product.status || (product.is_active !== false ? 'ACTIVE' : 'INACTIVE');
                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{product.name}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{product.description || '-'}</td>
                      <td className="px-6 py-4 font-bold text-[#CD2C58] text-right">₹{product.base_price || 0}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${statusStr === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}>
                          {statusStr}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {statusStr === 'ACTIVE' && (
                          <button 
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                            title="Deactivate Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
