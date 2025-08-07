// src/components/tasks/task-details-modal.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, CheckSquare, Calendar, Clock, User, Building, 
  Edit, MessageSquare, Paperclip, Download, Eye 
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

interface TaskDetailsModalProps {
  task: Task
  onClose: () => void
  onEdit: () => void
}

export function TaskDetailsModal({ task, onClose, onEdit }: TaskDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'attachments'>('details')

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
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
    <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
              <p className="text-sm text-gray-600">ID: {task.id.substring(0, 8)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Task
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Task Title and Status */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTaskStatusColor(task.status)}`}>
                {getTaskStatusString(task.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTaskPriorityColor(task.priority)}`}>
                {getTaskPriorityString(task.priority)}
              </span>
            </div>
          </div>
          <p className="text-gray-700 leading-relaxed">{task.description}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Comments ({task.comments?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'attachments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Attachments ({task.attachments?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Project Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Project</label>
                    <p className="text-gray-900">{task.projectName}</p>
                  </div>
                </div>
              </div>

              {/* Assignment */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Assignment
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned To</label>
                    {task.assignedToName ? (
                      <div className="flex items-center gap-3 mt-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(task.assignedToName)}
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{task.assignedToName}</p>
                          <p className="text-sm text-gray-600">{task.assignedToEmail}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Unassigned</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created By</label>
                    <p className="text-gray-900">{task.createdByName}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="text-gray-900">{formatDate(task.startDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Due Date</label>
                    <p className={task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {formatDate(task.dueDate)}
                      {task.isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                  {task.completedDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Completed Date</label>
                      <p className="text-gray-900">{formatDate(task.completedDate)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">{formatDateTime(task.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{formatDateTime(task.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Progress & Time */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Progress & Time
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Progress</label>
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-sm mb-1">
                        {/* <span>{task.progress}% Complete</span> */}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        //   style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estimated Hours</label>
                    <p className="text-gray-900">{task.estimatedHours || 0} hours</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Actual Hours</label>
                    <p className="text-gray-900">{task.actualHours || 0} hours</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
              </h3>
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-4">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getInitials(comment.userName)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{comment.userName}</p>
                          <p className="text-xs text-gray-600">{formatDateTime(comment.createdAt)}</p>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-11">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No comments yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Attachments
              </h3>
              {task.attachments && task.attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {task.attachments.map((attachment) => (
                    <div key={attachment.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl flex-shrink-0">
                          {getFileIcon(attachment.fileType)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {attachment.originalFileName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatFileSize(attachment.fileSize)} • {attachment.uploadedByName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(attachment.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {attachment.fileUrl && (
                            <>
                              <a
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                title="View file"
                              >
                                <Eye className="w-4 h-4" />
                              </a>
                              <a
                                href={attachment.fileUrl}
                                download={attachment.originalFileName}
                                className="p-2 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
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
                  <Paperclip className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No attachments</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
