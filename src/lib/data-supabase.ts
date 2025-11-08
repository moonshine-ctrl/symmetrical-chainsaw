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

// Data cache for better performance
let usersCache: User[] | null = null
let departmentsCache: Department[] | null = null
let leaveTypesCache: LeaveType[] | null = null
let leaveRequestsCache: LeaveRequest[] | null = null
let notificationsCache: Notification[] | null = null
let logEntriesCache: LogEntry[] | null = null

// Cache invalidation helper
const invalidateCache = () => {
  usersCache = null
  departmentsCache = null
  leaveTypesCache = null
  leaveRequestsCache = null
  notificationsCache = null
  logEntriesCache = null
}

// USERS
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

export const users: Promise<User[]> = getUsers() // Keep for backward compatibility

export const getUserById = async (id: string): Promise<User | undefined> => {
  const users = await getUsers()
  return users.find(user => user.id === id)
}

export const getUserByNip = async (nip: string): Promise<User | undefined> => {
  const users = await getUsers()
  return users.find(user => user.nip === nip)
}

// DEPARTMENTS
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

export const departments: Promise<Department[]> = getDepartments() // Keep for backward compatibility

// LEAVE TYPES
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

export const leaveTypes: Promise<LeaveType[]> = getLeaveTypes() // Keep for backward compatibility

// APP SETTINGS
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

// LEAVE REQUESTS
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

export const leaveRequests: Promise<LeaveRequest[]> = getLeaveRequests() // Keep for backward compatibility

// NOTIFICATIONS
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

// LOG ENTRIES
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

// Utility functions for easier data manipulation
export const getUsersByDepartment = async (departmentId: string): Promise<User[]> => {
  try {
    return await usersService.getByDepartment(departmentId)
  } catch (error) {
    console.error('Failed to fetch users by department:', error)
    return []
  }
}

export const getUsersByRole = async (role: 'Admin' | 'Employee'): Promise<User[]> => {
  try {
    return await usersService.getByRole(role)
  } catch (error) {
    console.error('Failed to fetch users by role:', error)
    return []
  }
}

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

// Data manipulation functions
export const createLeaveRequest = async (request: Omit<LeaveRequest, 'id' | 'createdAt'>): Promise<LeaveRequest> => {
  try {
    const newRequest = await leaveRequestsService.create({
      ...request,
      id: `req${Date.now()}`, // Generate ID
      createdAt: new Date()
    })
    
    // Invalidate cache
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
    
    // Invalidate cache
    leaveRequestsCache = null
    
    return updatedRequest
  } catch (error) {
    console.error('Failed to update leave request:', error)
    throw error
  }
}

export const updateLeaveRequestStatus = async (
  id: string, 
  status: LeaveRequest['status'], 
  nextApproverId?: string
): Promise<LeaveRequest> => {
  try {
    const updatedRequest = await leaveRequestsService.updateStatus(id, status, nextApproverId)
    
    // Invalidate cache
    leaveRequestsCache = null
    
    return updatedRequest
  } catch (error) {
    console.error('Failed to update leave request status:', error)
    throw error
  }
}

export const createNotification = async (notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
  try {
    const newNotification = await notificationsService.create({
      ...notification,
      id: `notif${Date.now()}`, // Generate ID
      createdAt: new Date()
    })
    
    // Invalidate cache
    notificationsCache = null
    
    return newNotification
  } catch (error) {
    console.error('Failed to create notification:', error)
    throw error
  }
}

export const createLogEntry = async (logEntry: Omit<LogEntry, 'id'>): Promise<LogEntry> => {
  try {
    const newLogEntry = await logEntriesService.create({
      ...logEntry,
      id: `log${Date.now()}` // Generate ID
    })
    
    // Invalidate cache
    logEntriesCache = null
    
    return newLogEntry
  } catch (error) {
    console.error('Failed to create log entry:', error)
    throw error
  }
}

// Keep the static department approval flows for now
// You might want to move this to database later
export const departmentApprovalFlows: { [key: string]: string[] } = {
  'hr': ['5', 'admin'], // Fitriani -> Admin
  'it': ['2', 'admin'], // Citra -> Admin
  'finance': ['7', 'admin'], // Hana -> Admin
  'marketing': ['8', 'admin'], // Indra -> Admin
}

// Cache management functions
export const refreshCache = () => {
  invalidateCache()
}

export const getCacheStatus = () => ({
  users: !!usersCache,
  departments: !!departmentsCache,
  leaveTypes: !!leaveTypesCache,
  leaveRequests: !!leaveRequestsCache,
  notifications: !!notificationsCache,
  logEntries: !!logEntriesCache
})