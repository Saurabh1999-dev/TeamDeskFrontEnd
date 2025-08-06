// src/stores/projects-store.ts - Updated with enums
import { create } from 'zustand'
import { 
  getAllProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  updateProjectProgress,
  assignStaffToProject,
  removeStaffFromProject,
  type Project, 
  type CreateProjectRequest, 
  type UpdateProjectRequest 
} from '@/services/projectsApi'
import { ProjectRole, ProjectStatus, ProjectPriority } from '@/types/projects'

interface ProjectsState {
  // State
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
  
  // Actions
  fetchProjects: () => Promise<void>
  fetchProjectById: (id: string) => Promise<void>
  createProject: (data: CreateProjectRequest) => Promise<boolean>
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>
  updateProjectProgress: (id: string, progress: number) => Promise<boolean>
  assignStaff: (projectId: string, staffId: string, role: ProjectRole, allocation: number) => Promise<boolean>
  removeStaff: (projectId: string, staffId: string) => Promise<boolean>
  clearError: () => void
  clearCurrentProject: () => void
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  // Initial state
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  // Fetch all projects
  fetchProjects: async () => {
    set({ loading: true, error: null })
    try {
      const projectsArray = await getAllProjects()
      
      console.log('📊 Projects array received:', projectsArray)
      console.log('📊 Projects count:', projectsArray.length)
      
      // Process projects and add calculated fields with proper enum handling
      const processedProjects = projectsArray.map(project => ({
        ...project,
        status: project.status as ProjectStatus,
        priority: project.priority as ProjectPriority,
        isOverdue: project.isOverdue || new Date(project.deadline) < new Date(),
        daysRemaining: project.daysRemaining || Math.ceil(
          (new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        progress: project.progress || 0,
        staffAssignments: (project.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: project.tags || [],
      }))
      
      set({ 
        projects: processedProjects, 
        loading: false,
        error: null 
      })
    } catch (error: any) {
      console.error('❌ Error fetching projects:', error)
      set({ 
        error: error.message || 'Failed to fetch projects', 
        loading: false,
        projects: []
      })
    }
  },

  // Fetch project by ID
  fetchProjectById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const project = await getProjectById(id)
      
      // Process project with proper enum types
      const processedProject = {
        ...project,
        status: project.status as ProjectStatus,
        priority: project.priority as ProjectPriority,
        isOverdue: project.isOverdue || new Date(project.deadline) < new Date(),
        daysRemaining: project.daysRemaining || Math.ceil(
          (new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        progress: project.progress || 0,
        staffAssignments: (project.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: project.tags || [],
      }
      
      set({ currentProject: processedProject, loading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch project', loading: false })
    }
  },

  // Create new project
  createProject: async (data: CreateProjectRequest) => {
    set({ loading: true, error: null })
    try {
      const newProject = await createProject(data)
      
      // Add to existing projects list with proper enum types
      const processedProject = {
        ...newProject,
        status: newProject.status as ProjectStatus,
        priority: newProject.priority as ProjectPriority,
        isOverdue: new Date(newProject.deadline) < new Date(),
        daysRemaining: Math.ceil(
          (new Date(newProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        progress: newProject.progress || 0,
        staffAssignments: (newProject.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: newProject.tags || [],
      }
      
      set(state => ({
        projects: [...state.projects, processedProject],
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to create project', loading: false })
      return false
    }
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectRequest) => {
    set({ loading: true, error: null })
    try {
      const updatedProject = await updateProject(id, data)
      
      // Process the updated project with proper enum types
      const processedProject = {
        ...updatedProject,
        status: updatedProject.status as ProjectStatus,
        priority: updatedProject.priority as ProjectPriority,
        isOverdue: new Date(updatedProject.deadline) < new Date(),
        daysRemaining: Math.ceil(
          (new Date(updatedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        progress: updatedProject.progress || 0,
        staffAssignments: (updatedProject.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: updatedProject.tags || [],
      }
      
      // Update project in the list
      set(state => ({
        projects: state.projects.map(p => p.id === id ? processedProject : p),
        currentProject: state.currentProject?.id === id ? processedProject : state.currentProject,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project', loading: false })
      return false
    }
  },

  // Delete project
  deleteProject: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await deleteProject(id)
      
      // Remove project from the list
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete project', loading: false })
      return false
    }
  },

  // Update project progress
  updateProjectProgress: async (id: string, progress: number) => {
    try {
      const updatedProject = await updateProjectProgress(id, progress)
      
      const processedProject = {
        ...updatedProject,
        status: updatedProject.status as ProjectStatus,
        priority: updatedProject.priority as ProjectPriority,
        isOverdue: new Date(updatedProject.deadline) < new Date(),
        daysRemaining: Math.ceil(
          (new Date(updatedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        staffAssignments: (updatedProject.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: updatedProject.tags || [],
      }
      
      // Update project progress in the list
      set(state => ({
        projects: state.projects.map(p => p.id === id ? processedProject : p),
        currentProject: state.currentProject?.id === id ? processedProject : state.currentProject,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to update project progress' })
      return false
    }
  },

  // Assign staff to project
  assignStaff: async (projectId: string, staffId: string, role: ProjectRole, allocation: number) => {
    try {
      const updatedProject = await assignStaffToProject(projectId, staffId, role, allocation)
      
      const processedProject = {
        ...updatedProject,
        status: updatedProject.status as ProjectStatus,
        priority: updatedProject.priority as ProjectPriority,
        isOverdue: new Date(updatedProject.deadline) < new Date(),
        daysRemaining: Math.ceil(
          (new Date(updatedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        staffAssignments: (updatedProject.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: updatedProject.tags || [],
      }
      
      // Update project in the list
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? processedProject : p),
        currentProject: state.currentProject?.id === projectId ? processedProject : state.currentProject,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to assign staff to project' })
      return false
    }
  },

  // Remove staff from project
  removeStaff: async (projectId: string, staffId: string) => {
    try {
      const updatedProject = await removeStaffFromProject(projectId, staffId)
      
      const processedProject = {
        ...updatedProject,
        status: updatedProject.status as ProjectStatus,
        priority: updatedProject.priority as ProjectPriority,
        isOverdue: new Date(updatedProject.deadline) < new Date(),
        daysRemaining: Math.ceil(
          (new Date(updatedProject.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
        staffAssignments: (updatedProject.staffAssignments || []).map(assignment => ({
          ...assignment,
          role: assignment.role as ProjectRole
        })),
        tags: updatedProject.tags || [],
      }
      
      // Update project in the list
      set(state => ({
        projects: state.projects.map(p => p.id === projectId ? processedProject : p),
        currentProject: state.currentProject?.id === projectId ? processedProject : state.currentProject,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to remove staff from project' })
      return false
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current project
  clearCurrentProject: () => set({ currentProject: null }),
}))
