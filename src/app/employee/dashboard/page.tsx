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
import {
  CalendarDays,
  CheckCircle,
  FileWarning,
  Hourglass,
  XCircle,
  Ban,
  PauseCircle,
} from 'lucide-react';
import {
  leaveRequests as initialLeaveRequests,
  users as allUsers,
  getLeaveTypeById,
  getUserById,
  logHistory,
} from '@/lib/data-supabase';
import { format } from 'date-fns';
import { useState, useMemo, useEffect } from 'react';
import type { LeaveRequest, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

const statusColors: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' } = {
  Pending: 'secondary',
  Approved: 'default',
  Rejected: 'destructive',
  Cancelled: 'outline',
  Suspended: 'warning',
};

const statusIcons: { [key: string]: React.ReactNode } = {
  Pending: <Hourglass className="h-4 w-4 text-yellow-500" />,
  Approved: <CheckCircle className="h-4 w-4 text-green-500" />,
  Rejected: <XCircle className="h-4 w-4 text-red-500" />,
  Cancelled: <Ban className="h-4 w-4 text-gray-500" />,
  Suspended: <PauseCircle className="h-4 w-4 text-yellow-600" />,
};

export default function EmployeeDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();

  const fetchData = () => {
    const loggedInUserId = sessionStorage.getItem('loggedInUserId');
    const user = getUserById(loggedInUserId || '1'); // Fallback for safety
    if (user) {
      setCurrentUser({ ...user }); // Create a new object to trigger re-render
      setLeaveRequests([...initialLeaveRequests.filter(req => req.userId === user.id)]);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    window.addEventListener('focus', fetchData);

    return () => {
      window.removeEventListener('focus', fetchData);
    };
  }, []);

  const handleCancelRequest = (requestId: string) => {
    const requestToCancel = leaveRequests.find(r => r.id === requestId);
    if (!requestToCancel || !currentUser) return;

    // Update request status
    const updatedRequests = leaveRequests.map(r => 
      r.id === requestId ? { ...r, status: 'Cancelled' as const } : r
    );
    setLeaveRequests(updatedRequests);
    const originalRequest = initialLeaveRequests.find(r => r.id === requestId);
    if(originalRequest) originalRequest.status = 'Cancelled';
    
    const leaveType = getLeaveTypeById(requestToCancel.leaveTypeId);

    // Add to log
    logHistory.unshift({
        id: `log-${Date.now()}`,
        date: new Date(),
        user: currentUser.name,
        activity: `Cancelled their own leave request (${leaveType?.name}, ${requestToCancel.days} days).`,
    });

    toast({
      title: 'Request Cancelled',
      description: 'Your leave request has been cancelled.',
    });
  };

  const stats = useMemo(() => {
    if (!currentUser) return { pending: 0, approved: 0, balance: 0 };
    return {
        pending: leaveRequests.filter((r) => r.status === 'Pending').length,
        approved: leaveRequests.filter((r) => r.status === 'Approved').length,
        balance: currentUser.annualLeaveBalance,
    }
  }, [leaveRequests, currentUser]);

  if (!currentUser) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Balance</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.balance} Days</div>
            <p className="text-xs text-muted-foreground">Annual leave remaining</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Leave History</CardTitle>
          <CardDescription>
            An overview of your past and current leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead className="hidden sm:table-cell">Dates</TableHead>
                <TableHead className="hidden md:table-cell">Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Attachment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
             {leaveRequests.length > 0 ? leaveRequests.map((request) => {
                const leaveType = getLeaveTypeById(request.leaveTypeId);
                if (!leaveType) return null;
                const isCancellable = request.status === 'Pending'; // Employee can only cancel pending requests

                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{leaveType.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {format(new Date(request.startDate), 'MMM d, y')} - {format(new Date(request.endDate), 'MMM d, y')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{request.days}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[request.status]} className="flex items-center gap-1 w-fit">
                        {statusIcons[request.status]}
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                       {leaveType.name === 'Cuti Sakit' ? (
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <FileWarning className="h-3 w-3" /> Required
                            </Badge>
                       ) : (
                         <span className="text-muted-foreground">-</span>
                       )}
                    </TableCell>
                    <TableCell className="text-right">
                       {isCancellable && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelRequest(request.id)}
                          >
                             <Ban className="mr-2 h-4 w-4" />
                            Cancel
                          </Button>
                        )}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        You have not made any leave requests.
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
