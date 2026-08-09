"use client";

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Camera, Save, CheckCircle2, AlertCircle, Shield, Building, Mail, MapPin } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      const res = await authApi.getProfile();
      setLoading(false);

      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || '');
        setProfileImage(res.data.profile_image || '');
        setAddress(res.data.address || '');
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const res = await authApi.updateProfile({
      name: name.trim(),
      profile_image: profileImage.trim(),
      address: address.trim(),
    });

    setSaving(false);

    if (res.success && res.data) {
      setProfile(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('userUpdated'));
      setMessage({ type: 'success', text: 'Vendor & Admin profile credentials updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 text-sm">
        Loading admin profile details...
      </div>
    );
  }

  const isVendor = profile?.role === 'VENDOR';

  return (
    <div className="p-6 max-w-[1200px] mx-auto min-h-[calc(100vh-3.5rem)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isVendor ? 'Vendor Partner Profile & Organization' : 'Admin Profile & System Credentials'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your administrative contact details, business credentials, and avatar within the Odoo Workspace.
          </p>
        </div>

        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          profile?.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
          profile?.role === 'VENDOR' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
          'bg-emerald-100 text-emerald-800 border border-emerald-300'
        }`}>
          Role: {profile?.role || 'ADMIN'}
        </span>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Profile Form Card */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-8 flex flex-col md:flex-row gap-10 items-start">
        
        {/* Profile Avatar Upload */}
        <div className="flex flex-col items-center shrink-0 w-full md:w-56 space-y-4">
          <label className="relative group cursor-pointer">
            <div className="w-40 h-40 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl flex items-center justify-center text-[#CD2C58] font-bold text-4xl shadow-md overflow-hidden border-4 border-white group-hover:shadow-lg transition-all">
              {profileImage ? (
                <img src={profileImage} alt={name} className="w-full h-full object-cover" />
              ) : name ? (
                name.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="w-12 h-12 text-[#CD2C58]" />
              )}

              <div className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-xs font-bold">
                <Camera className="w-6 h-6 text-white" />
                <span>Change Image</span>
              </div>
            </div>

            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (reader.result) {
                      setProfileImage(reader.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>

          <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 cursor-pointer transition-all flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#CD2C58]" /> Upload Photo
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    if (reader.result) {
                      setProfileImage(reader.result as string);
                    }
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </label>

          {profileImage && (
            <button
              type="button"
              onClick={() => setProfileImage('')}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              Remove Image
            </button>
          )}
        </div>

        {/* Form Details */}
        <form onSubmit={handleSave} className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                {isVendor ? 'Business / Vendor Name' : 'Administrator Name'}
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58] text-gray-900 font-bold text-sm" 
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                System Access Privileges
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
                <input 
                  type="text" 
                  value={profile?.role || 'ADMIN'} 
                  disabled 
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email Address (Login ID)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl font-bold text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {isVendor ? 'Company HQ & Dispatch Warehouse Address' : 'Administrative Office Address'}
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <textarea 
                rows={3}
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, City, Zipcode..." 
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#CD2C58] font-medium" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#CD2C58] text-white font-bold text-sm rounded-xl shadow-xs hover:bg-[#b02248] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> Save Profile Credentials
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
