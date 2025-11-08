import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect from the root to the employee login page by default.
  redirect('/login');
}
