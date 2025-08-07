// src/services/projectsApi.ts - Updated with enums
import { api } from '@/lib/api'
import { ProjectStatus, ProjectPriority, ProjectRole } from '@/types/projects'

export interface Project {
  id: string
  name: string
  description: string
  client: {
    id: string
    name: string
    contactPerson: string
    contactEmail: string
    contactPhone: string
  }
  startDate: string
  endDate?: string
  deadline: string
  budget: number
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  isOverdue: boolean
  daysRemaining: number
  staffAssignments: ProjectStaffAssignment[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface ProjectStaffAssignment {
  id: string
  staffId: string
  staffName: string
  staffEmail: string
  role: ProjectRole // ✅ Updated to use enum
  allocationPercentage: number
  assignedDate: string
  isActive: boolean
}

export interface CreateProjectRequest {
  name: string
  description: string
  clientId: string
  startDate: string
  deadline: string
  budget: number
  status: ProjectStatus // ✅ Updated to use enum
  priority: ProjectPriority // ✅ Updated to use enum
  tags: string[]
  staffAssignments: {
    staffId: string
    role: ProjectRole // ✅ Updated to use enum
    allocationPercentage: number
  }[]
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
  clientId?: string
  startDate?: string
  endDate?: string
  deadline?: string
  budget?: number
  status?: ProjectStatus // ✅ Updated to use enum
  priority?: ProjectPriority // ✅ Updated to use enum
  progress?: number
  tags?: string[]
  staffAssignments?: {
    staffId: string
    role: ProjectRole // ✅ Updated to use enum
    allocationPercentage: number
  }[]
}

// ✅ All API functions remain the same - they now use proper enum types
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get<Project[]>('/Project')
    
    // Process response to ensure enum values are properly typed
    const processedProjects = response.map(project => ({
      ...project,
      status: project.status as ProjectStatus,
      priority: project.priority as ProjectPriority,
      staffAssignments: project.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }))
    return processedProjects
  } catch (error) {
    throw error
  }
}

export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await api.get<Project>(`/Project/${id}`)
    
    // Ensure enum types are properly set
    return {
      ...response,
      status: response.status as ProjectStatus,
      priority: response.priority as ProjectPriority,
      staffAssignments: response.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }
  } catch (error) {
    console.error('Error fetching project by ID:', error)
    throw error
  }
}

export const createProject = async (projectData: CreateProjectRequest): Promise<Project> => {
  try {
    const response = await api.post<Project>('/Project', projectData)
    
    return {
      ...response,
      status: response.status as ProjectStatus,
      priority: response.priority as ProjectPriority,
      staffAssignments: response.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }
  } catch (error) {
    console.error('Error creating project:', error)
    throw error
  }
}

export const updateProject = async (id: string, projectData: UpdateProjectRequest): Promise<Project> => {
  try {
    const response = await api.put<Project>(`/Project/${id}`, projectData)
    
    return {
      ...response,
      status: response.status as ProjectStatus,
      priority: response.priority as ProjectPriority,
      staffAssignments: response.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }
  } catch (error) {
    console.error('Error updating project:', error)
    throw error
  }
}

// Assign staff with enum role
export const assignStaffToProject = async (
  projectId: string, 
  staffId: string, 
  role: ProjectRole, // ✅ Updated to use enum
  allocationPercentage: number
): Promise<Project> => {
  try {
    const response = await api.post<Project>(`/Project/${projectId}/assign-staff`, {
      staffId,
      role,
      allocationPercentage
    })
    
    return {
      ...response,
      status: response.status as ProjectStatus,
      priority: response.priority as ProjectPriority,
      staffAssignments: response.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }
  } catch (error) {
    console.error('Error assigning staff to project:', error)
    throw error
  }
}

// Keep all other API functions the same...
export const deleteProject = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/Project/${id}`)
    return response
  } catch (error) {
    console.error('Error deleting project:', error)
    throw error
  }
}

export const updateProjectProgress = async (id: string, progress: number): Promise<Project> => {
  try {
    const response = await api.put<Project>(`/Project/${id}/progress`, { progress })
    
    return {
      ...response,
      status: response.status as ProjectStatus,
      priority: response.priority as ProjectPriority,
      staffAssignments: response.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }
  } catch (error) {
    console.error('Error updating project progress:', error)
    throw error
  }
}

export const removeStaffFromProject = async (projectId: string, staffId: string): Promise<Project> => {
  try {
    const response = await api.delete<Project>(`/Project/${projectId}/staff/${staffId}`)
    
    return {
      ...response,
      status: response.status as ProjectStatus,
      priority: response.priority as ProjectPriority,
      staffAssignments: response.staffAssignments.map(assignment => ({
        ...assignment,
        role: assignment.role as ProjectRole
      }))
    }
  } catch (error) {
    console.error('Error removing staff from project:', error)
    throw error
  }
}
