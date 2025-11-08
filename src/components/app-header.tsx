'use client';

import { Bell } from 'lucide-react';
import {
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuFooter,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { notifications as allNotifications, users } from '@/lib/data-supabase';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { UserProfile } from './user-profile';
import { format } from 'date-fns';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import type { User, Notification } from '@/types';

export function AppHeader() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [notifications, setNotifications] = useState<Notification[]>(allNotifications);
  
   useEffect(() => {
    // Prevent user logic from running on login pages to avoid incorrect redirects
    if (pathname === '/login' || pathname === '/admin-login') {
      setCurrentUser(undefined);
      return;
    }

    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    if (pathname.startsWith('/admin')) {
      setCurrentUser(users.find(u => u.role === 'Admin'));
    } else if (pathname.startsWith('/employee')) {
       const user = users.find(u => u.id === (loggedInUserId || '1')); 
       setCurrentUser(user);
    }
  }, [pathname]);

  const unreadNotificationsCount = notifications.filter((n) => {
    if (!n.isRead) {
        if (currentUser?.role === 'Admin') {
            return true; // Admin sees all unread
        }
        // Employee sees only their unread
        return n.userId === currentUser?.id;
    }
    return false;
  }).length;
  
  const displayedNotifications = (
    currentUser?.role === 'Admin'
      ? allNotifications
      : allNotifications.filter(n => n.userId === currentUser?.id)
  )
  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  .slice(0, 4);

  const getNotificationLink = () => {
    if (pathname.startsWith('/admin')) {
      return '/admin/notifications';
    }
    return '/employee/notifications';
  }

  if (isMobile === undefined) return null;
  
  // Do not render the header on login pages
  if (pathname === '/login' || pathname === '/admin-login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-auto items-center gap-4 border-b bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <SidebarTrigger className="sm:hidden" />
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search input removed as requested */}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 justify-center rounded-full p-0 text-xs"
              >
                {unreadNotificationsCount}
              </Badge>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {displayedNotifications.length > 0 ? displayedNotifications.map((notif) => (
            <DropdownMenuItem key={notif.id} className="flex-col items-start gap-1">
              <p className={`text-sm ${!notif.isRead ? 'font-semibold' : ''}`}>
                {notif.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(notif.createdAt, "PPP 'at' p")}
              </p>
            </DropdownMenuItem>
          )) : (
            <DropdownMenuItem>No new notifications.</DropdownMenuItem>
          )}
           <DropdownMenuSeparator />
           <DropdownMenuFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link href={getNotificationLink()}>View All Notifications</Link>
                </Button>
           </DropdownMenuFooter>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserProfile />
    </header>
  );
}
