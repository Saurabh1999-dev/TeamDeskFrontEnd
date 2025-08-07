// src/services/tasksApi.ts
import { api } from '@/lib/api'
import { TaskStatus, TaskPriority } from '@/types/taskEnums'
export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  originalFileName: string
  fileType: string
  fileUrl: string
  fileSize: number
  uploadedByName: string
  createdAt: string
}
export interface Task {
  id: string
  title: string
  description: string
  projectId: string
  projectName: string
  assignedToId?: string
  assignedToName?: string
  assignedToEmail?: string
  createdById: string
  createdByName: string
  status: TaskStatus
  priority: TaskPriority
  startDate?: string
  dueDate?: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  isOverdue: boolean
  tags: string[]
  attachments: TaskAttachment[]
  comments: TaskComment[]
  createdAt: string
  updatedAt: string
}

export interface TaskComment {
  id: string
  taskId: string
  userId: string
  userName: string
  comment: string
  createdAt: string
}

export interface CreateTaskRequest {
  title: string
  description: string
  projectId: string
  assignedToId?: string
  status: TaskStatus
  priority: TaskPriority
  startDate?: string
  dueDate?: string
  estimatedHours?: number
  tags: string[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  assignedToId?: string
  status?: TaskStatus
  priority?: TaskPriority
  startDate?: string
  dueDate?: string
  completedDate?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
}

export interface AssignTaskRequest {
  taskId: string
  assignedToId: string
  sendNotification?: boolean
}

// ✅ GET - Fetch all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    const response = await api.get<Task[]>('/tasks')
    console.log('📡 Tasks response:', response)
    
