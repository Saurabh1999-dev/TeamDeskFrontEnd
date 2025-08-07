// src/stores/notifications-store.ts
import { create } from 'zustand'
import { 
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendTaskAssignmentNotification,
  type Notification
} from '@/services/notificationApi'

interface NotificationsState {
  // State
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  
  // Actions
  fetchNotifications: (userId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: (userId: string) => Promise<void>
  sendTaskAssignmentNotification: (taskId: string, assignedToId: string, customMessage?: string) => Promise<boolean>
  clearError: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // Fetch user notifications
  fetchNotifications: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const notifications = await getUserNotifications(userId)
      const unreadCount = notifications.filter(n => !n.isRead).length
      
      set({ 
        notifications, 
        unreadCount,
        loading: false,
        error: null 
      })
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error)
      set({ 
        error: error.message || 'Failed to fetch notifications', 
        loading: false,
      })
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark notification as read' })
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    try {
      await markAllNotificationsAsRead(userId)
      
      // Update local state
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, isRead: true })),
        unreadCount: 0
      }))
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark all notifications as read' })
    }
  },

  // Send task assignment notification
  sendTaskAssignmentNotification: async (taskId: string, assignedToId: string, customMessage?: string) => {
    try {
      const result = await sendTaskAssignmentNotification(taskId, assignedToId, customMessage)
      return result.success
    } catch (error: any) {
      set({ error: error.message || 'Failed to send task assignment notification' })
      return false
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}))
