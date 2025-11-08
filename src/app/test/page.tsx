'use client'

import React, { useEffect, useState } from 'react'
import { getUsers, getDepartments, getLeaveRequests } from '@/lib/data-supabase'

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersData, departmentsData, leaveRequestsData] = await Promise.all([
          getUsers(),
          getDepartments(),
          getLeaveRequests()
        ])

        setUsers(usersData)
        setDepartments(departmentsData)
        setLeaveRequests(leaveRequestsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p className="p-4">Loading data...</p>

  return (
    <div className="p-6 space-y-8">
      <section>
        <h1 className="text-2xl font-bold mb-2">Users</h1>
        <ul className="bg-gray-100 p-4 rounded-lg">
          {users.length > 0 ? (
            users.map((u) => (
              <li key={u.id} className="border-b py-1">{u.name || u.nip || u.id}</li>
            ))
          ) : (
            <li>No users found</li>
          )}
        </ul>
      </section>

      <section>
        <h1 className="text-2xl font-bold mb-2">Departments</h1>
        <ul className="bg-gray-100 p-4 rounded-lg">
          {departments.length > 0 ? (
            departments.map((d) => (
              <li key={d.id} className="border-b py-1">{d.name || d.id}</li>
            ))
          ) : (
            <li>No departments found</li>
          )}
        </ul>
      </section>

      <section>
        <h1 className="text-2xl font-bold mb-2">Leave Requests</h1>
        <ul className="bg-gray-100 p-4 rounded-lg">
          {leaveRequests.length > 0 ? (
            leaveRequests.map((r) => (
              <li key={r.id} className="border-b py-1">
                {r.userId} - {r.status}
              </li>
            ))
          ) : (
            <li>No leave requests found</li>
          )}
        </ul>
      </section>
    </div>
  )
}
