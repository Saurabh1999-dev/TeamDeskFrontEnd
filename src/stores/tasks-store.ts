// src/stores/tasks-store.ts
import { create } from 'zustand'
import { 
  getAllTasks, 
  getTaskById, 
  getTasksByProject,
  getTasksByAssignee,
  createTask, 
  updateTask, 
  deleteTask,
  assignTask,
  updateTaskStatus,
  addTaskComment,
  type Task, 
  type CreateTaskRequest, 
  type UpdateTaskRequest,
  type AssignTaskRequest,
  type TaskComment,
  deleteTaskAttachment,
  uploadTaskAttachment
} from '@/services/tasksApi'
import { TaskStatus } from '@/types/taskEnums'

interface TasksState {
  // State
  tasks: Task[]
  currentTask: Task | null
  projectTasks: Task[]
  myTasks: Task[]
  loading: boolean
  error: string | null
  
  // Actions
  fetchTasks: () => Promise<void>
  fetchTaskById: (id: string) => Promise<void>
  fetchTasksByProject: (projectId: string) => Promise<void>
  fetchMyTasks: (userId: string) => Promise<void>
  createTask: (data: CreateTaskRequest) => Promise<boolean>
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  assignTask: (data: AssignTaskRequest) => Promise<boolean>
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<boolean>
  addComment: (taskId: string, comment: string) => Promise<boolean>
  clearError: () => void
  clearCurrentTask: () => void
  uploadAttachment: (taskId: string, file: File) => Promise<boolean>
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<boolean>
}

export const useTasksStore = create<TasksState>((set, get) => ({
  // Initial state
  tasks: [],
  currentTask: null,
  projectTasks: [],
  myTasks: [],
  loading: false,
  error: null,

  // Fetch all tasks
  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const tasksArray = await getAllTasks()      
      set({ 
        tasks: tasksArray, 
        loading: false,
        error: null 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch tasks', 
        loading: false,
        tasks: []
      })
    }
  },

  uploadAttachment: async (taskId: string, file: File) => {
    try {
      const attachment = await uploadTaskAttachment(taskId, file)
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t
        ),
        projectTasks: state.projectTasks.map(t => 
          t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t
        ),
        myTasks: state.myTasks.map(t => 
          t.id === taskId ? { ...t, attachments: [...t.attachments, attachment] } : t
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, attachments: [...state.currentTask.attachments, attachment] }
          : state.currentTask,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to upload attachment' })
      return false
    }
  },

  // ✅ Delete attachment
  deleteAttachment: async (taskId: string, attachmentId: string) => {
    try {
      await deleteTaskAttachment(taskId, attachmentId)
      
      // Remove attachment from all relevant arrays
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, attachments: t.attachments.filter(a => a.id !== attachmentId) } : t
        ),
        projectTasks: state.projectTasks.map(t => 
          t.id === taskId ? { ...t, attachments: t.attachments.filter(a => a.id !== attachmentId) } : t
        ),
        myTasks: state.myTasks.map(t => 
          t.id === taskId ? { ...t, attachments: t.attachments.filter(a => a.id !== attachmentId) } : t
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, attachments: state.currentTask.attachments.filter(a => a.id !== attachmentId) }
          : state.currentTask,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete attachment' })
      return false
    }
  },

  // Fetch task by ID
  fetchTaskById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const task = await getTaskById(id)
      set({ currentTask: task, loading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch task', loading: false })
    }
  },

  // Fetch tasks by project
  fetchTasksByProject: async (projectId: string) => {
    set({ loading: true, error: null })
    try {
      const tasks = await getTasksByProject(projectId)
      set({ projectTasks: tasks, loading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch project tasks', loading: false })
    }
  },

  // Fetch tasks assigned to user
  fetchMyTasks: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const tasks = await getTasksByAssignee(userId)
      set({ myTasks: tasks, loading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch my tasks', loading: false })
    }
  },

  // Create new task
  createTask: async (data: CreateTaskRequest) => {
    set({ loading: true, error: null })
    try {
      const newTask = await createTask(data)
      
      // Add to existing tasks list
      set(state => ({
        tasks: [...state.tasks, newTask],
        projectTasks: data.projectId ? [...state.projectTasks, newTask] : state.projectTasks,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to create task', loading: false })
      return false
    }
  },

  // Update task
  updateTask: async (id: string, data: UpdateTaskRequest) => {
    set({ loading: true, error: null })
    try {
      const updatedTask = await updateTask(id, data)
      
      // Update task in all relevant arrays
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        projectTasks: state.projectTasks.map(t => t.id === id ? updatedTask : t),
        myTasks: state.myTasks.map(t => t.id === id ? updatedTask : t),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to update task', loading: false })
      return false
    }
  },

  // Delete task
  deleteTask: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await deleteTask(id)
      
      // Remove task from all arrays
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        projectTasks: state.projectTasks.filter(t => t.id !== id),
        myTasks: state.myTasks.filter(t => t.id !== id),
        currentTask: state.currentTask?.id === id ? null : state.currentTask,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete task', loading: false })
      return false
    }
  },

  // Assign task to staff member
  assignTask: async (data: AssignTaskRequest) => {
    try {
      const updatedTask = await assignTask(data)
      
      // Update task in all relevant arrays
      set(state => ({
        tasks: state.tasks.map(t => t.id === data.taskId ? updatedTask : t),
        projectTasks: state.projectTasks.map(t => t.id === data.taskId ? updatedTask : t),
        myTasks: updatedTask.assignedToId === data.assignedToId 
          ? [...state.myTasks.filter(t => t.id !== data.taskId), updatedTask]
          : state.myTasks.filter(t => t.id !== data.taskId),
        currentTask: state.currentTask?.id === data.taskId ? updatedTask : state.currentTask,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to assign task' })
      return false
    }
  },

  // Update task status
  updateTaskStatus: async (id: string, status: TaskStatus) => {
    try {
      const updatedTask = await updateTaskStatus(id, status)
      
      // Update task status in all arrays
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? updatedTask : t),
        projectTasks: state.projectTasks.map(t => t.id === id ? updatedTask : t),
        myTasks: state.myTasks.map(t => t.id === id ? updatedTask : t),
        currentTask: state.currentTask?.id === id ? updatedTask : state.currentTask,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to update task status' })
      return false
    }
  },

  // Add comment to task
  addComment: async (taskId: string, comment: string) => {
    try {
      const newComment = await addTaskComment(taskId, comment)
      
      // Add comment to task in all arrays
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
        ),
        projectTasks: state.projectTasks.map(t => 
          t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
        ),
        myTasks: state.myTasks.map(t => 
          t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
        ),
        currentTask: state.currentTask?.id === taskId 
          ? { ...state.currentTask, comments: [...state.currentTask.comments, newComment] }
          : state.currentTask,
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to add comment' })
      return false
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Clear current task
  clearCurrentTask: () => set({ currentTask: null }),
}))
