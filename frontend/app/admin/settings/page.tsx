import React from 'react';

export default function AdminSettings() {
  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Settings</h1>
        <button className="btn-primary">Save Changes</button>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Late Fees & Returns</h2>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <input type="checkbox" defaultChecked style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--primary-color)' }} />
          <div>
            <div style={{ fontWeight: 600 }}>Enable Late Fee / Overdue Penalty</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Automatically calculate late fees upon delayed return.</div>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Default Late Fee Rate (per hour)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '200px' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 500 }}>$</span>
            <input type="number" className="input-field" defaultValue="10" />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>System Configuration</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <a href="#" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Attributes & Variants</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage colors, sizes, brands.</div>
            </div>
            <span style={{ color: 'var(--primary-color)' }}>Manage &rarr;</span>
          </a>
          
          <a href="#" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Pricelists</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Manage discounts and specific pricing rules.</div>
            </div>
            <span style={{ color: 'var(--primary-color)' }}>Manage &rarr;</span>
          </a>

          <a href="#" style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>Quotation Templates</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Configure default quotation formats.</div>
            </div>
            <span style={{ color: 'var(--primary-color)' }}>Manage &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  );
}
