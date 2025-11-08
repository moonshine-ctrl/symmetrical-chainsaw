'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { createClient } from '@/lib/supabaseClient';

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
import { Badge } from '@/components/ui/badge';

import type { LeaveRequest, User, LeaveType } from '@/types';

export default function PrintPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [letterNumbers, setLetterNumbers] = useState<{ [key: string]: string }>({});

  // Fetch data dari Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [reqRes, userRes, typeRes] = await Promise.all([
        supabase.from('leave_requests').select('*'),
        supabase.from('users').select('*'),
        supabase.from('leave_types').select('*'),
      ]);

      if (reqRes.data) setRequests(reqRes.data);
      if (userRes.data) setUsers(userRes.data);
      if (typeRes.data) setLeaveTypes(typeRes.data);

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const getUserById = (id: string) => users.find((u) => u.id === id);
  const getLeaveTypeById = (id: string) => leaveTypes.find((lt) => lt.id === id);

  const handleLetterNumberChange = (requestId: string, value: string) => {
    setLetterNumbers((prev) => ({ ...prev, [requestId]: value }));
  };

  const handlePrint = (request: LeaveRequest) => {
    const letterNumber = letterNumbers[request.id] || '';
    const printUrl = `/admin/print/${request.id}?letterNumber=${encodeURIComponent(letterNumber)}`;
    window.open(printUrl, '_blank');
  };

  if (loading) {
    return <p className="text-center py-10 text-muted-foreground">Memuat data...</p>;
  }

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
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Tidak ada data pengajuan cuti.
                  </TableCell>
                </TableRow>
              )}

              {requests.map((request) => {
                const user = getUserById(request.userId);
                const leaveType = getLeaveTypeById(request.leaveTypeId);
                if (!user || !leaveType) return null;

                const isPrintable =
                  request.status === 'Approved' ||
                  (leaveType.name === 'Cuti Sakit' &&
                    request.status !== 'Rejected' &&
                    request.status !== 'Cancelled');

                return (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{leaveType.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(request.startDate), 'd MMM y')} -{' '}
                      {format(new Date(request.endDate), 'd MMM y')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === 'Approved'
                            ? 'default'
                            : request.status === 'Pending'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2">
                        <Input
                          placeholder="Nomor Surat"
                          className="w-full sm:w-auto sm:flex-1"
                          value={letterNumbers[request.id] || ''}
                          onChange={(e) =>
                            handleLetterNumberChange(request.id, e.target.value)
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrint(request)}
                          disabled={!isPrintable}
                        >
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
