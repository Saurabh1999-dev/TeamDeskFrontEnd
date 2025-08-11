import { api } from '@/lib/api'
import { LeaveType, LeaveStatus } from '@/types/leaveEnums'

export interface Leave {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  leaveType: LeaveType
  leaveTypeString: string
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: LeaveStatus
  statusString: string
  approvedById?: string
  approvedByName?: string
  approvedAt?: string
  approvalComments?: string
  createdAt: string
  updatedAt: string
  attachments: LeaveAttachment[]
}

export interface LeaveAttachment {
  id: string
  leaveId: string
  fileName: string
  originalFileName: string
  fileType: string
  fileUrl: string
  fileSize: number
  uploadedByName: string
  createdAt: string
}

export interface CreateLeaveRequest {
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
}

export interface UpdateLeaveRequest {
  leaveType?: LeaveType
  startDate?: string
  endDate?: string
  reason?: string
}

export interface ApproveLeaveRequest {
  leaveId: string
  status: LeaveStatus
  comments?: string
}

// API methods
export const getAllLeaves = async (): Promise<Leave[]> => {
  return api.get('/leave')
}

export const getMyLeaves = async (): Promise<Leave[]> => {
  return api.get('/leave/my-leaves')
}

export const getPendingLeaves = async (): Promise<Leave[]> => {
  return api.get('/leave/pending')
}

export const getLeaveById = async (id: string): Promise<Leave> => {
  return api.get(`/leave/${id}`)
}

export const applyForLeave = async (data: CreateLeaveRequest): Promise<Leave> => {
  return api.post('/leave/apply', data)
}

export const updateLeave = async (id: string, data: UpdateLeaveRequest): Promise<Leave> => {
  return api.put(`/leave/${id}`, data)
}

export const deleteLeave = async (id: string): Promise<void> => {
  return api.delete(`/leave/${id}`)
}

export const approveLeave = async (data: ApproveLeaveRequest): Promise<Leave> => {
  return api.post('/leave/approve', data)
}

export const uploadLeaveAttachment = async (leaveId: string, file: File): Promise<LeaveAttachment> => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post(`/leave/${leaveId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const deleteLeaveAttachment = async (leaveId: string, attachmentId: string): Promise<void> => {
  return api.delete(`/leave/${leaveId}/attachments/${attachmentId}`)
}

export const getLeaveBalance = async (leaveType: LeaveType): Promise<number> => {
  return api.get(`/leave/balance/${leaveType}`)
}
