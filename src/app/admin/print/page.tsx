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
import { Input } from '@/components/ui/input';
import { Printer } from 'lucide-react';
import {
  getLeaveTypeById,
  getUserById,
  leaveRequests,
} from '@/lib/data-supabase';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import Link from 'next/link';
import type { LeaveRequest, User } from '@/types';

export default function PrintPage() {
  
  const [letterNumbers, setLetterNumbers] = useState<{ [key: string]: string }>({});

  const handleLetterNumberChange = (requestId: string, value: string) => {
    setLetterNumbers(prev => ({ ...prev, [requestId]: value }));
  };

  const handlePrint = (request: LeaveRequest) => {
    const letterNumber = letterNumbers[request.id] || '';
    const printUrl = `/admin/print/${request.id}?letterNumber=${encodeURIComponent(letterNumber)}`;
    window.open(printUrl, '_blank');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Cetak Surat Cuti & Sakit</CardTitle>
          <CardDescription>
            Buat dan cetak surat keterangan cuti atau sakit untuk karyawan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Karyawan</TableHead>
                <TableHead className="hidden sm:table-cell">Jenis Cuti</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => {
                const user = getUserById(request.userId);
                const leaveType = getLeaveTypeById(request.leaveTypeId);
                if (!user || !leaveType) return null;

                const isPrintable = request.status === 'Approved' || (leaveType.name === 'Cuti Sakit' && request.status !== 'Rejected' && request.status !== 'Cancelled');
                
                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{leaveType.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(request.startDate), 'd MMM y')} - {format(new Date(request.endDate), 'd MMM y')}
                    </TableCell>
                    <TableCell>
                       <Badge variant={request.status === 'Approved' ? 'default' : request.status === 'Pending' ? 'secondary' : 'destructive'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
                        <Input 
                          placeholder="Nomor Surat" 
                          className="w-full sm:w-auto sm:flex-1" 
                          value={letterNumbers[request.id] || ''}
                          onChange={(e) => handleLetterNumberChange(request.id, e.target.value)}
                        />
                        <Button variant="outline" size="sm" onClick={() => handlePrint(request)} disabled={!isPrintable}>
                          <Printer className="mr-2 h-4 w-4" />
                          Cetak
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
