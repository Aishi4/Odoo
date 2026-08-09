"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authApi.forgotPassword(email);
      setLoading(false);

      if (res.success) {
        setSuccessMsg(res.message || 'Password reset link has been sent to your email address.');
      } else {
        setError(res.message || 'Failed to request password reset. Please verify your email.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[550px]">
        
        {/* Left */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
            <p className="text-gray-500">Enter your email address and we'll send you instructions to reset your password.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" 
                  placeholder="name@example.com" 
                  required 
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-[#CD2C58] text-white rounded-xl font-bold hover:bg-[#E06B80] transition-colors shadow-lg shadow-[#CD2C58]/30 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Sending Link...
                </>
              ) : (
                <>
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="font-bold text-[#CD2C58] hover:underline">
              Log In
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="w-full md:w-1/2 bg-[#FFE6D4] p-12 hidden md:flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-2xl font-black text-[#CD2C58] tracking-tight mb-8">Odoo Rentals</div>
            <h2 className="text-4xl font-black text-[#CD2C58] leading-tight mb-4">
              Account Security & Access.
            </h2>
            <p className="text-[#E06B80] text-lg font-medium">
              We help you safely recover access to your account in seconds.
            </p>
          </div>

          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#FFC69D] rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#E06B80] rounded-full blur-3xl opacity-20"></div>
        </div>

      </div>
    </div>
  );
}
