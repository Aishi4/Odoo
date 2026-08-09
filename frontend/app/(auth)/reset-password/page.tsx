"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, ArrowRight, AlertCircle, CheckCircle2, Loader2, KeyRound } from 'lucide-react';
import { authApi } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token.trim()) {
      setError('Password reset token is required.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword(token.trim(), newPassword);
      setLoading(false);

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || 'Failed to reset password. The token may be invalid or expired.');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
      
      {/* Left */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-500">Enter your reset token and enter a strong new password for your account.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold text-emerald-900">Password Reset Successfully!</h3>
            <p className="text-sm text-emerald-700">
              Your password has been updated. You can now sign in using your new credentials.
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#CD2C58] text-white font-bold rounded-xl hover:bg-[#E06B80] transition-colors shadow-md"
            >
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reset Token</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 text-sm font-mono focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" 
                  placeholder="Paste your reset token here" 
                  required 
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" 
                  placeholder="At least 6 characters" 
                  required 
                  minLength={6}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 pl-12 text-sm focus:outline-none focus:border-[#CD2C58] focus:ring-1 focus:ring-[#CD2C58] focus:bg-white transition-all" 
                  placeholder="Re-enter new password" 
                  required 
                  minLength={6}
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 bg-[#CD2C58] text-white rounded-xl font-bold hover:bg-[#E06B80] transition-colors shadow-lg shadow-[#CD2C58]/30 flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Resetting Password...
                </>
              ) : (
                <>
                  Update Password <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

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
            Security First.
          </h2>
          <p className="text-[#E06B80] text-lg font-medium">
            Keep your account safe by setting strong, unique passwords.
          </p>
        </div>

        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[#FFC69D] rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[#E06B80] rounded-full blur-3xl opacity-20"></div>
      </div>

    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-gray-50">
      <Suspense fallback={
        <div className="flex items-center justify-center p-12 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#CD2C58] mr-3" /> Loading reset form...
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
