'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  departments,
  leaveRequests,
  getUserById,
  getDepartmentById,
  getLeaveTypeById,
} from '@/lib/data-supabase';

export default function ReportsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });

  // ✅ Pastikan selalu array untuk map
  const safeLeaveRequests = Array.isArray(leaveRequests) ? leaveRequests : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];

  const handleExport = () => {
    const dataToExport = safeLeaveRequests.map((req) => {
      const user = getUserById(req.userId) || {};
      const department = user?.departmentId ? getDepartmentById(user.departmentId) || {} : {};
      const leaveType = getLeaveTypeById(req.leaveTypeId) || {};

      return {
        'Employee Name': user.name || 'N/A',
        'NIP': user.nip || 'N/A',
        'Department': department.name || 'N/A',
        'Leave Type': leaveType.name || 'N/A',
        'Start Date': req.startDate ? format(new Date(req.startDate), 'yyyy-MM-dd') : 'N/A',
        'End Date': req.endDate ? format(new Date(req.endDate), 'yyyy-MM-dd') : 'N/A',
        'Total Days': req.days ?? 'N/A',
        'Reason': req.reason || 'N/A',
        'Status': req.status || 'N/A',
        'Created At': req.createdAt ? format(new Date(req.createdAt), 'yyyy-MM-dd HH:mm:ss') : 'N/A',
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Requests');
    XLSX.writeFile(wb, 'LeaveReport.xlsx');
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Leave Data</CardTitle>
          <CardDescription>
            Generate and export monthly, annual, or custom reports in Excel format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Report Type */}
            <div className="grid gap-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select defaultValue="monthly">
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="annual">Annual Report</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select defaultValue="all">
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {safeDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid gap-2">
              <Label>Date range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from
                      ? date.to
                        ? `${format(date.from, 'LLL dd, y')} - ${format(date.to, 'LLL dd, y')}`
                        : format(date.from, 'LLL dd, y')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
