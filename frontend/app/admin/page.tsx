import React from 'react';

export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Total Revenue</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--primary-color)' }}>₹24,500</div>
          <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginTop: '0.5rem' }}>+12% from last month</div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Active Rentals</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>142</div>
          <div style={{ color: 'var(--success-color)', fontSize: '0.875rem', marginTop: '0.5rem' }}>+5% from last month</div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Products Available</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700 }}>890</div>
        </div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>Late Returns</div>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--danger-color)' }}>12</div>
          <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Needs attention</div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Rental Scheduler</h2>
        <div style={{ height: '300px', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--border-color)' }}>
          Calendar View Mock (Gantt Chart / Grid)
        </div>
      </div>
    </div>
  );
}
