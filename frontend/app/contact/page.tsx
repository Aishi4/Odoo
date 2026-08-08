import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 min-h-[calc(100vh-5rem)]">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-600 mb-8">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input type="email" className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
            <textarea rows={5} className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#CD2C58]"></textarea>
          </div>
          <button type="button" className="w-full bg-[#CD2C58] text-white font-bold py-3 px-4 rounded-lg hover:bg-[#b02248] transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
