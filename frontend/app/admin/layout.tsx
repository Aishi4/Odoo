import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 4rem)' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', backgroundColor: 'var(--surface-color)', borderRight: '1px solid var(--border-color)', padding: '2rem 1rem' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/admin" style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500, display: 'block', backgroundColor: 'rgba(79,70,229,0.05)', color: 'var(--primary-color)' }}>
            Overview
          </a>
          <a href="/admin/products" className="nav-link" style={{ padding: '0.75rem 1rem', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Products
          </a>
          <a href="/admin/orders" className="nav-link" style={{ padding: '0.75rem 1rem', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Orders
          </a>
          <div style={{ padding: '0.75rem 1rem', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Configuration
          </div>
          <a href="/admin/settings" className="nav-link" style={{ padding: '0.75rem 1rem', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Settings
          </a>
          <a href="/admin/users" className="nav-link" style={{ padding: '0.75rem 1rem', display: 'block', borderRadius: 'var(--radius-md)' }}>
            Users
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: 'var(--bg-color)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
