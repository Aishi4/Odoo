"use client";

import React from 'react';
import { Search, Plus, Filter, LayoutGrid, LayoutList } from 'lucide-react';

const mockUsers = [
  { id: 'U001', name: 'Admin User', email: 'admin@odoo.local', role: 'Administrator', status: 'Active' },
  { id: 'U002', name: 'Store Manager', email: 'manager@odoo.local', role: 'Internal User', status: 'Active' },
  { id: 'U003', name: 'Vendor A', email: 'vendor@external.com', role: 'Portal', status: 'Inactive' },
];

export default function UsersPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)]">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system access and roles.</p>
        </div>
        
        <button className="px-4 py-2 bg-[#CD2C58] text-white font-medium rounded-md shadow-sm hover:bg-[#b02248] flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> New User
        </button>
      </div>

      <div className="bg-white p-3 rounded-t-xl border border-gray-200 border-b-0 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#CD2C58] focus:border-[#CD2C58]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-12"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Login Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4"><input type="checkbox" className="rounded border-gray-300 text-[#CD2C58] focus:ring-[#CD2C58]" /></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 text-gray-600">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
                      ${user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}
                    `}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
