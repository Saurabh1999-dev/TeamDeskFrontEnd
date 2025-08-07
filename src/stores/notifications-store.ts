// src/stores/notifications-store.ts
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  getUnreadNotificationCount 
} from '@/services/notificationApi'
import { useAuthStore } from '@/stores/auth-store'
import { create } from 'zustand'

// ✅ Proper TypeScript interfaces
interface NotificationResponse {
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

interface NotificationsState {
  // State
  notifications: NotificationResponse[]
  unreadCount: number
  loading: boolean
  error: string | null

  // Actions
  fetchNotifications: () => Promise<void>
  addNotification: (notification: NotificationResponse) => void
  markAsRead: (notificationId: string) => Promise<boolean>
  markAllAsRead: () => Promise<boolean>
  deleteNotification: (notificationId: string) => Promise<boolean>
  updateUnreadCount: () => Promise<void>
  clearError: () => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  // Initial state
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  // ✅ Fetch user notifications with proper userId
  fetchNotifications: async () => {
    set({ loading: true, error: null })
    try {
      // Get userId from auth store
      const { user } = useAuthStore.getState()
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      // ✅ Pass userId to both functions
      const notifications = await getUserNotifications(user.id)
      const unreadCount = await getUnreadNotificationCount(user.id)
      
      set({ 
        notifications,
        unreadCount,
        loading: false 
      })
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch notifications', 
        loading: false 
      })
    }
  },

  // Add new notification (from SignalR)
  addNotification: (notification: NotificationResponse) => {
    set(state => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + (notification.isRead ? 0 : 1)
    }))
  },

  // ✅ Mark notification as read with proper type handling
  markAsRead: async (notificationId: string): Promise<boolean> => {
    try {
      const response = await markNotificationAsRead(notificationId)
      
      // ✅ Handle both boolean and object responses
      const success = typeof response === 'boolean' ? response : response === true
      
      if (success) {
        set(state => ({
          notifications: state.notifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        }))
      }
      return success
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark notification as read' })
      return false
    }
  },

  // ✅ Mark all notifications as read with proper type handling
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const { user } = useAuthStore.getState()
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const response = await markAllNotificationsAsRead(user.id)
      
      // ✅ Handle both boolean and object responses
      const success = typeof response === 'boolean' ? response : response === true
      
      if (success) {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0
        }))
      }
      return success
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark all notifications as read' })
      return false
    }
  },

  // ✅ Delete notification with proper type handling
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      const response = await deleteNotification(notificationId)
      
      // ✅ Handle both boolean and object responses
      const success = typeof response === 'boolean' ? response : response === true
      
      if (success) {
        set(state => {
          const notification = state.notifications.find(n => n.id === notificationId)
          const wasUnread = notification && !notification.isRead
          
          return {
            notifications: state.notifications.filter(n => n.id !== notificationId),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
          }
        })
      }
      return success
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete notification' })
      return false
    }
  },

  // ✅ Update unread count with proper userId
  updateUnreadCount: async () => {
    try {
      const { user } = useAuthStore.getState()
      if (!user?.id) {
        return
      }

      const unreadCount = await getUnreadNotificationCount(user.id)
      set({ unreadCount })
    } catch (error) {
      console.error('Failed to update unread count:', error)
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}))
