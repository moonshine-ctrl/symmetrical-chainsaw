'use client'  // harus paling atas agar file ini dikenali sebagai Client Component

import { useEffect, useState } from 'react'
import { usersService, departmentsService, leaveTypesService, leaveRequestsService } from '@/lib/supabase-service'

export default function TestPage() {
  const [status, setStatus] = useState<any>({
    users: { loading: true, data: null, error: null },
    departments: { loading: true, data: null, error: null },
    leaveTypes: { loading: true, data: null, error: null },
    leaveRequests: { loading: true, data: null, error: null }
  })

  useEffect(() => {
    async function testSupabaseConnection() {
      // Test users
      try {
        const users = await usersService.getAll()
        setStatus(prev => ({ ...prev, users: { loading: false, data: users.length, error: null } }))
      } catch (error: any) {
        setStatus(prev => ({ ...prev, users: { loading: false, data: null, error: error.message } }))
      }

      // Test departments
      try {
        const departments = await departmentsService.getAll()
        setStatus(prev => ({ ...prev, departments: { loading: false, data: departments.length, error: null } }))
      } catch (error: any) {
        setStatus(prev => ({ ...prev, departments: { loading: false, data: null, error: error.message } }))
      }

      // Test leave types
      try {
        const leaveTypes = await leaveTypesService.getAll()
        setStatus(prev => ({ ...prev, leaveTypes: { loading: false, data: leaveTypes.length, error: null } }))
      } catch (error: any) {
        setStatus(prev => ({ ...prev, leaveTypes: { loading: false, data: null, error: error.message } }))
      }

      // Test leave requests
      try {
        const leaveRequests = await leaveRequestsService.getAll()
        setStatus(prev => ({ ...prev, leaveRequests: { loading: false, data: leaveRequests.length, error: null } }))
      } catch (error: any) {
        setStatus(prev => ({ ...prev, leaveRequests: { loading: false, data: null, error: error.message } }))
      }
    }

    testSupabaseConnection()
  }, [])

  const testData = [
    { name: 'Users', status: status.users },
    { name: 'Departments', status: status.departments },
    { name: 'Leave Types', status: status.leaveTypes },
    { name: 'Leave Requests', status: status.leaveRequests },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🚀 Supabase Connection Test</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testData.map((test) => (
              <TestCard key={test.name} name={test.name} status={test.status} />
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="font-semibold text-blue-900 mb-2">📋 Next Steps:</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Jika semua test berhasil ✅, berarti koneksi Supabase sudah benar</li>
              <li>Update imports di komponen Anda dari <code>@/lib/data</code> ke <code>@/lib/data-supabase</code></li>
              <li>Ubah dari synchronous ke asynchronous calls (tambahkan <code>await</code>)</li>
              <li>Hapus file test ini setelah selesai</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <h2 className="font-semibold text-yellow-900 mb-2">⚠️ Troubleshooting:</h2>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
              <li>Error "relation does not exist": Jalankan SQL schema di Supabase SQL Editor</li>
              <li>Error "Invalid API key": Periksa environment variables di .env.local</li>
              <li>Error "permission denied": Check RLS policies di Supabase</li>
              <li>Loading terus: Restart development server</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TestCard({ name, status }: { name: string, status: any }) {
  if (status.loading) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold text-gray-700">{name}</h3>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (status.error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <h3 className="font-semibold text-red-900">{name}</h3>
        <p className="text-sm text-red-700">❌ Error: {status.error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 border border-green-200 rounded-lg bg-green-50">
      <h3 className="font-semibold text-green-900">{name}</h3>
      <p className="text-sm text-green-700">✅ Success: {status.data} records found</p>
    </div>
  )
}
