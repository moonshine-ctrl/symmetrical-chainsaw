'use client';

import { useState } from 'react';
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
import { logHistory as initialLogHistory } from '@/lib/data';
import { format } from 'date-fns';
import { History } from 'lucide-react';
import type { LogEntry } from '@/types';

export default function LogsPage() {
  const [logHistory, setLogHistory] = useState<LogEntry[]>(initialLogHistory);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>System Activity Log</CardTitle>
          <CardDescription>
            An overview of all significant activities within the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Timestamp</TableHead>
                  <TableHead className="w-[200px]">User</TableHead>
                  <TableHead>Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logHistory.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(log.date, "yyyy-MM-dd, HH:mm:ss")}
                    </TableCell>
                    <TableCell className="font-medium">{log.user}</TableCell>
                    <TableCell>{log.activity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12 text-muted-foreground">
                <History className="mx-auto h-12 w-12" />
                <p className="mt-4">No log entries found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
