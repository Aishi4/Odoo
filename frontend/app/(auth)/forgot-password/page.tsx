import React from 'react';

export default function ForgotPassword() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '1rem', textAlign: 'center' }}>Reset Password</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
            <input type="email" className="input-field" placeholder="Enter your email" required />
          </div>
          
          <button type="button" className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>Send Reset Link</button>
        </form>
        
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Remember your password? <a href="/login" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Log In</a>
        </div>
      </div>
    </div>
  );
}
