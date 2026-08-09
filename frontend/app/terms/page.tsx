import React from 'react';
import Link from 'next/link';
import { 
  FileText, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  HelpCircle,
  Lock,
  Scale
} from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20 space-y-12">
      
      {/* Header */}
      <section className="bg-gradient-to-r from-gray-950 via-[#721530] to-[#CD2C58] text-white py-16 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-yellow-300 border border-white/20">
            <Scale className="w-4 h-4 text-yellow-300" /> Official Legal Framework
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight">Terms & Conditions of Service</h1>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl">
            Please read these terms carefully before initiating any rental transaction on Odoo Rentals. Last updated: August 2026.
          </p>
        </div>
      </section>

      {/* Main Content & Sidebar Container */}
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Table of Contents Sidebar */}
        <div className="lg:col-span-1 space-y-4 sticky top-20 self-start hidden lg:block">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#CD2C58]" /> Sections Index
            </div>
            <nav className="space-y-2 text-xs font-semibold text-gray-600">
              <a href="#rental-agreements" className="block hover:text-[#CD2C58] transition-colors">1. Rental Agreements</a>
              <a href="#security-deposits" className="block hover:text-[#CD2C58] transition-colors">2. Security Deposits</a>
              <a href="#late-returns" className="block hover:text-[#CD2C58] transition-colors">3. Late Fees & Return Policy</a>
              <a href="#equipment-liability" className="block hover:text-[#CD2C58] transition-colors">4. Equipment Damage & Theft</a>
              <a href="#cancellations" className="block hover:text-[#CD2C58] transition-colors">5. Cancellations & Refunds</a>
              <a href="#privacy" className="block hover:text-[#CD2C58] transition-colors">6. Data & Account Security</a>
            </nav>
          </div>

          <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 text-xs text-pink-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-[#CD2C58]">
              <HelpCircle className="w-4 h-4" /> Need Clarification?
            </div>
            <p className="text-[11px] leading-relaxed">Our legal & compliance team is available to address any questions regarding these terms.</p>
            <Link href="/contact" className="inline-block text-[#CD2C58] font-bold hover:underline text-[11px]">
              Contact Support →
            </Link>
          </div>
        </div>

        {/* Legal Text Body */}
        <div className="lg:col-span-3 space-y-10 bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm">
          
          {/* Important Notice Callout */}
          <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Important Notice:</span>
              <p className="text-amber-800 leading-relaxed text-xs">
                By placing an order or checking out on Odoo Rentals, you explicitly accept these binding terms, including security deposit holding rights and late return deduction rules.
              </p>
            </div>
          </div>

          {/* Section 1 */}
          <section id="rental-agreements" className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-pink-100 text-[#CD2C58] text-xs font-black flex items-center justify-center">1</span>
              Rental Agreements & Fulfillment
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              All rental reservations placed through the platform begin on the scheduled pickup/delivery date and expire on the designated return date. The renter agrees to inspect all received hardware immediately upon pickup or delivery and report any pre-existing damage within <strong>2 hours of receipt</strong>.
            </p>
          </section>

          {/* Section 2 */}
          <section id="security-deposits" className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 text-xs font-black flex items-center justify-center">2</span>
              Security Deposit Policies
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              A security deposit is calculated during checkout based on product category and baseline equipment value. The security deposit is held in a protected escrow account during the active rental period.
            </p>
            
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-1">
              <div className="font-bold flex items-center gap-2 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Automatic Refund Guarantee
              </div>
              <p className="text-emerald-700 leading-relaxed text-xs">
                Upon return of the rented item in verified undamaged condition, the security deposit is released automatically back to your original payment method within 1-3 business days.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="late-returns" className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 text-xs font-black flex items-center justify-center">3</span>
              Late Returns & Penalty Calculations
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Rentals not returned by the scheduled return time disrupt upcoming customer bookings. Overdue returns accrue a daily late fee rate calculated based on the daily rental value. If an item is unreturned after <strong>72 hours</strong> beyond the schedule date, it will be classified as unreturned, and the full security deposit will be forfeited.
            </p>
          </section>

          {/* Section 4 */}
          <section id="equipment-liability" className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 text-xs font-black flex items-center justify-center">4</span>
              Equipment Damage & Loss Liability
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              The renter assumes full custody and responsibility for the physical safety of all rented items. In the event of minor physical damage, repair charges will be assessed by authorized technicians and deducted from the held deposit.
            </p>
          </section>

          {/* Section 5 */}
          <section id="cancellations" className="space-y-3 pt-4 border-t border-gray-100">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">5</span>
              Cancellations & Refund Policies
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cancellations initiated at least <strong>24 hours prior to the scheduled pickup time</strong> receive a 100% full refund. Cancellations made within 24 hours of pickup may incur a 15% restocking fee.
            </p>
          </section>

          {/* Footer Callout */}
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-gray-500">
            <span>Questions regarding terms or billing policies?</span>
            <Link href="/contact" className="font-bold text-[#CD2C58] hover:underline">
              Contact Legal & Billing Team →
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
