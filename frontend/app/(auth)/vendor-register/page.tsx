import React from 'react';

export default function VendorRegister() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Become a Vendor</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Join our marketplace and start renting your products.</p>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>First Name</label>
              <input type="text" className="input-field" placeholder="John" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Last Name</label>
              <input type="text" className="input-field" placeholder="Doe" required />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Company Name</label>
              <input type="text" className="input-field" placeholder="Acme Rentals" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>GST No (Optional)</label>
              <input type="text" className="input-field" placeholder="GST12345678" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Product Category</label>
            <select className="input-field" required style={{ appearance: 'auto' }}>
              <option value="">Select Category</option>
              <option value="electronics">Electronics</option>
              <option value="furniture">Furniture</option>
              <option value="vehicles">Vehicles</option>
              <option value="apparel">Apparel</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
            <input type="email" className="input-field" placeholder="vendor@example.com" required />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
              <input type="password" className="input-field" placeholder="Create a password" required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm Password</label>
              <input type="password" className="input-field" placeholder="Confirm password" required />
            </div>
          </div>
          
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Register as Vendor</button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Log In</a>
        </div>
      </div>
    </div>
  );
}
