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
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, PauseCircle } from 'lucide-react';
import {
  getDepartmentById,
  getLeaveTypeById,
  getUserById,
  leaveRequests as initialLeaveRequests,
  users as initialUsers,
  users,
  logHistory,
  departmentApprovalFlows,
  notifications as initialNotifications
} from '@/lib/data-supabase';
import { format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import type { LeaveRequest, User, Notification } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function ApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [allUsers, setAllUsers] = useState<User[]>(initialUsers);
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  useEffect(() => {
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    const user = users.find(u => u.id === (loggedInUserId || '2')); // fallback to citra
    setCurrentUser(user);
  }, []);

  const requestsToApprove = useMemo(() => {
    if (!currentUser) return [];
    // An employee sees requests where they are the nextApproverId
    return leaveRequests.filter(req => req.status === 'Pending' && req.nextApproverId === currentUser.id);
  }, [leaveRequests, currentUser]);

  const handleDecision = (requestId: string, decision: 'Approved' | 'Rejected' | 'Suspended') => {
    const requestIndex = initialLeaveRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1 || !currentUser) return;
    
    const originalRequest = initialLeaveRequests[requestIndex];
    const employee = getUserById(originalRequest.userId);
    if (!employee) return;

    // Common logic for logging
    const logActivity = (status: string) => {
        logHistory.unshift({
          id: `log-${Date.now()}`,
          date: new Date(),
          user: currentUser?.name || 'Approver',
          activity: `${status} leave request for ${employee?.name || 'N/A'}.`,
        });
        toast({
          title: `Request ${status}`,
          description: `The leave request has been ${status.toLowerCase()}.`,
          variant: status === 'Rejected' ? 'destructive' : 'default',
        });
    };

    // If rejected or suspended, the flow stops.
    if (decision === 'Rejected' || decision === 'Suspended') {
        originalRequest.status = decision;
        originalRequest.nextApproverId = undefined;
        logActivity(decision);

    } else if (decision === 'Approved') {
        const approvalFlow = departmentApprovalFlows[employee.departmentId] || [];
        const currentApproverIndex = approvalFlow.indexOf(currentUser.id);
        
        const nextApproverId = (currentApproverIndex !== -1 && currentApproverIndex < approvalFlow.length - 1)
            ? approvalFlow[currentApproverIndex + 1]
            : undefined;

        const newStatus = nextApproverId ? 'Pending' : 'Approved';

        originalRequest.status = newStatus;
        originalRequest.nextApproverId = nextApproverId;
        
        const leaveType = getLeaveTypeById(originalRequest.leaveTypeId);

        if (nextApproverId) {
            // Notify next approver
            const nextApprover = getUserById(nextApproverId);
            const approverNotification: Notification = {
              id: `notif-${Date.now()}-nextapprover`,
              userId: nextApproverId,
              message: `Permintaan cuti dari ${employee.name} (${leaveType?.name}) telah disetujui dan menunggu persetujuan Anda.`,
              type: 'info',
              isRead: false,
              createdAt: new Date(),
              leaveRequestId: requestId,
            };
            initialNotifications.unshift(approverNotification);
            logActivity(`Approved and forwarded`);
        } else {
            // Final approval
            // Deduct leave balance only on final approval
            if (leaveType?.name === 'Cuti Tahunan') {
                 const userToUpdate = initialUsers.find(u => u.id === employee.id);
                 if (userToUpdate) {
                     userToUpdate.annualLeaveBalance -= originalRequest.days;
                 }
            }

            // Notify employee of final approval
            const employeeNotification: Notification = {
              id: `notif-${Date.now()}-approved`,
              userId: employee.id,
              message: `Selamat! Permintaan cuti Anda (${leaveType?.name}) telah disetujui sepenuhnya.`,
              type: 'success',
              isRead: false,
              createdAt: new Date(),
              leaveRequestId: requestId,
            };
            initialNotifications.unshift(employeeNotification);
            logActivity('Approved (Final)');
        }
    }
    // Force a re-render by creating a new array from the updated master data
    setLeaveRequests([...initialLeaveRequests]);
    setAllUsers([...initialUsers]);
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>
            Review and act on the leave requests waiting for your approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden sm:table-cell">Leave Type</TableHead>
                <TableHead className="hidden md:table-cell">Dates</TableHead>
                <TableHead className="hidden lg:table-cell">Days</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requestsToApprove.length > 0 ? (
                requestsToApprove.map((request) => {
                  const user = getUserById(request.userId);
                  const leaveType = getLeaveTypeById(request.leaveTypeId);
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
                      <TableCell className="hidden sm:table-cell">{leaveType.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(request.startDate), 'MMM d, y')} - {format(new Date(request.endDate), 'MMM d, y')}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{request.days}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                           <Button size="sm" onClick={() => handleDecision(request.id, 'Approved')}>
                             <Check className="mr-2 h-4 w-4" /> Approve
                           </Button>
                           <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-500 hover:bg-yellow-50 hover:text-yellow-700" onClick={() => handleDecision(request.id, 'Suspended')}>
                             <PauseCircle className="mr-2 h-4 w-4" /> Suspend
                           </Button>
                           <Button size="sm" variant="destructive" onClick={() => handleDecision(request.id, 'Rejected')}>
                             <X className="mr-2 h-4 w-4" /> Reject
                           </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No pending requests to approve.
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
