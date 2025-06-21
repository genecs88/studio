import { redirect } from 'next/navigation';

export default function AdminManagementPage() {
  // This page is a legacy route. We permanently redirect to the canonical /admin route.
  redirect('/admin');
}
