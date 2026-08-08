import React from 'react';

export default function AdminProducts() {
  const products = [
    { name: 'Premium Office Chair', type: 'Goods', price: '$15.00/day', status: 'Published', quantity: 45 },
    { name: 'MacBook Pro 16"', type: 'Goods', price: '$45.00/day', status: 'Unpublished', quantity: 12 },
    { name: 'Delivery Service', type: 'Service', price: '$5.00', status: 'Published', quantity: '-' },
    { name: 'Late Fees Penalty', type: 'Service', price: '$10.00/hour', status: 'Published', quantity: '-' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Products</h1>
        <button className="btn-primary">Add Product</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Qty On Hand</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.name}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{p.type}</td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.price}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{p.quantity}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    backgroundColor: p.status === 'Published' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', 
                    color: p.status === 'Published' ? 'var(--success-color)' : 'var(--danger-color)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
