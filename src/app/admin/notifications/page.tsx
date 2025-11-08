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
import { Check, Mail, MessageSquare } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Notification, User } from '@/types';
import {
  getUserById,
  getLeaveRequestById,
  getLeaveTypeById,
  users,
} from '@/lib/data-supabase';

export default function NotificationsPage() {
  const [notifData, setNotifData] = useState<Notification[]>(initialNotifications);
  
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  useEffect(() => {
    // For admin pages, always set the admin user.
    setCurrentUser(users.find(u => u.role === 'Admin'));
  }, []);


  const enrichedNotifications = useMemo(() => {
    if (!currentUser) return [];

    // Admin sees all notifications
    if (currentUser.role === 'Admin') {
      return [...notifData].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    
    // Employee should only see notifications where userId is their own
    return notifData.filter(n => n.userId === currentUser.id).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  }, [notifData, currentUser]);


  const markAsRead = (id: string) => {
    setNotifData(notifData.map(n => n.id === id ? {...n, isRead: true} : n));
    const originalNotif = initialNotifications.find(n => n.id === id);
    if(originalNotif) originalNotif.isRead = true;
  }

  const markAllAsRead = () => {
    const notifIdsToMark = enrichedNotifications.map(n => n.id);
    
    // Update local state
    setNotifData(notifData.map(n => 
        notifIdsToMark.includes(n.id) ? {...n, isRead: true} : n
    ));
    
    // Update master data
    initialNotifications.forEach(n => {
        if (notifIdsToMark.includes(n.id)) {
            n.isRead = true;
        }
    });
  }

  const handleNotifyEmployee = (notification: Notification) => {
    if (!notification.leaveRequestId) return;

    const leaveRequest = getLeaveRequestById(notification.leaveRequestId);
    if (!leaveRequest) return;
    
    const employee = getUserById(leaveRequest.userId);
    if (!employee || !employee.phone) {
      alert('Kontak karyawan tidak ditemukan atau tidak valid.');
      return;
    }
    
    const message = `Yth. Sdr/i ${employee.name},\n\nMengingatkan untuk segera melengkapi dokumen surat keterangan sakit untuk pengajuan cuti Anda pada tanggal ${format(leaveRequest.startDate, 'd MMMM yyyy')}.\n\nTerima kasih atas perhatiannya dan semoga lekas sembuh.\n\n- Admin Kepegawaian -`;
    const whatsappUrl = `https://wa.me/${employee.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleNotifyApprover = (notification: Notification) => {
    if (!notification.leaveRequestId) return;

    const leaveRequest = getLeaveRequestById(notification.leaveRequestId);
    if (!leaveRequest) return;
    
    const employee = getUserById(leaveRequest.userId);
    const approver = leaveRequest.nextApproverId ? getUserById(leaveRequest.nextApproverId) : users.find(u => u.id === '2');

    if (!approver || !approver.phone) {
      alert('Kontak approver tidak ditemukan atau tidak valid.');
      return;
    }
    if (!employee) return;
    
    const leaveType = getLeaveTypeById(leaveRequest.leaveTypeId);
    const message = `Yth. Bapak/Ibu ${approver.name},\n\nMemberitahukan bahwa ada pengajuan cuti sakit dari Sdr/i ${employee.name} yang menunggu persetujuan. Karyawan telah diingatkan untuk melengkapi dokumen.\n\nMohon untuk segera ditindaklanjuti. Terima kasih.\n\n- Admin Kepegawaian -`;
    const whatsappUrl = `https://wa.me/${approver.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

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
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Here are all recent notifications across the system.
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
                    {notification.type === 'warning' && notification.leaveRequestId && (
                       <>
                         <Button variant="outline" size="sm" onClick={() => handleNotifyEmployee(notification)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Notify Employee
                         </Button>
                          <Button variant="outline" size="sm" onClick={() => handleNotifyApprover(notification)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Notify Approver
                         </Button>
                       </>
                    )}
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
