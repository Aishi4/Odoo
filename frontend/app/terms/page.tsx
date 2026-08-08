import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
      <div className="prose prose-gray max-w-none text-gray-600 space-y-6">
        <p>Welcome to Odoo Rentals. By accessing and using our rental platform, you agree to comply with and be bound by the following terms and conditions.</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Rental Agreements</h2>
        <p>All rental periods begin on the specified pickup date and end on the designated return date. Late returns may be subject to additional fees as determined by the global system settings.</p>
        
        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Security Deposits</h2>
        <p>A security deposit may be required prior to the release of any equipment. This deposit is fully refundable upon the safe and undamaged return of the rented items.</p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Liability</h2>
        <p>The renter assumes full responsibility for any loss, damage, or theft of the equipment during the rental period. Odoo Rentals is not liable for any indirect damages arising from the use of our equipment.</p>
      </div>
    </div>
  );
}
