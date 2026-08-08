import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)] text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Odoo Rentals</h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
        We provide premium equipment for professionals and creators. From high-end cameras to ergonomic office furniture, we've got you covered.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#CD2C58] mb-2">Quality First</h3>
          <p className="text-gray-600">Every item in our inventory is strictly maintained and quality checked before each rental.</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#CD2C58] mb-2">Flexible Terms</h3>
          <p className="text-gray-600">Rent for a day, a week, or a month. Our system scales with your exact needs.</p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <h3 className="text-lg font-bold text-[#CD2C58] mb-2">Support</h3>
          <p className="text-gray-600">24/7 dedicated support for all our active renters to ensure your projects run smoothly.</p>
        </div>
      </div>
    </div>
  );
}
