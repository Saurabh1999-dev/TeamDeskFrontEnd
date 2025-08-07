import { api } from "@/lib/api"

export interface NotificationResponse {
  id: string
  userId: string
  title: string
  message: string
  type: string
  relatedEntityId?: string
  relatedEntityType?: string
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

// ✅ Get user notifications
export const getUserNotifications = async (userId: string): Promise<NotificationResponse[]> => {
  try {
    const response = await api.get<NotificationResponse[]>(`/notifications/user/${userId}`)
    return response
  } catch (error) {
    console.error('Error fetching user notifications:', error)
    throw error
  }
}

// ✅ Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await api.put<{ success: boolean }>(`/notifications/${notificationId}/mark-read`)
    return response.success
  } catch (error) {
    console.error('Error marking notification as read:', error)
    throw error
  }
}

// ✅ Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<boolean> => {
  try {
    const response = await api.put<{ success: boolean; count: number }>(`/notifications/user/${userId}/mark-all-read`)
    return response.success
  } catch (error) {
    console.error('Error marking all notifications as read:', error)
    throw error
  }
}

// ✅ Delete notification
export const deleteNotification = async (notificationId: string): Promise<boolean> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/notifications/${notificationId}`)
    return response.success
  } catch (error) {
    console.error('Error deleting notification:', error)
    throw error
  }
}

// ✅ Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const response = await api.get<{ count: number }>(`/notifications/user/${userId}/unread-count`)
    return response.count
  } catch (error) {
    console.error('Error fetching unread notification count:', error)
    throw error
  }
}

// ✅ Create notification
export const createNotification = async (request: CreateNotificationRequest): Promise<NotificationResponse> => {
  try {
    const response = await api.post<NotificationResponse>('/notifications', request)
    return response
  } catch (error) {
    console.error('Error creating notification:', error)
    throw error
  }
}
