'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { notifications as initialNotifications } from '@/lib/data-supabase';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Mail } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Notification, User } from '@/types';
import {
  getUserById,
} from '@/lib/data-supabase';

export default function NotificationsPage() {
  const [notifData, setNotifData] = useState<Notification[]>(initialNotifications);
  
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  useEffect(() => {
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    const user = getUserById(loggedInUserId || '1'); // Fallback for safety
    setCurrentUser(user);
  }, []);


  const enrichedNotifications = useMemo(() => {
    if (!currentUser) return [];

    // Employee should only see notifications where userId is their own
    return notifData.filter(n => n.userId === currentUser.id);

  }, [notifData, currentUser]);


  const markAsRead = (id: string) => {
    setNotifData(notifData.map(n => n.id === id ? {...n, isRead: true} : n));
    const originalNotif = initialNotifications.find(n => n.id === id);
    if(originalNotif) originalNotif.isRead = true;
  }

  const markAllAsRead = () => {
    const userNotifIds = enrichedNotifications.map(n => n.id);

    // Update local state
    setNotifData(notifData.map(n => 
        userNotifIds.includes(n.id) ? {...n, isRead: true} : n
    ));
    
    // Update master data
    initialNotifications.forEach(n => {
        if (userNotifIds.includes(n.id)) {
            n.isRead = true;
        }
    });
  }

  const notificationVariants = {
    info: 'bg-blue-100 dark:bg-blue-900/50',
    warning: 'bg-yellow-100 dark:bg-yellow-900/50',
    success: 'bg-green-100 dark:bg-green-900/50',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        {enrichedNotifications.some(n => !n.isRead) && (
            <Button onClick={markAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
            </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Notifications</CardTitle>
          <CardDescription>
            Here are all recent notifications for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {enrichedNotifications.length > 0 ? (
            <div className="space-y-4">
              {enrichedNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                    !notification.isRead && notificationVariants[notification.type],
                    !notification.isRead && 'font-semibold',
                  )}
                >
                  <div className="flex-shrink-0">
                    <Badge variant={notification.isRead ? 'outline' : 'default'} className="p-2">
                       <Mail className="h-5 w-5"/>
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(notification.createdAt, "PPP 'at' p")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
           ) : (
            <div className="text-center py-12 text-muted-foreground">
                <p>You have no notifications.</p>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