    return response.map(task => ({
      ...task,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      tags: task.tags || [],
      attachments: task.attachments || [],
      comments: task.comments || [],
      isOverdue: task.isOverdue || (task.dueDate ? new Date(task.dueDate) < new Date() : false),
    }))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

export const uploadTaskAttachment = async (taskId: string, file: File): Promise<TaskAttachment> => {
  try {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData, // Don't set Content-Type, browser will set it with boundary
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error uploading attachment:', error)
    throw error
  }
}

// ✅ Delete task attachment
export const deleteTaskAttachment = async (taskId: string, attachmentId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/tasks/${taskId}/attachments/${attachmentId}`)
    return response
  } catch (error) {
    console.error('Error deleting attachment:', error)
    throw error
  }
}

// ✅ Get task attachments
export const getTaskAttachments = async (taskId: string): Promise<TaskAttachment[]> => {
  try {
    const response = await api.get<TaskAttachment[]>(`/tasks/${taskId}/attachments`)
    return response
  } catch (error) {
    console.error('Error fetching attachments:', error)
    throw error
  }
}

// ✅ GET - Fetch tasks by project
export const getTasksByProject = async (projectId: string): Promise<Task[]> => {
  try {
    const response = await api.get<Task[]>(`/tasks/project/${projectId}`)
    
    return response.map(task => ({
      ...task,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      tags: task.tags || [],
      attachments: task.attachments || [],
      comments: task.comments || [],
      isOverdue: task.isOverdue || (task.dueDate ? new Date(task.dueDate) < new Date() : false),
    }))
  } catch (error) {
    console.error('Error fetching tasks by project:', error)
    throw error
  }
}

// ✅ GET - Fetch tasks assigned to user
export const getTasksByAssignee = async (userId: string): Promise<Task[]> => {
  try {
    const response = await api.get<Task[]>(`/tasks/assigned/${userId}`)
    
    return response.map(task => ({
      ...task,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      tags: task.tags || [],
      attachments: task.attachments || [],
      comments: task.comments || [],
      isOverdue: task.isOverdue || (task.dueDate ? new Date(task.dueDate) < new Date() : false),
    }))
  } catch (error) {
    console.error('Error fetching tasks by assignee:', error)
    throw error
  }
}

// ✅ GET - Fetch task by ID
export const getTaskById = async (id: string): Promise<Task> => {
  try {
    const response = await api.get<Task>(`/tasks/${id}`)
    
    return {
      ...response,
      status: response.status as TaskStatus,
      priority: response.priority as TaskPriority,
      tags: response.tags || [],
      attachments: response.attachments || [],
      comments: response.comments || [],
      isOverdue: response.isOverdue || (response.dueDate ? new Date(response.dueDate) < new Date() : false),
    }
  } catch (error) {
    console.error('Error fetching task by ID:', error)
    throw error
  }
}

// ✅ POST - Create new task
export const createTask = async (taskData: CreateTaskRequest): Promise<Task> => {
  try {
    const response = await api.post<Task>('/tasks', taskData)
    console.log('📡 Created task:', response)
    
    return {
      ...response,
      status: response.status as TaskStatus,
      priority: response.priority as TaskPriority,
      tags: response.tags || [],
      attachments: response.attachments || [],
      comments: response.comments || [],
      isOverdue: response.isOverdue || (response.dueDate ? new Date(response.dueDate) < new Date() : false),
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

// ✅ PUT - Update task
export const updateTask = async (id: string, taskData: UpdateTaskRequest): Promise<Task> => {
  try {
    const response = await api.put<Task>(`/tasks/${id}`, taskData)
    console.log('📡 Updated task:', response)
    
    return {
      ...response,
      status: response.status as TaskStatus,
      priority: response.priority as TaskPriority,
      tags: response.tags || [],
      attachments: response.attachments || [],
      comments: response.comments || [],
      isOverdue: response.isOverdue || (response.dueDate ? new Date(response.dueDate) < new Date() : false),
    }
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

// ✅ POST - Assign task to staff member
export const assignTask = async (assignmentData: AssignTaskRequest): Promise<Task> => {
  try {
    const response = await api.post<Task>('/tasks/assign', assignmentData)
    console.log('📡 Assigned task:', response)
    
    return {
      ...response,
      status: response.status as TaskStatus,
      priority: response.priority as TaskPriority,
      tags: response.tags || [],
      attachments: response.attachments || [],
      comments: response.comments || [],
      isOverdue: response.isOverdue || (response.dueDate ? new Date(response.dueDate) < new Date() : false),
    }
  } catch (error) {
    console.error('Error assigning task:', error)
    throw error
  }
}

// ✅ PUT - Update task status
export const updateTaskStatus = async (id: string, status: TaskStatus): Promise<Task> => {
  try {
    const response = await api.put<Task>(`/tasks/${id}/status`, { status })
    console.log('📡 Updated task status:', response)
    
    return {
      ...response,
      status: response.status as TaskStatus,
      priority: response.priority as TaskPriority,
      tags: response.tags || [],
      attachments: response.attachments || [],
      comments: response.comments || [],
      isOverdue: response.isOverdue || (response.dueDate ? new Date(response.dueDate) < new Date() : false),
    }
  } catch (error) {
    console.error('Error updating task status:', error)
    throw error
  }
}

// ✅ POST - Add comment to task
export const addTaskComment = async (taskId: string, comment: string): Promise<TaskComment> => {
  try {
    const response = await api.post<TaskComment>(`/tasks/${taskId}/comments`, { comment })
    console.log('📡 Added task comment:', response)
    
    return response
  } catch (error) {
    console.error('Error adding task comment:', error)
    throw error
  }
}

// ✅ DELETE - Delete task
export const deleteTask = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(`/tasks/${id}`)
    console.log('📡 Deleted task:', response)
    
    if (typeof response === 'object' && response !== null) {
      return response
    } else {
      return { success: true, message: 'Task deleted successfully' }
    }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

// ✅ GET - Get task statistics
export const getTaskStats = async (): Promise<{
  total: number
  byStatus: { [key: string]: number }
  byPriority: { [key: string]: number }
  overdue: number
}> => {
  try {
    const response = await api.get<{
      total: number
      byStatus: { [key: string]: number }
      byPriority: { [key: string]: number }
      overdue: number
    }>('/tasks/stats')
    
    return response
  } catch (error) {
    console.error('Error fetching task statistics:', error)
    throw error
  }
}
