// src/stores/staff-store.ts
import { create } from 'zustand'
import { 
  getAllStaff, 
  getStaffById, 
  createStaff, 
  updateStaff, 
  deleteStaff,
  toggleStaffStatus,
  type Staff, 
  type CreateStaffRequest, 
  type UpdateStaffRequest 
} from '@/services/staffApi'

interface StaffState {
  staff: Staff[]
  currentStaff: Staff | null
  loading: boolean
  error: string | null
  fetchStaff: () => Promise<void>
  fetchStaffById: (id: string) => Promise<void>
  createStaff: (data: CreateStaffRequest) => Promise<boolean>
  updateStaff: (id: string, data: UpdateStaffRequest) => Promise<boolean>
  deleteStaff: (id: string) => Promise<boolean>
  toggleStaffStatus: (id: string) => Promise<boolean>
  clearError: () => void
  clearCurrentStaff: () => void
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  currentStaff: null,
  loading: false,
  error: null,

  fetchStaff: async () => {
    
    set({ loading: true, error: null })
    try {
      const response = await getAllStaff()
      if (response) {
        set({ staff: response, loading: false })
      } else {
        set({ error: "No data found", loading: false })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch staff', loading: false })
    }
  },

  fetchStaffById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await getStaffById(id)
      if (response.success) {
        set({ currentStaff: response.data, loading: false })
      } else {
        set({ error: response.message, loading: false })
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch staff', loading: false })
    }
  },

  createStaff: async (data: CreateStaffRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await createStaff(data)
      if (response.success) {
        get().fetchStaff()
        set({ loading: false })
        return true
      } else {
        set({ error: response.message, loading: false })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to create staff', loading: false })
      return false
    }
  },

  updateStaff: async (id: string, data: UpdateStaffRequest) => {
    set({ loading: true, error: null })
    try {
      const response = await updateStaff(id, data)
      if (response.success) {
        set(state => ({
          staff: state.staff.map(s => s.id === id ? response.data : s),
          currentStaff: state.currentStaff?.id === id ? response.data : state.currentStaff,
          loading: false
        }))
        return true
      } else {
        set({ error: response.message, loading: false })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to update staff', loading: false })
      return false
    }
  },

  deleteStaff: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const response = await deleteStaff(id)
      if (response.success) {
        set(state => ({
          staff: state.staff.filter(s => s.id !== id),
          currentStaff: state.currentStaff?.id === id ? null : state.currentStaff,
          loading: false
        }))
        return true
      } else {
        set({ error: 'Failed to delete staff', loading: false })
        return false
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete staff', loading: false })
      return false
    }
  },
  toggleStaffStatus: async (id: string) => {
    try {
      const response = await toggleStaffStatus(id)
      if (response.success) {
        set(state => ({
          staff: state.staff.map(s => s.id === id ? response.data : s),
          currentStaff: state.currentStaff?.id === id ? response.data : state.currentStaff,
        }))
        return true
      }
      return false
    } catch (error: any) {
      set({ error: error.message || 'Failed to toggle staff status' })
      return false
    }
  },
  clearError: () => set({ error: null }),
  clearCurrentStaff: () => set({ currentStaff: null }),
}))
