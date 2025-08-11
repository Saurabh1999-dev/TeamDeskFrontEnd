// src/stores/leaves-store.ts
import { create } from 'zustand'
import { LeaveType } from '@/types/leaveEnums'
import { Leave, CreateLeaveRequest, UpdateLeaveRequest, ApproveLeaveRequest, getAllLeaves, getMyLeaves, getPendingLeaves, getLeaveById, applyForLeave, approveLeave, uploadLeaveAttachment, getLeaveBalance } from '@/services/leavesApi'

interface LeavesState {
  // State
  leaves: Leave[]
  myLeaves: Leave[]
  pendingLeaves: Leave[]
  currentLeave: Leave | null
  loading: boolean
  error: string | null
  leaveBalance: { [key in LeaveType]?: number }
  
  // Actions
  fetchAllLeaves: () => Promise<void>
  fetchMyLeaves: () => Promise<void>
  fetchPendingLeaves: () => Promise<void>
  fetchLeaveById: (id: string) => Promise<void>
  applyForLeave: (data: CreateLeaveRequest) => Promise<boolean>
  updateLeave: (id: string, data: UpdateLeaveRequest) => Promise<boolean>
  deleteLeave: (id: string) => Promise<boolean>
  approveLeave: (data: ApproveLeaveRequest) => Promise<boolean>
  uploadAttachment: (leaveId: string, file: File) => Promise<boolean>
  deleteAttachment: (leaveId: string, attachmentId: string) => Promise<boolean>
  fetchLeaveBalance: (leaveType: LeaveType) => Promise<void>
  clearError: () => void
  clearCurrentLeave: () => void
}

export const useLeavesStore = create<LeavesState>((set, get) => ({
  // Initial state
  leaves: [],
  myLeaves: [],
  pendingLeaves: [],
  currentLeave: null,
  loading: false,
  error: null,
  leaveBalance: {},

  // Fetch all leaves (Admin/HR only)
  fetchAllLeaves: async () => {
    set({ loading: true, error: null })
    try {
      const leavesArray = await getAllLeaves()
      set({ 
        leaves: leavesArray, 
        loading: false,
        error: null 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch leaves', 
        loading: false,
        leaves: []
      })
    }
  },

  // Fetch my leaves
  fetchMyLeaves: async () => {
    set({ loading: true, error: null })
    try {
      const leavesArray = await getMyLeaves()
      set({ 
        myLeaves: leavesArray, 
        loading: false,
        error: null 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch my leaves', 
        loading: false,
        myLeaves: []
      })
    }
  },

  // Fetch pending leaves (Admin/HR only)
  fetchPendingLeaves: async () => {
    set({ loading: true, error: null })
    try {
      const leavesArray = await getPendingLeaves()
      set({ 
        pendingLeaves: leavesArray, 
        loading: false,
        error: null 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch pending leaves', 
        loading: false,
        pendingLeaves: []
      })
    }
  },

  // Fetch leave by ID
  fetchLeaveById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const leave = await getLeaveById(id)
      set({ currentLeave: leave, loading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch leave', loading: false })
    }
  },

  // Apply for leave
  applyForLeave: async (data: CreateLeaveRequest) => {
    set({ loading: true, error: null })
    try {
      const newLeave = await applyForLeave(data)
      
      // Add to my leaves list
      set(state => ({
        myLeaves: [newLeave, ...state.myLeaves],
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to apply for leave', loading: false })
      return false
    }
  },

  // Approve/Reject leave (Admin only)
  approveLeave: async (data: ApproveLeaveRequest) => {
    try {
      const updatedLeave = await approveLeave(data)
      
      // Update leave in all relevant arrays
      set(state => ({
        leaves: state.leaves.map(l => l.id === data.leaveId ? updatedLeave : l),
        pendingLeaves: state.pendingLeaves.filter(l => l.id !== data.leaveId),
        currentLeave: state.currentLeave?.id === data.leaveId ? updatedLeave : state.currentLeave,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to approve/reject leave' })
      return false
    }
  },

  // Upload attachment
  uploadAttachment: async (leaveId: string, file: File) => {
    try {
      const attachment = await uploadLeaveAttachment(leaveId, file)
      
      // Add attachment to leave
      set(state => ({
        leaves: state.leaves.map(l => 
          l.id === leaveId ? { ...l, attachments: [...l.attachments, attachment] } : l
        ),
        myLeaves: state.myLeaves.map(l => 
          l.id === leaveId ? { ...l, attachments: [...l.attachments, attachment] } : l
        ),
        currentLeave: state.currentLeave?.id === leaveId 
          ? { ...state.currentLeave, attachments: [...state.currentLeave.attachments, attachment] }
          : state.currentLeave,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to upload attachment' })
      return false
    }
  },

  // Fetch leave balance
  fetchLeaveBalance: async (leaveType: LeaveType) => {
    try {
      const balance = await getLeaveBalance(leaveType)
      set(state => ({
        leaveBalance: { ...state.leaveBalance, [leaveType]: balance }
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch leave balance' })
    }
  },

  // Other methods...
  updateLeave: async (id: string, data: UpdateLeaveRequest) => {
    // Implementation similar to updateTask
    return true
  },

  deleteLeave: async (id: string) => {
    // Implementation similar to deleteTask
    return true
  },

  deleteAttachment: async (leaveId: string, attachmentId: string) => {
    // Implementation similar to deleteTaskAttachment
    return true
  },

  clearError: () => set({ error: null }),
  clearCurrentLeave: () => set({ currentLeave: null }),
}))
