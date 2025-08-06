// src/services/staffApi.ts
import { api } from '@/lib/api'

export interface Staff {
    id: string
    fullName: string
    email: string
    employeeCode: string
    department: string
    position: string
    hireDate: string
    salary?: number // Make optional since API doesn't return it
    skills: string[]
    role?: number // Make optional since API doesn't return it
    isActive: boolean
    createdAt: string
    updatedAt?: string // Make optional since API doesn't return it
}

export interface CreateStaffRequest {
    email: string
    firstName: string
    lastName: string
    employeeCode: string
    department: string
    position: string
    hireDate: string
    salary: number
    skills: string[]
    role: number
}

export interface UpdateStaffRequest {
    firstName?: string
    lastName?: string
    employeeCode?: string
    department?: string
    position?: string
    hireDate?: string
    salary?: number
    skills?: string[]
    role?: number
    isActive?: boolean
}

export interface StaffResponse {
    success: boolean
    message: string
    data: Staff[]
}

export interface SingleStaffResponse {
    success: boolean
    message: string
    data: Staff
}

export const getAllStaff = async (): Promise<Staff[]> => {
    try {
        // API returns direct array, not wrapped response
        const response = await api.get<Staff[]>('/staff')
        debugger
        console.log('📡 Direct array response:', response)
        return response
    } catch (error) {
        console.error('Error fetching staff:', error)
        throw error
    }
}

export const getStaffById = async (id: string): Promise<SingleStaffResponse> => {
    try {
        const response = await api.get<SingleStaffResponse>(`/staff/${id}`)
        return response
    } catch (error) {
        console.error('Error fetching staff by ID:', error)
        throw error
    }
}

export const createStaff = async (staffData: CreateStaffRequest): Promise<SingleStaffResponse> => {
    try {
        const response = await api.post<SingleStaffResponse>('/staff', staffData)
        return response
    } catch (error) {
        console.error('Error creating staff:', error)
        throw error
    }
}

export const updateStaff = async (id: string, staffData: UpdateStaffRequest): Promise<SingleStaffResponse> => {
    try {
        const response = await api.put<SingleStaffResponse>(`/staff/${id}`, staffData)
        return response
    } catch (error) {
        console.error('Error updating staff:', error)
        throw error
    }
}

export const deleteStaff = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await api.delete<{ success: boolean; message: string }>(`/staff/${id}`)
        return response
    } catch (error) {
        console.error('Error deleting staff:', error)
        throw error
    }
}

export const getStaffByDepartment = async (department: string): Promise<StaffResponse> => {
    try {
        const response = await api.get<StaffResponse>(`/staff/department/${department}`)
        return response
    } catch (error) {
        console.error('Error fetching staff by department:', error)
        throw error
    }
}

export const toggleStaffStatus = async (id: string): Promise<SingleStaffResponse> => {
    try {
        const response = await api.put<SingleStaffResponse>(`/staff/${id}/toggle-status`)
        return response
    } catch (error) {
        console.error('Error toggling staff status:', error)
        throw error
    }
}
