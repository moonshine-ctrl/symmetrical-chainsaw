'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare } from 'lucide-react';
import {
  getDepartmentById,
  getLeaveTypeById,
  getUserById,
  leaveRequests as initialLeaveRequests,
  users,
} from '@/lib/data-supabase';
import { format } from 'date-fns';
import { useState, useMemo } from 'react';
import type { LeaveRequest } from '@/types';

export default function ApprovalsPage() {
  const [leaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);

  const requestsToApprove = useMemo(() => {
    return leaveRequests.filter(req => req.status === 'Pending');
  }, [leaveRequests]);

  const handleNotifyApprover = (request: LeaveRequest) => {
    const approver = request.nextApproverId ? getUserById(request.nextApproverId) : null;
    const employee = getUserById(request.userId);

    if (!approver || !approver.phone || !employee) {
      alert('Kontak approver tidak ditemukan atau tidak valid.');
      return;
    }
    
    const leaveType = getLeaveTypeById(request.leaveTypeId);
    const message = `Yth. Bapak/Ibu ${approver.name},\n\nMohon untuk segera meninjau dan memberikan persetujuan untuk pengajuan cuti dari Sdr/i ${employee.name} (${leaveType?.name}) yang saat ini menunggu keputusan Anda.\n\nTerima kasih atas perhatiannya.\n\n- Admin Kepegawaian -`;
    const whatsappUrl = `https://wa.me/${approver.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            All pending leave requests across departments. Admin role is for monitoring and follow-up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Next Approver</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsToApprove.length > 0 ? (
                requestsToApprove.map((request) => {
                  const user = getUserById(request.userId);
                  const leaveType = getLeaveTypeById(request.leaveTypeId);
                  const nextApprover = request.nextApproverId ? getUserById(request.nextApproverId) : null;
                  if (!user || !leaveType) return null;
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} data-ai-hint="profile person" />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{user.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>{leaveType.name}</TableCell>
                      <TableCell>
                        {format(request.startDate, 'MMM d, y')} - {format(request.endDate, 'MMM d, y')}
                      </TableCell>
                       <TableCell>{request.days}</TableCell>
                      <TableCell>
                        {nextApprover ? (
                          <Badge variant="outline">{nextApprover.name}</Badge>
                        ) : (
                          <Badge variant="secondary">Flow not set</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {nextApprover && (
                            <Button variant="outline" size="sm" onClick={() => handleNotifyApprover(request)}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Notify Approver
                            </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No pending requests.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
