// src/components/tasks/task-details-modal.tsx - Compact & Space-Optimized Design
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, CheckSquare, Calendar, Clock, User, Building, 
  Edit, MessageSquare, Paperclip, Download, Eye, 
  Send, Users, ChevronDown, ChevronRight
} from 'lucide-react'
import { 
  TaskStatus, 
  TaskPriority, 
  getTaskStatusString, 
  getTaskPriorityString, 
  getTaskStatusColor, 
  getTaskPriorityColor 
} from '@/types/taskEnums'
import type { Task } from '@/services/tasksApi'
import { useSignalR } from '@/hooks/useSignalR'
import { useAuthStore } from '@/stores/auth-store'
import { addTaskComment, TaskCommentResponse } from '@/services/taskCommentsApi'
import toast from 'react-hot-toast'

interface TaskDetailsModalProps {
  task: Task
  onClose: () => void
  onEdit: () => void
}

export function TaskDetailsModal({ task, onClose, onEdit }: TaskDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'files'>('overview')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'timeline']))
  
  // Chat state
  const [comments, setComments] = useState<TaskCommentResponse[]>(task.comments || [])
  const [newComment, setNewComment] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [usersTyping, setUsersTyping] = useState<string[]>([])
  const [sendingComment, setSendingComment] = useState(false)
  
  // Refs
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  
  // Hooks
  const { connection, isConnected } = useSignalR()
  const { user } = useAuthStore()

  // Helper functions
  const getUserFullName = (user: any) => {
    if (!user) return ''
    return user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown User'
  }

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // SignalR setup (keeping existing logic)
  useEffect(() => {
    if (!connection || !isConnected || !task.id) return

    connection.invoke('JoinTaskChat', task.id)
      .then(() => console.log(`Joined task chat for task ${task.id}`))
      .catch(err => console.error('Error joining task chat:', err))

    const handleNewComment = (comment: TaskCommentResponse) => {
      if (comment.taskId === task.id) {
        setComments(prev => [...prev, comment])
        scrollToBottom()
        if (comment.userId !== user?.id) {
          toast.success(`New comment from ${comment.userName}`)
        }
      }
    }

    const handleUserTyping = (data: { taskId: string; userName: string }) => {
      if (data.taskId === task.id && data.userName !== getUserFullName(user)) {
        setUsersTyping(prev => 
          prev.includes(data.userName) ? prev : [...prev, data.userName]
        )
      }
    }

    const handleUserStoppedTyping = (data: { taskId: string; userName: string }) => {
      if (data.taskId === task.id) {
        setUsersTyping(prev => prev.filter(name => name !== data.userName))
      }
    }

    connection.on('NewTaskComment', handleNewComment)
    connection.on('UserTyping', handleUserTyping)
    connection.on('UserStoppedTyping', handleUserStoppedTyping)

    return () => {
      connection.invoke('LeaveTaskChat', task.id)
      connection.off('NewTaskComment')
      connection.off('UserTyping')
      connection.off('UserStoppedTyping')
    }
  }, [connection, isConnected, task.id, user])

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const handleTyping = () => {
    if (!connection || !isConnected || !user) return
    const userName = getUserFullName(user)
    if (!userName) return

    if (!isTyping) {
      setIsTyping(true)
      connection.invoke('UserTyping', task.id, userName)
        .catch(err => console.error('Error sending typing indicator:', err))
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      connection.invoke('UserStoppedTyping', task.id, userName)
        .catch(err => console.error('Error stopping typing indicator:', err))
    }, 2000)
  }

  const handleSendComment = async () => {
    if (!newComment.trim() || sendingComment) return

    setSendingComment(true)
    try {
      await addTaskComment(task.id, { comment: newComment.trim() })
      setNewComment('')
      setIsTyping(false)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      if (connection && isConnected && user) {
        const userName = getUserFullName(user)
        if (userName) {
          connection.invoke('UserStoppedTyping', task.id, userName)
            .catch(err => console.error('Error stopping typing indicator:', err))
        }
      }
    } catch (error) {
      console.error('Error sending comment:', error)
      toast.error('Failed to send comment')
    } finally {
      setSendingComment(false)
      messageInputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendComment()
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📑'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col"
      >
        {/* ✅ Compact Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 line-clamp-1">{task.title}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>ID: {task.id.substring(0, 8)}...</span>
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Live' : 'Offline'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                {getTaskStatusString(task.status)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                {getTaskPriorityString(task.priority)}
              </span>
            </div>
            <button
              onClick={onEdit}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* ✅ Compact Tabs */}
        <div className="flex border-b bg-white flex-shrink-0">
          {[
            { key: 'overview', label: 'Overview', icon: CheckSquare },
            { key: 'chat', label: `Chat (${comments.length})`, icon: MessageSquare, badge: isConnected },
            { key: 'files', label: `Files (${task.attachments?.length || 0})`, icon: Paperclip }
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors relative ${
                activeTab === key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
              </div>
            </button>
          ))}
        </div>

        {/* ✅ Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="h-full overflow-y-auto p-4">
              <div className="space-y-3">
                {/* Description */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{task.description}</p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white border rounded-lg p-2 text-center">
                    <Building className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="text-xs font-medium text-gray-900 truncate">{task.projectName}</p>
                  </div>
                  <div className="bg-white border rounded-lg p-2 text-center">
                    <User className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Assignee</p>
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {task.assignedToName || 'Unassigned'}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-2 text-center">
                    <Calendar className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className={`text-xs font-medium truncate ${task.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <div className="bg-white border rounded-lg p-2 text-center">
                    <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs text-gray-500">Est. Hours</p>
                    <p className="text-xs font-medium text-gray-900">{task.estimatedHours || 0}h</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">{(task as any).progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(task as any).progress || 0}%` }}
                    />
                  </div>
                </div>

                {/* Collapsible Sections */}
                {[
                  {
                    key: 'timeline',
                    title: 'Timeline',
                    icon: Calendar,
                    content: (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <label className="text-xs font-medium text-gray-600">Start Date</label>
                          <p className="text-gray-900">{formatDate(task.startDate)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Due Date</label>
                          <p className={task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
                            {formatDate(task.dueDate)}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Created</label>
                          <p className="text-gray-900">{formatDateTime(task.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-600">Updated</label>
                          <p className="text-gray-900">{formatDateTime(task.updatedAt)}</p>
                        </div>
                      </div>
                    )
                  },
                  {
                    key: 'assignment',
                    title: 'Assignment Details',
                    icon: User,
                    content: (
                      <div className="space-y-3">
                        {task.assignedToName ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {getInitials(task.assignedToName)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{task.assignedToName}</p>
                              <p className="text-xs text-gray-600">{task.assignedToEmail}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No assignee</p>
                        )}
                        <div>
                          <label className="text-xs font-medium text-gray-600">Created By</label>
                          <p className="text-sm text-gray-900">{task.createdByName}</p>
                        </div>
                      </div>
                    )
                  }
                ].map(({ key, title, icon: Icon, content }) => (
                  <div key={key} className="bg-white border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleSection(key)}
                      className="w-full p-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{title}</span>
                      </div>
                      {expandedSections.has(key) ? 
                        <ChevronDown className="w-4 h-4 text-gray-400" /> :
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      }
                    </button>
                    <AnimatePresence>
                      {expandedSections.has(key) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t bg-gray-50"
                        >
                          <div className="p-3">
                            {content}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="bg-white border rounded-lg p-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ Compact Chat Tab */}
          {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No messages yet</p>
                    <p className="text-xs text-gray-400">Start the conversation!</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-2 ${
                          comment.userId === user?.id ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(comment.userName)}
                        </div>
                        <div className={`flex-1 ${comment.userId === user?.id ? 'text-right' : ''}`}>
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-medium text-gray-900">
                              {comment.userId === user?.id ? 'You' : comment.userName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(comment.createdAt)}
                            </span>
                          </div>
                          <div className={`inline-block max-w-xs px-3 py-1.5 rounded-lg text-sm ${
                            comment.userId === user?.id 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="whitespace-pre-wrap">{comment.comment}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
                
                {/* Typing Indicators */}
                {usersTyping.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 text-xs text-gray-500"
                  >
                    <div className="flex space-x-0.5">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                    <span>
                      {usersTyping.length === 1 
                        ? `${usersTyping[0]} is typing...`
                        : `${usersTyping.join(', ')} are typing...`
                      }
                    </span>
                  </motion.div>
                )}
                
                <div ref={commentsEndRef} />
              </div>

              {/* ✅ Compact Message Input */}
              <div className="border-t bg-white p-3">
                {!isConnected && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                    Connection lost. Reconnecting...
                  </div>
                )}
                
                <div className="flex gap-2">
                  <textarea
                    ref={messageInputRef}
                    value={newComment}
                    onChange={(e) => {
                      setNewComment(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Type your message..." : "Connecting..."}
                    disabled={!isConnected || sendingComment}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                  />
                  <button
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || !isConnected || sendingComment}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {sendingComment ? (
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                  <span>Enter to send, Shift+Enter for new line</span>
                  <span>{newComment.length}/500</span>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Compact Files Tab */}
          {activeTab === 'files' && (
            <div className="h-full overflow-y-auto p-3">
              {task.attachments && task.attachments.length > 0 ? (
                <div className="space-y-2">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="bg-white border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-lg flex-shrink-0">
                          {getFileIcon(attachment.fileType)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.originalFileName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {formatFileSize(attachment.fileSize)} • {attachment.uploadedByName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(attachment.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {attachment.fileUrl && (
                            <>
                              <a
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="View file"
                              >
                                <Eye className="w-3 h-3" />
                              </a>
                              <a
                                href={attachment.fileUrl}
                                download={attachment.originalFileName}
                                className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Download file"
                              >
                                <Download className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No attachments</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
