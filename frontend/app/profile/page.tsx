"use client";

import React, { useState, useEffect } from 'react';
import { User as UserIcon, Loader2, CheckCircle2, AlertCircle, Camera, MapPin, Mail, Save } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const res = await authApi.getProfile();
      setLoading(false);

      if (res.success && res.data) {
        setProfile(res.data);
        setName(res.data.name || '');
        setProfileImage(res.data.profile_image || '');
        setAddress(res.data.address || '');
      } else {
        // Fallback to localStorage user if available
        const localUser = localStorage.getItem('user');
        if (localUser) {
          try {
            const parsed = JSON.parse(localUser);
            setProfile(parsed);
            setName(parsed.name || '');
            setProfileImage(parsed.profile_image || '');
            setAddress(parsed.address || '');
          } catch (e) {}
        }
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Full name cannot be empty.' });
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
      setMessage({ type: 'success', text: 'Profile & avatar image updated successfully in database!' });
      setTimeout(() => setMessage(null), 3000);
    } else {
      setMessage({ type: 'error', text: res.message || 'Failed to update profile image.' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center text-gray-500 min-h-[calc(100vh-5rem)]">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#CD2C58]" />
        Loading your profile details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">My Profile & Account Settings</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-xl text-sm flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col md:flex-row gap-12">
        {/* Avatar Section */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-36 h-36 bg-[#FFE6D4] rounded-full flex items-center justify-center text-[#CD2C58] mb-4 font-bold text-3xl shadow-md overflow-hidden relative group border-4 border-white">
            {profileImage ? (
              <img src={profileImage} alt={name} className="w-full h-full object-cover" />
            ) : name ? (
              name.charAt(0).toUpperCase()
            ) : (
              <UserIcon className="w-12 h-12" />
            )}
          </div>
          
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 uppercase tracking-wider mb-2">
            {profile?.role || 'CUSTOMER'}
          </span>
          <span className="text-xs text-gray-400">PostgreSQL ID: #{profile?.id ? profile.id.slice(0, 8) : 'USER'}</span>
        </div>
        
        {/* Form Details */}
        <form onSubmit={handleSave} className="flex-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58] text-gray-900 font-medium" 
                placeholder="e.g. Shovon Halder"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Account Role</label>
              <input 
                type="text" 
                value={profile?.role || 'CUSTOMER'} 
                disabled 
                className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg py-2.5 px-4 font-bold text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Profile Image URL</label>
            <div className="relative">
              <Camera className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="url" 
                value={profileImage} 
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://images.unsplash.com/..." 
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" 
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter a direct image link to update your avatar photo.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Shipping & Delivery Address</label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <textarea 
                rows={3}
                value={address} 
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street name, City, Zipcode..." 
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                value={profile?.email || ''} 
                disabled 
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-sm" 
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={saving}
            className="bg-[#CD2C58] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#b02248] transition-colors mt-8 flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile & Avatar
          </button>
        </form>
      </div>
    </div>
  );
}
