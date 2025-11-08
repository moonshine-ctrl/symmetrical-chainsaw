'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare } from 'lucide-react'
import {
  getDepartmentById,
  getLeaveTypeById,
  getUserById,
  getLeaveRequests,
} from '@/lib/data-supabase'
import { format } from 'date-fns'
import type { LeaveRequest } from '@/types'

export const dynamic = 'force-dynamic' // ✅ cegah error prerender di Vercel

export default function ApprovalsPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLeaveRequests()
        if (Array.isArray(data)) {
          setLeaveRequests(data)
        } else {
          console.warn('getLeaveRequests() did not return array:', data)
          setLeaveRequests([])
        }
      } catch (error) {
        console.error('Failed to fetch leave requests:', error)
        setLeaveRequests([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const requestsToApprove = useMemo(() => {
    return leaveRequests.filter(req => req.status === 'Pending')
  }, [leaveRequests])

  const handleNotifyApprover = async (request: LeaveRequest) => {
    const approver = request.nextApproverId ? await getUserById(request.nextApproverId) : null
    const employee = await getUserById(request.userId)

    if (!approver || !approver.phone || !employee) {
      alert('Kontak approver tidak ditemukan atau tidak valid.')
      return
    }

    const leaveType = await getLeaveTypeById(request.leaveTypeId)
    const message = `Yth. Bapak/Ibu ${approver.name},\n\nMohon untuk segera meninjau dan memberikan persetujuan untuk pengajuan cuti dari Sdr/i ${employee.name} (${leaveType?.name}) yang saat ini menunggu keputusan Anda.\n\nTerima kasih atas perhatiannya.\n\n- Admin Kepegawaian -`
    const whatsappUrl = `https://wa.me/${approver.phone}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

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
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading...</div>
          ) : (
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
                    const userPromise = getUserById(request.userId)
                    const leaveTypePromise = getLeaveTypeById(request.leaveTypeId)
                    const nextApproverPromise = request.nextApproverId ? getUserById(request.nextApproverId) : null

                    return (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src="" alt="User" />
                              <AvatarFallback>
                                {request.userId.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{request.userId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.leaveTypeId}</TableCell>
                        <TableCell>
                          {format(request.startDate, 'MMM d, y')} - {format(request.endDate, 'MMM d, y')}
                        </TableCell>
                        <TableCell>{request.days}</TableCell>
                        <TableCell>
                          {nextApproverPromise ? (
                            <Badge variant="outline">{request.nextApproverId}</Badge>
                          ) : (
                            <Badge variant="secondary">Flow not set</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {request.nextApproverId && (
                            <Button variant="outline" size="sm" onClick={() => handleNotifyApprover(request)}>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Notify Approver
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
