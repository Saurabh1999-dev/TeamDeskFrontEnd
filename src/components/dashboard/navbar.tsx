// src/components/dashboard/navbar.tsx - Enhanced with SignalR and Sound
'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  Menu, 
  X,
  LogOut,
  Moon,
  Sun,
  ChevronDown,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { useNotificationsStore } from '@/stores/notifications-store'
import { useSignalR } from '@/hooks/useSignalR'
import { useNotificationSounds } from '@/hooks/useNotificationSounds'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface NavbarProps {
  onMobileMenuToggle?: () => void
}

export function Navbar({ onMobileMenuToggle }: NavbarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationsStore()
  
  // ✅ SignalR and Sound hooks
  const { connection, isConnected, connectionError } = useSignalR()
  const { 
    playTaskAssigned, 
    playGeneralNotification, 
    playSuccess, 
    playWarning, 
    playError 
  } = useNotificationSounds()

  const [searchQuery, setSearchQuery] = useState('')
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // ✅ Load notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // ✅ Set up SignalR event listeners
  useEffect(() => {
    if (!connection || !isConnected) return

    // Listen for new notifications
    const handleNewNotification = (notification: any, notificationType?: string) => {
      console.log('New notification received:', notification)
      
      // Add to store
      addNotification(notification)
      
      // Play sound based on notification type
      if (soundEnabled) {
        switch (notificationType) {
          case 'task_assigned':
            playTaskAssigned()
            break
          case 'success':
            playSuccess()
            break
          case 'warning':
            playWarning()
            break
          case 'error':
            playError()
            break
          default:
            playGeneralNotification()
        }
      }

      // Show toast notification
      toast.success(`${notification.title}: ${notification.message}`, {
        duration: 5000,
        position: 'top-right',
      })
    }

    // Listen for notification marked as read
    const handleNotificationRead = (notificationId: string) => {
      console.log('Notification marked as read:', notificationId)
      // This is handled by the markAsRead function
    }

    // Listen for all notifications marked as read
    const handleAllNotificationsRead = () => {
      console.log('All notifications marked as read')
      // This is handled by the markAllAsRead function
    }

    // Set up event listeners
    connection.on('ReceiveNotification', handleNewNotification)
    connection.on('NotificationMarkedAsRead', handleNotificationRead)
    connection.on('AllNotificationsMarkedAsRead', handleAllNotificationsRead)

    return () => {
      // Clean up event listeners
      connection.off('ReceiveNotification')
      connection.off('NotificationMarkedAsRead')
      connection.off('AllNotificationsMarkedAsRead')
    }
  }, [connection, isConnected, addNotification, soundEnabled, playTaskAssigned, playGeneralNotification, playSuccess, playWarning, playError])

  const getPageTitle = () => {
    const routeTitles: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/projects': 'Projects',
      '/staff': 'Staff Management',
      '/clients': 'Client Management',
      '/tasks': 'Task Management', // ✅ Added tasks page
    }
    return routeTitles[pathname] || 'TeamDesk'
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markAsRead(notification.id)
    }
    
    // Navigate to related entity if available
    if (notification.relatedEntityType && notification.relatedEntityId) {
      // Add navigation logic here
      switch (notification.relatedEntityType) {
        case 'task':
          // Navigate to task details
          break
        case 'project':
          // Navigate to project details
          break
        case 'client':
          // Navigate to client details
          break
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    toast.success('All notifications marked as read')
  }

  const getNotificationIcon = (type: string) => {
    debugger
    switch (type) {
      case 'task_assigned':
        return '📋'
      case 'project_update':
        return '📊'
      case 'client_update':
        return '👥'
      case 'success':
        return '✅'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      default:
        return '🔔'
    }
  }

  const formatNotificationTime = (createdAt: string) => {
    return formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, staff, clients..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 md:hidden">
            <Search className="w-5 h-5" />
          </button>

          {/* ✅ Connection Status Indicator */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>

          {/* ✅ Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            title={soundEnabled ? "Disable notification sounds" : "Enable notification sounds"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* ✅ Enhanced Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600' : ''}`} />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </button>

            {/* ✅ Enhanced Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications
                      {!isConnected && (
                        <span className="ml-2 text-xs text-red-500">(Offline)</span>
                      )}
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <span className="text-lg">
                                {getNotificationIcon(notification.type)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-gray-200">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Profile Menu - Keep existing implementation */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </header>
  )
}
