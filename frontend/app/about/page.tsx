import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Clock, 
  Headphones, 
  Award, 
  Sparkles, 
  Truck, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Layers,
  HeartHandshake
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-950 via-[#721530] to-[#CD2C58] text-white py-20 px-6 relative overflow-hidden">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-yellow-300 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" /> Pioneering Next-Gen Equipment Rentals
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Empowering Creators & Businesses <br className="hidden sm:inline" /> With Flexible Rentals
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-normal leading-relaxed">
            At Odoo Rentals, we bridge the gap between high-end gear and your biggest ideas. Rent premium cameras, event hardware, tech equipment, and office essentials seamlessly.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link 
              href="/product" 
              className="px-8 py-4 bg-[#CD2C58] hover:bg-[#b02248] text-white font-bold rounded-2xl shadow-lg shadow-[#CD2C58]/30 transition-all flex items-center gap-2"
            >
              Explore Equipment Catalog <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl transition-all"
            >
              Contact Our Team
            </Link>
          </div>
        </div>

        {/* Glow Effects */}
        <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Statistics Banner */}
      <section className="max-w-6xl mx-auto px-6 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1 border-r border-gray-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-black text-[#CD2C58]">10,000+</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Verified Equipment Items</div>
          </div>
          <div className="space-y-1 border-r border-gray-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-black text-purple-700">99.8%</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">On-Time Pickup Rate</div>
          </div>
          <div className="space-y-1 border-r border-gray-100 last:border-none">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">50,000+</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Successful Rentals</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-amber-600">24 / 7</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Renter Support</div>
          </div>
        </div>
      </section>

      {/* Our Core Pillars */}
      <section className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Why Rent With Odoo Rentals?</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            We hold ourselves to the highest standards in hardware maintenance, logistical speed, and customer protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 bg-pink-100 text-[#CD2C58] rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Strict Quality Inspections</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Every single piece of hardware undergoes a 15-point diagnostic check before being sanitized and packaged for pickup or delivery.
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-bold">
              <Clock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Flexible Duration Terms</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Whether you need gear for a 1-day shoot, a 1-week event, or a multi-month project, our rental tiers adapt dynamically to your schedule.
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Dedicated Support Team</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Our expert technicians are on standby around the clock to troubleshoot setup issues, handle extension requests, or assist in emergencies.
            </p>
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-[#CD2C58] rounded-full text-xs font-bold">
              <HeartHandshake className="w-4 h-4" /> Our Fundamental Mission
            </div>
            <h2 className="text-3xl font-black text-gray-900 leading-tight">
              Democratizing Access to World-Class Technology
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We believe that expensive upfront hardware costs should never hold back creative visionaries or growing enterprises. By maintaining a transparent, multi-vendor rental marketplace, we empower professionals to rent top-tier equipment at a fraction of the purchase price.
            </p>

            <ul className="space-y-3">
              {[
                "Transparent security deposit calculations with instant post-inspection refunds.",
                "Real-time inventory management with guaranteed availability windows.",
                "Curated marketplace featuring top industry brands and verified vendors.",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs font-medium text-gray-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-[#CD2C58] to-purple-800 p-8 rounded-3xl text-white space-y-6 shadow-xl">
            <h3 className="text-2xl font-black">Join Thousands of Satisfied Creators</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              From corporate events to indie film sets, Odoo Rentals provides the hardware foundation you need to deliver excellence.
            </p>
            
            <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold">
              <span>Ready to book your next rental?</span>
              <Link href="/product" className="px-4 py-2 bg-white text-[#CD2C58] rounded-xl hover:bg-gray-100 transition-colors">
                Browse Products →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
