import { redirect } from 'next/navigation';

export default function AdminDashboard() {
  // Redirect to the default Orders view
  redirect('/admin/orders');
}
