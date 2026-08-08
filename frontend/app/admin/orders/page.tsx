import React from 'react';

export default function AdminOrders() {
  const orders = [
    { ref: 'SO00010', customer: 'John Doe', status: 'Picked Up', total: '$150.00', invoice: 'Invoiced' },
    { ref: 'SO00011', customer: 'Jane Smith', status: 'Reserved', total: '$45.00', invoice: 'Nothing to Invoice' },
    { ref: 'SO00012', customer: 'Acme Corp', status: 'Late Return', total: '$300.00', invoice: 'Confirmed' },
    { ref: 'SO00013', customer: 'Bob Johnson', status: 'Quotation Sent', total: '$80.00', invoice: 'Nothing to Invoice' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Picked Up': return 'var(--success-color)';
      case 'Late Return': return 'var(--danger-color)';
      case 'Reserved': return 'var(--primary-color)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Rental Orders</h1>
        <button className="btn-primary">Create Order</button>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Order Ref</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Customer</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Total</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Invoice Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{order.ref}</td>
                <td style={{ padding: '1rem 1.5rem' }}>{order.customer}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ 
                    backgroundColor: `${getStatusColor(order.status)}20`, 
                    color: getStatusColor(order.status),
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {order.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{order.total}</td>
                <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{order.invoice}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
