'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Nav } from '@/components/nav';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { settings } from '@/lib/data-supabase';

interface AppSidebarProps {
  role: 'Admin' | 'Employee';
}

export function AppSidebar({ role }: AppSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = () => {
        if (role === 'Admin') {
          sessionStorage.removeItem('adminLoggedIn');
          router.push('/admin-login');
        } else {
          sessionStorage.removeItem('employeeLoggedIn');
          router.push('/login');
        }
    };


  return (
    <Sidebar
      className="flex flex-col"
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarHeader>
        <Logo logoUrl={settings.logoUrl} useText={true}/>
      </SidebarHeader>
      <SidebarContent>
        <Nav role={role} />
      </SidebarContent>
      <SidebarFooter className='items-center group-data-[collapsible=icon]:hidden'>
         <Button variant="outline" onClick={handleLogout} className='w-full'>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
         </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
