// src/components/tasks/add-edit-task-modal.tsx - Complete Implementation
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  X, CheckSquare, FileText, Calendar, Clock, Tag, Plus, User, 
  Paperclip, Upload, Trash2, AlertCircle, Building 
} from 'lucide-react'
import { useTasksStore } from '@/stores/tasks-store'
import { useProjectsStore } from '@/stores/projects-store'
import { useStaffStore } from '@/stores/staff-store'
import { useAuthStore } from '@/stores/auth-store'
import toast from 'react-hot-toast'
import type { Task, TaskAttachment } from '@/services/tasksApi'
import { 
  TaskStatus, 
  TaskPriority, 
  getTaskStatusString, 
  getTaskPriorityString 
} from '@/types/taskEnums'

interface AddEditTaskModalProps {
  task?: Task | null
  onClose: () => void
  onSave: () => void
}

export function AddEditTaskModal({ task, onClose, onSave }: AddEditTaskModalProps) {
  const { user } = useAuthStore()
  const { 
    createTask, 
    updateTask, 
    loading, 
    uploadAttachment, 
    deleteAttachment,
    error: taskError,
    clearError 
  } = useTasksStore()
  
  const { 
    projects, 
    loading: projectsLoading, 
    fetchProjects,
    error: projectsError 
  } = useProjectsStore()
  
  const { 
    staff, 
    loading: staffLoading, 
    fetchStaff,
    error: staffError 
  } = useStaffStore()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assignedToId: '',
    status: TaskStatus.Todo,
    priority: TaskPriority.Medium,
    startDate: '',
    dueDate: '',
    estimatedHours: 0,
    tags: [] as string[],
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [dataLoaded, setDataLoaded] = useState(false)
  const [attachments, setAttachments] = useState<TaskAttachment[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isEditing = !!task

  // Status and Priority options
  const statusOptions = [
    { value: TaskStatus.Todo, label: getTaskStatusString(TaskStatus.Todo) },
    { value: TaskStatus.InProgress, label: getTaskStatusString(TaskStatus.InProgress) },
    { value: TaskStatus.InReview, label: getTaskStatusString(TaskStatus.InReview) },
    { value: TaskStatus.Completed, label: getTaskStatusString(TaskStatus.Completed) },
    { value: TaskStatus.Cancelled, label: getTaskStatusString(TaskStatus.Cancelled) },
  ]

  const priorityOptions = [
    { value: TaskPriority.Low, label: getTaskPriorityString(TaskPriority.Low) },
    { value: TaskPriority.Medium, label: getTaskPriorityString(TaskPriority.Medium) },
    { value: TaskPriority.High, label: getTaskPriorityString(TaskPriority.High) },
    { value: TaskPriority.Critical, label: getTaskPriorityString(TaskPriority.Critical) },
  ]

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchProjects(),
          fetchStaff()
        ])
        setDataLoaded(true)
      } catch (error) {
        console.error('Error loading data:', error)
        toast.error('Failed to load projects and staff data')
      }
    }

    loadData()
  }, [fetchProjects, fetchStaff])

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  // Show error notifications
  useEffect(() => {
    if (taskError) {
      toast.error(taskError)
      clearError()
    }
  }, [taskError, clearError])

  useEffect(() => {
    if (projectsError) {
      toast.error(`Projects loading error: ${projectsError}`)
    }
  }, [projectsError])

  useEffect(() => {
    if (staffError) {
      toast.error(`Staff loading error: ${staffError}`)
    }
  }, [staffError])

  // Populate form data when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        projectId: task.projectId,
        assignedToId: task.assignedToId || '',
        status: task.status,
        priority: task.priority,
        startDate: task.startDate ? task.startDate.split('T')[0] : '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        estimatedHours: task.estimatedHours || 0,
        tags: task.tags || [],
      })
      setAttachments(task.attachments || [])
    }
  }, [task])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedHours' ? parseFloat(value) || 0 :
              name === 'status' ? parseInt(value) as TaskStatus :
              name === 'priority' ? parseInt(value) as TaskPriority :
              value,
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    
    // Validate files
    const validFiles = fileArray.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large. Maximum size is 10MB.`)
        return false
      }

      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]

      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} has an unsupported file type.`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setUploadingFiles(validFiles)

    try {
      if (task) {
        // If editing existing task, upload immediately
        for (const file of validFiles) {
          const success = await uploadAttachment(task.id, file)
          if (success) {
            toast.success(`${file.name} uploaded successfully`)
          }
        }
      } else {
        // If creating new task, store files for upload after task creation
        setPendingFiles(prev => [...prev, ...validFiles])
        setAttachments(prev => [
          ...prev,
          ...validFiles.map(file => ({
            id: `temp-${Date.now()}-${file.name}`,
            taskId: '',
            fileName: file.name,
            originalFileName: file.name,
            fileType: file.type,
            fileUrl: '',
            fileSize: file.size,
            uploadedByName: 'You',
            createdAt: new Date().toISOString(),
          }))
        ])
      }
    } catch (error) {
      toast.error('Error processing files')
    } finally {
      setUploadingFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAttachment = async (attachment: TaskAttachment) => {
    if (attachment.id.startsWith('temp-')) {
      // Remove from pending uploads
      setAttachments(prev => prev.filter(a => a.id !== attachment.id))
      setPendingFiles(prev => prev.filter(f => f.name !== attachment.fileName))
    } else if (task) {
      // Delete from server
      const success = await deleteAttachment(task.id, attachment.id)
      if (success) {
        toast.success('Attachment deleted')
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.title.trim()) newErrors.title = 'Task title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.projectId) newErrors.projectId = 'Project is required'

    // Validate dates
    if (formData.startDate && formData.dueDate) {
      if (new Date(formData.dueDate) <= new Date(formData.startDate)) {
        newErrors.dueDate = 'Due date must be after start date'
      }
    }

    // Validate estimated hours
    if (formData.estimatedHours < 0) {
      newErrors.estimatedHours = 'Estimated hours cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    let success = false
    let newTaskId = ''

    if (isEditing && task) {
      success = await updateTask(task.id, formData)
      if (success) {
        toast.success('Task updated successfully')
        newTaskId = task.id
      }
    } else {
      const taskResponse = await createTask(formData)
      success = !!taskResponse
      if (success && taskResponse) {
        toast.success('Task created successfully')
        // newTaskId = taskResponse

        // Upload pending files for new task
        if (pendingFiles.length > 0) {
          toast(`Uploading ${pendingFiles.length} file(s)...`)
          for (const file of pendingFiles) {
            try {
              await uploadAttachment(newTaskId, file)
            } catch (error) {
              console.error(`Failed to upload ${file.name}:`, error)
            }
          }
        }
      }
    }

    if (success) {
      onSave()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word')) return '📝'
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊'
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📑'
    return '📎'
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Loading state while data is being fetched
  const isDataLoading = projectsLoading || staffLoading || !dataLoaded

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Task' : 'Create New Task'}
              </h2>
              {task && (
                <p className="text-sm text-gray-600">
                  ID: {task.id.substring(0, 8)}...
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Loading State */}
        {isDataLoading ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
              <p className="text-gray-600">Loading projects and staff data...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckSquare className="inline w-4 h-4 mr-1" />
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-1" />
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter task description"
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="inline w-4 h-4 mr-1" />
                    Project *
                  </label>
                  <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.projectId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.client.name}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.projectId}
                    </p>
                  )}
                  {projects.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">
                      No projects available. Please add projects first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="inline w-4 h-4 mr-1" />
                    Assign To
                  </label>
                  <select
                    name="assignedToId"
                    value={formData.assignedToId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.fullName} - {member.position}
                      </option>
                    ))}
                  </select>
                  {staff.length === 0 && (
                    <p className="text-amber-600 text-sm mt-1">
                      No staff members available.
                    </p>
                  )}
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates and Hours */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dueDate ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.estimatedHours ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                  {errors.estimatedHours && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.estimatedHours}
                    </p>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Paperclip className="inline w-4 h-4 mr-1" />
                  Attachments
                </label>
                
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleFileUpload(e.dataTransfer.files)
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xlsx,.xls,.ppt,.pptx"
                  />
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Images, PDFs, Documents (Max 10MB each)
                  </p>
                </div>

                {/* Uploaded Files List */}
                {(attachments.length > 0 || uploadingFiles.length > 0) && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Attached Files ({attachments.length + uploadingFiles.length})
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {/* Existing attachments */}
                      {attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-lg flex-shrink-0">
                              {getFileIcon(attachment.fileType)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.originalFileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.fileSize)} • {attachment.uploadedByName}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {attachment.fileUrl && (
                              <a
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded hover:bg-blue-100"
                              >
                                View
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(attachment)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Remove attachment"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Uploading files */}
                      {uploadingFiles.map((file, index) => (
                        <div
                          key={`uploading-${index}`}
                          className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-blue-600">
                                Uploading... {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignee Preview */}
              {formData.assignedToId && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="text-sm font-medium text-green-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Task Assignment Preview
                  </h4>
                  {(() => {
                    const assignedStaff = staff.find(s => s.id === formData.assignedToId)
                    return assignedStaff && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(assignedStaff.fullName)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">
                            {assignedStaff.fullName}
                          </p>
                          <p className="text-xs text-green-700">
                            {assignedStaff.position} • {assignedStaff.email}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </form>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || uploadingFiles.length > 0 || isDataLoading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading || uploadingFiles.length > 0 ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploadingFiles.length > 0 ? 'Uploading files...' : 
                 isEditing ? 'Updating task...' : 'Creating task...'}
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                {isEditing ? 'Update Task' : 'Create Task'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
