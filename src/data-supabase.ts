// src/lib/data-supabase.ts

import type { User, Department, LeaveType, LeaveRequest, Notification, LogEntry } from '@/types'
import { 
  usersService, 
  departmentsService, 
  leaveTypesService, 
  leaveRequestsService, 
  notificationsService, 
  logEntriesService,
  appSettingsService
} from './supabase-service'

// ==============================
// 🔹 DATA CACHE
// ==============================
let usersCache: User[] | null = null
let departmentsCache: Department[] | null = null
let leaveTypesCache: LeaveType[] | null = null
let leaveRequestsCache: LeaveRequest[] | null = null
let notificationsCache: Notification[] | null = null
let logEntriesCache: LogEntry[] | null = null

const invalidateCache = () => {
  usersCache = null
  departmentsCache = null
  leaveTypesCache = null
  leaveRequestsCache = null
  notificationsCache = null
  logEntriesCache = null
}

// ==============================
// 🔹 USERS
// ==============================
export const getUsers = async (): Promise<User[]> => {
  if (!usersCache) {
    try {
      usersCache = await usersService.getAll()
    } catch (error) {
      console.error('Failed to fetch users:', error)
      usersCache = []
    }
  }
  return usersCache
}

export const users: Promise<User[]> = getUsers()

export const getUserById = async (id: string): Promise<User | undefined> => {
  const users = await getUsers()
  return users.find(user => user.id === id)
}

export const getUserByNip = async (nip: string): Promise<User | undefined> => {
  const users = await getUsers()
  return users.find(user => user.nip === nip)
}

// ==============================
// 🔹 DEPARTMENTS
// ==============================
export const getDepartments = async (): Promise<Department[]> => {
  if (!departmentsCache) {
    try {
      departmentsCache = await departmentsService.getAll()
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      departmentsCache = []
    }
  }
  return departmentsCache
}

export const departments: Promise<Department[]> = getDepartments()

// ✅ Tambahan untuk kompatibilitas
export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
  const departments = await getDepartments()
  return departments.find(dep => dep.id === id)
}

// ==============================
// 🔹 LEAVE TYPES
// ==============================
export const getLeaveTypes = async (): Promise<LeaveType[]> => {
  if (!leaveTypesCache) {
    try {
      leaveTypesCache = await leaveTypesService.getAll()
    } catch (error) {
      console.error('Failed to fetch leave types:', error)
      leaveTypesCache = []
    }
  }
  return leaveTypesCache
}

export const leaveTypes: Promise<LeaveType[]> = getLeaveTypes()

// ✅ Tambahan untuk kompatibilitas
export const getLeaveTypeById = async (id: string): Promise<LeaveType | undefined> => {
  const leaveTypes = await getLeaveTypes()
  return leaveTypes.find(type => type.id === id)
}

// ==============================
// 🔹 APP SETTINGS
// ==============================
export const getAppSettings = async () => {
  try {
    return await appSettingsService.getSettings()
  } catch (error) {
    console.error('Failed to fetch app settings:', error)
    return {
      id: 'global',
      logoUrl: '/logo.png',
      companyName: 'Leave Management System',
      letterhead: ['Company Name'],
      sickLeaveFormUrl: '',
      contactInfo: {},
      themeConfig: {}
    }
  }
}

export const updateAppSettings = async (settings: any) => {
  try {
    return await appSettingsService.updateSettings(settings)
  } catch (error) {
    console.error('Failed to update app settings:', error)
    throw error
  }
}

// ✅ Fallback static settings (untuk kompatibilitas kode lama)
export const settings = {
  id: 'global',
  logoUrl: '/logo.png',
  companyName: 'Leave Management System',
  letterhead: ['Company Name'],
  sickLeaveFormUrl: '',
  contactInfo: {},
  themeConfig: {}
}

// ==============================
// 🔹 LEAVE REQUESTS
// ==============================
export const getLeaveRequests = async (): Promise<LeaveRequest[]> => {
  if (!leaveRequestsCache) {
    try {
      leaveRequestsCache = await leaveRequestsService.getAll()
    } catch (error) {
      console.error('Failed to fetch leave requests:', error)
      leaveRequestsCache = []
    }
  }
  return leaveRequestsCache
}

export const leaveRequests: Promise<LeaveRequest[]> = getLeaveRequests()

export const getLeaveRequestsByUser = async (userId: string): Promise<LeaveRequest[]> => {
  try {
    return await leaveRequestsService.getByUser(userId)
  } catch (error) {
    console.error('Failed to fetch leave requests by user:', error)
    return []
  }
}

export const getPendingApprovals = async (approverId: string): Promise<LeaveRequest[]> => {
  try {
    return await leaveRequestsService.getPendingApprovals(approverId)
  } catch (error) {
    console.error('Failed to fetch pending approvals:', error)
    return []
  }
}

// ==============================
// 🔹 NOTIFICATIONS
// ==============================
export const getNotificationsByUser = async (userId: string): Promise<Notification[]> => {
  if (!notificationsCache) {
    try {
      const allNotifications = await notificationsService.getByUser(userId)
      notificationsCache = allNotifications
      return allNotifications
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      return []
    }
  }
  return notificationsCache.filter(notif => notif.userId === userId)
}

// ✅ Tambahan untuk kompatibilitas
export const notifications: Notification[] = []

// ==============================
// 🔹 LOG ENTRIES
// ==============================
export const getLogEntries = async (): Promise<LogEntry[]> => {
  if (!logEntriesCache) {
    try {
      logEntriesCache = await logEntriesService.getAll()
    } catch (error) {
      console.error('Failed to fetch log entries:', error)
      logEntriesCache = []
    }
  }
  return logEntriesCache
}

export const logHistory = async (entry: LogEntry) => {
  try {
    await logEntriesService.create(entry)
    logEntriesCache = null
  } catch (error) {
    console.error('Failed to log history:', error)
  }
}

// ==============================
// 🔹 DATA MANIPULATION
// ==============================
export const createLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'createdAt'>): Promise<LeaveRequest> => {
  try {
    const newRequest = await leaveRequestsService.create({
      ...request,
      id: `req${Date.now()}`,
      createdAt: new Date()
    })
    leaveRequestsCache = null
    return newRequest
  } catch (error) {
    console.error('Failed to create leave request:', error)
    throw error
  }
}

export const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>): Promise<LeaveRequest> => {
  try {
    const updatedRequest = await leaveRequestsService.update(id, updates)
    leaveRequestsCache = null
    return updatedRequest
  } catch (error) {
    console.error('Failed to update leave request:', error)
    throw error
  }
}

// ==============================
// 🔹 DEPARTMENT APPROVAL FLOWS
// ==============================
export const departmentApprovalFlows: { [key: string]: string[] } = {
  'hr': ['5', 'admin'],
  'it': ['2', 'admin'],
  'finance': ['7', 'admin'],
  'marketing': ['8', 'admin']
}

// ==============================
// 🔹 CACHE UTILITIES
// ==============================
export const refreshCache = () => invalidateCache()

export const getCacheStatus = () => ({
  users: !!usersCache,
  departments: !!departmentsCache,
  leaveTypes: !!leaveTypesCache,
  leaveRequests: !!leaveRequestsCache,
  notifications: !!notificationsCache,
  logEntries: !!logEntriesCache
})
