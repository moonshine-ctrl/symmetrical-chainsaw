export type User = {
  id: string;
  name: string;
  nip: string;
  avatar: string;
  departmentId: string;
  role: 'Admin' | 'Employee';
  annualLeaveBalance: number;
  qrCodeSignature?: string;
  phone?: string;
  golongan?: string;
  joinDate?: Date;
  address?: string;
  password?: string;
};

export type Department = {
  id: string;
  name: string;
  employeeCount: number;
};

export type LeaveType = {
  id: string;
  name: 'Cuti Tahunan' | 'Cuti Besar' | 'Cuti Melahirkan' | 'Cuti Alasan Penting' | 'Cuti di Luar Tanggungan Negara' | 'Cuti Sakit' | 'Cuti Lainnya';
};

export type LeaveRequest = {
  id: string;
  userId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Suspended';
  attachment?: 'uploaded' | undefined;
  createdAt: Date;
  nextApproverId?: string;
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  isRead: boolean;
  createdAt: Date;
  leaveRequestId?: string;
};

export type LogEntry = {
    id: string;
    date: Date;
    user: string;
    activity: string;
};
