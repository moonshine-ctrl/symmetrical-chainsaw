'use client';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { AppHeader } from '@/components/app-header';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const isAdminLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
      if (!isAdminLoggedIn) {
        router.replace('/admin-login');
      }
    }
  }, [isClient, router]);

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar role="Admin" />
        <div className="flex flex-col w-full">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50/50 dark:bg-gray-900/50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
