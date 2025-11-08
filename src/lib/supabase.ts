import { createClient } from '@supabase/supabase-js'

// Types untuk database operations
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_id: string
          name: string
          nip: string
          avatar: string | null
          department_id: string
          role: 'Admin' | 'Employee'
          annual_leave_balance: number
          qr_code_signature: string | null
          phone: string | null
          golongan: string | null
          join_date: string | null
          address: string | null
          password: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          nip: string
          avatar?: string | null
          department_id: string
          role: 'Admin' | 'Employee'
          annual_leave_balance?: number
          qr_code_signature?: string | null
          phone?: string | null
          golongan?: string | null
          join_date?: string | null
          address?: string | null
          password?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          nip?: string
          avatar?: string | null
          department_id?: string
          role?: 'Admin' | 'Employee'
          annual_leave_balance?: number
          qr_code_signature?: string | null
          phone?: string | null
          bangsa?: string | null
          join_date?: string | null
          address?: string | null
          password?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          employee_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          employee_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          employee_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      leave_types: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      leave_requests: {
        Row: {
          id: string
          request_id: string
          user_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          days: number
          reason: string
          status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Suspended'
          attachment: string | null
          created_at: string
          updated_at: string
          next_approver_id: string | null
        }
        Insert: {
          id?: string
          request_id: string
          user_id: string
          leave_type_id: string
          start_date: string
          end_date: string
          days: number
          reason: string
          status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Suspended'
          attachment?: string | null
          created_at?: string
          updated_at?: string
          next_approver_id?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string
          leave_type_id?: string
          start_date?: string
          end_date?: string
          days?: number
          reason?: string
          status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Suspended'
          attachment?: string | null
          created_at?: string
          updated_at?: string
          next_approver_id?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          message: string
          type: 'info' | 'warning' | 'success'
          is_read: boolean
          created_at: string
          leave_request_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          message: string
          type: 'info' | 'warning' | 'success'
          is_read?: boolean
          created_at?: string
          leave_request_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          message?: string
          type?: 'info' | 'warning' | 'success'
          is_read?: boolean
          created_at?: string
          leave_request_id?: string | null
        }
      }
      log_entries: {
        Row: {
          id: string
          date: string
          user: string
          activity: string
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          user: string
          activity: string
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          user?: string
          activity?: string
          created_at?: string
        }
      }
    }
  }
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper function to convert database types to app types
export const convertUserFromDb = (dbUser: Database['public']['Tables']['users']['Row']) => {
  return {
    id: dbUser.user_id, // Use user_id for app compatibility
    name: dbUser.name,
    nip: dbUser.nip,
    avatar: dbUser.avatar || '',
    departmentId: dbUser.department_id,
    role: dbUser.role,
    annualLeaveBalance: dbUser.annual_leave_balance,
    qrCodeSignature: dbUser.qr_code_signature || undefined,
    phone: dbUser.phone || undefined,
    golongan: dbUser.golongan || undefined,
    joinDate: dbUser.join_date ? new Date(dbUser.join_date) : undefined,
    address: dbUser.address || undefined,
    password: dbUser.password || undefined,
  }
}

export const convertUserToDb = (appUser: any) => {
  return {
    user_id: appUser.id,
    name: appUser.name,
    nip: appUser.nip,
    avatar: appUser.avatar,
    department_id: appUser.departmentId,
    role: appUser.role,
    annual_leave_balance: appUser.annualLeaveBalance,
    qr_code_signature: appUser.qrCodeSignature,
    phone: appUser.phone,
    bangsa: appUser.golongan,
    join_date: appUser.joinDate?.toISOString(),
    address: appUser.address,
    password: appUser.password,
  }
}

export const convertLeaveRequestFromDb = (dbRequest: Database['public']['Tables']['leave_requests']['Row']) => {
  return {
    id: dbRequest.request_id, // Use request_id for app compatibility
    userId: dbRequest.user_id,
    leaveTypeId: dbRequest.leave_type_id,
    startDate: new Date(dbRequest.start_date),
    endDate: new Date(dbRequest.end_date),
    days: dbRequest.days,
    reason: dbRequest.reason,
    status: dbRequest.status,
    attachment: dbRequest.attachment as 'uploaded' | undefined,
    createdAt: new Date(dbRequest.created_at),
    nextApproverId: dbRequest.next_approver_id || undefined,
  }
}

export const convertLeaveRequestToDb = (appRequest: any) => {
  return {
    request_id: appRequest.id,
    user_id: appRequest.userId,
    leave_type_id: appRequest.leaveTypeId,
    start_date: appRequest.startDate.toISOString(),
    end_date: appRequest.endDate.toISOString(),
    days: appRequest.days,
    reason: appRequest.reason,
    status: appRequest.status,
    attachment: appRequest.attachment,
    created_at: appRequest.createdAt?.toISOString(),
    next_approver_id: appRequest.nextApproverId,
  }
}