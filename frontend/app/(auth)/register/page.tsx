import React from 'react';

export default function Register() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>Create an Account</h1>
        
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
            <input type="email" className="input-field" placeholder="Enter your email" required />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
            <input type="password" className="input-field" placeholder="Create a password" required />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Must be 6-12 chars, 1 uppercase, 1 lowercase, 1 special character.</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm Password</label>
            <input type="password" className="input-field" placeholder="Confirm your password" required />
          </div>
          
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Register</button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span>Already have an account? <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Log In</a></span>
          <span><a href="/vendor-register" style={{ color: 'var(--text-primary)', fontWeight: 500, textDecoration: 'underline' }}>Become a vendor</a></span>
        </div>
      </div>
    </div>
  );
}
