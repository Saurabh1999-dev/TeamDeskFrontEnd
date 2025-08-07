// src/services/notificationApi.ts
import { api } from '@/lib/api'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'task_assigned' | 'task_updated' | 'task_completed' | 'project_update' | 'general'
  relatedEntityId?: string
  relatedEntityType?: 'task' | 'project' | 'client'
  isRead: boolean
  createdAt: string
}

export interface CreateNotificationRequest {
  userId: string
  title: string
  message: string
  type: string
  relatedEntityId?: string
  relatedEntityType?: string
}

// ✅ Send task assignment notification
export const sendTaskAssignmentNotification = async (
  taskId: string,
  assignedToId: string,
  customMessage?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post<{ success: boolean; message: string }>('/notifications/task-assignment', {
      taskId,
      assignedToId,
      customMessage
    })
    
    return response
  } catch (error) {
    throw error
  }
}

// ✅ Get user notifications
export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const response = await api.get<Notification[]>(`/notifications/user/${userId}`)
    return response
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw error
  }
}

// ✅ Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.put<{ success: boolean }>(`/notifications/${notificationId}/read`)
    return response
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// ✅ Mark all notifications as read for user
export const markAllNotificationsAsRead = async (userId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.put<{ success: boolean }>(`/notifications/user/${userId}/read-all`)
    return response
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

// ✅ Create custom notification
export const createNotification = async (data: CreateNotificationRequest): Promise<Notification> => {
  try {
    const response = await api.post<Notification>('/notifications', data)
    return response
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}
