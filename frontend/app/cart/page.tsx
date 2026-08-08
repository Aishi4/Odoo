import React from 'react';

export default function Cart() {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Shopping Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Cart Items */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=200&q=80" alt="Chair" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Premium Office Chair</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Variant: Black</p>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
                  <button style={{ padding: '0 0.5rem' }}>-</button>
                  <span style={{ padding: '0 0.5rem', fontSize: '0.875rem' }}>1</span>
                  <button style={{ padding: '0 0.5rem' }}>+</button>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Rental Period: 1 Day</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>$15.00</div>
              <button style={{ color: 'var(--danger-color)', fontSize: '0.875rem', fontWeight: 500 }}>Remove</button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontWeight: 500 }}>$15.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Delivery Fee</span>
              <span style={{ fontWeight: 500 }}>$5.00</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Security Deposit</span>
              <span style={{ fontWeight: 500 }}>$50.00</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 700 }}>
            <span>Total</span>
            <span>$70.00</span>
          </div>

          <a href="/checkout" className="btn-primary" style={{ width: '100%', textAlign: 'center' }}>Proceed to Checkout</a>
        </div>

      </div>
    </div>
  );
}
