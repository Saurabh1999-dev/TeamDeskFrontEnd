// src/app/(dashboard)/tasks/page.tsx - Enhanced with Grid/List Toggle + View Modal
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, CheckSquare, Clock, AlertTriangle, User, Calendar, 
  Edit, Trash2, Eye, Grid3X3, List, LayoutGrid 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTasksStore } from '@/stores/tasks-store'
import { useProjectsStore } from '@/stores/projects-store'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/auth'
import { TaskStatus, TaskPriority, getTaskStatusString, getTaskPriorityString, getTaskStatusColor, getTaskPriorityColor } from '@/types/taskEnums'
import toast from 'react-hot-toast'
import { DeleteConfirmModal } from '@/components/common/delete-confirm-modal'
import type { Task } from '@/services/tasksApi'
import { AddEditTaskModal } from '@/components/tasks/add-edit-task-modal'
import { AssignTaskModal } from '@/components/tasks/assign-task-modal'
import { TaskDetailsModal } from '@/components/tasks/task-details-modal'

export default function TasksPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    deleteTask,
    updateTaskStatus,
    clearError
  } = useTasksStore()
  
  const { projects, fetchProjects } = useProjectsStore()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [selectedAssignee, setSelectedAssignee] = useState('all')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)
  
  // ✅ Add view mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewingTask, setViewingTask] = useState<Task | null>(null) // ✅ Enable this
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [assigningTask, setAssigningTask] = useState<Task | null>(null)

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: TaskStatus.Todo, label: getTaskStatusString(TaskStatus.Todo) },
    { value: TaskStatus.InProgress, label: getTaskStatusString(TaskStatus.InProgress) },
    { value: TaskStatus.InReview, label: getTaskStatusString(TaskStatus.InReview) },
    { value: TaskStatus.Completed, label: getTaskStatusString(TaskStatus.Completed) },
    { value: TaskStatus.Cancelled, label: getTaskStatusString(TaskStatus.Cancelled) },
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: TaskPriority.Low, label: getTaskPriorityString(TaskPriority.Low) },
    { value: TaskPriority.Medium, label: getTaskPriorityString(TaskPriority.Medium) },
    { value: TaskPriority.High, label: getTaskPriorityString(TaskPriority.High) },
    { value: TaskPriority.Critical, label: getTaskPriorityString(TaskPriority.Critical) },
  ]

  // Load data on component mount
  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [fetchTasks, fetchProjects])

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError()
  }, [clearError])

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProject = selectedProject === 'all' || task.projectId === selectedProject
    const matchesStatus = selectedStatus === 'all' || task.status === Number(selectedStatus)
    const matchesPriority = selectedPriority === 'all' || task.priority === Number(selectedPriority)
    const matchesAssignee = selectedAssignee === 'all' || 
      (selectedAssignee === 'unassigned' ? !task.assignedToId : task.assignedToId === selectedAssignee)
    const matchesOverdue = !showOverdueOnly || task.isOverdue
    
    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesAssignee && matchesOverdue
  })
  const handleAddTask = () => {
    setEditingTask(null)
    setShowAddModal(true)
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowAddModal(true)
  }

  // ✅ Enable view task functionality
  const handleViewTask = (task: Task) => {
    setViewingTask(task)
  }

  const handleAssignTask = (task: Task) => {
    setAssigningTask(task)
  }

  const handleDeleteTask = async () => {
    if (!deletingTask) return

    const success = await deleteTask(deletingTask.id)
    if (success) {
      toast.success('Task deleted successfully')
      setDeletingTask(null)
    }
  }

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    const success = await updateTaskStatus(task.id, newStatus)
    if (success) {
      toast.success(`Task status updated to ${getTaskStatusString(newStatus)}`)
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Check permissions
  const canManageTasks = user && [UserRole.Admin, UserRole.HR, UserRole.Staff].includes(user.role)
  const canDeleteTasks = user && user.role === UserRole.Admin && UserRole.Staff

  if (!canManageTasks) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage tasks.</p>
        </div>
      </div>
    )
  }

  // ✅ Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 relative"
          >
            {/* Priority Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full ${
              task.priority === TaskPriority.Critical ? 'bg-red-500' :
              task.priority === TaskPriority.High ? 'bg-orange-500' :
              task.priority === TaskPriority.Medium ? 'bg-yellow-500' : 'bg-green-500'
            } rounded-l-xl`} />
            
            {/* Task Header */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                  {task.title}
                </h3>
                {task.isOverdue && (
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                {task.description}
              </p>
              <p className="text-blue-600 text-sm font-medium">
                {task.projectName}
              </p>
            </div>

            {/* Status and Priority */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                {getTaskStatusString(task.status)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                {getTaskPriorityString(task.priority)}
              </span>
            </div>

            {/* Assignment */}
            <div className="mb-4">
              {task.assignedToName ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(task.assignedToName)}
                  </div>
                  <span className="text-sm text-gray-700">{task.assignedToName}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Unassigned</span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div className="flex items-center gap-2 text-sm mb-4">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className={task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}>
                Due: {formatDate(task.dueDate)}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleViewTask(task)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              
              <button
                onClick={() => handleEditTask(task)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>

              <button
                onClick={() => handleAssignTask(task)}
                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                title="Assign task"
              >
                <User className="w-4 h-4" />
              </button>

              {canDeleteTasks && (
                <button
                  onClick={() => setDeletingTask(task)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  // ✅ List View Component
  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div className="col-span-3">Task</div>
        <div className="col-span-2">Project</div>
        <div className="col-span-1">Status</div>
        <div className="col-span-1">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-1">Due Date</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors relative"
            >
              {/* Priority Indicator */}
              <div className={`absolute left-0 top-0 w-1 h-full ${
                task.priority === TaskPriority.Critical ? 'bg-red-500' :
                task.priority === TaskPriority.High ? 'bg-orange-500' :
                task.priority === TaskPriority.Medium ? 'bg-yellow-500' : 'bg-green-500'
              }`} />

              {/* Task Title & Description */}
              <div className="col-span-3 pl-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 line-clamp-1">{task.title}</h3>
                  {task.isOverdue && (
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-1 mt-1">{task.description}</p>
              </div>

              {/* Project */}
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-blue-600 font-medium truncate">{task.projectName}</span>
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                  {getTaskStatusString(task.status)}
                </span>
              </div>

              {/* Priority */}
              <div className="col-span-1 flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                  {getTaskPriorityString(task.priority)}
                </span>
              </div>

              {/* Assignee */}
              <div className="col-span-2 flex items-center">
                {task.assignedToName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(task.assignedToName)}
                    </div>
                    <span className="text-sm text-gray-700 truncate">{task.assignedToName}</span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Unassigned</span>
                )}
              </div>

              {/* Due Date */}
              <div className="col-span-1 flex items-center">
                <span className={`text-sm ${task.isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {formatDate(task.dueDate)}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center gap-1">
                <button
                  onClick={() => handleViewTask(task)}
                  className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="View task"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleEditTask(task)}
                  className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="Edit task"
                >
                  <Edit className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleAssignTask(task)}
                  className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  title="Assign task"
                >
                  <User className="w-4 h-4" />
                </button>

                {canDeleteTasks && (
                  <button
                    onClick={() => setDeletingTask(task)}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* ✅ View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTask}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Task
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search tasks, projects, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Project Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Overdue Filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Overdue Only
            </span>
          </label>
        </div>
      </div>

      {/* ✅ Conditional View Rendering */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[...Array(6)].map((_, index) => (
            <div key={index} className={`bg-white rounded-xl shadow-sm p-6 animate-pulse ${
              viewMode === 'list' ? 'h-16' : 'h-64'
            }`}>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              {viewMode === 'grid' && (
                <>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? <GridView /> : <ListView />}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedProject !== 'all' || selectedStatus !== 'all' || selectedPriority !== 'all' || showOverdueOnly
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first task'
            }
          </p>
          {(!searchTerm && selectedProject === 'all' && selectedStatus === 'all' && selectedPriority === 'all' && !showOverdueOnly) && (
            <button
              onClick={handleAddTask}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Task
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEditTaskModal
          task={editingTask}
          onClose={() => {
            setShowAddModal(false)
            setEditingTask(null)
          }}
          onSave={() => {
            setShowAddModal(false)
            setEditingTask(null)
          }}
        />
      )}

      {/* ✅ Enable Task Details Modal */}
      {viewingTask && (
        <TaskDetailsModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            setEditingTask(viewingTask)
            setViewingTask(null)
            setShowAddModal(true)
          }}
        />
      )}

      {assigningTask && (
        <AssignTaskModal
          task={assigningTask}
          onClose={() => setAssigningTask(null)}
          onAssign={() => setAssigningTask(null)}
        />
      )}

      {deletingTask && (
        <DeleteConfirmModal
          title="Delete Task"
          message={`Are you sure you want to delete "${deletingTask.title}"? This action cannot be undone.`}
          onCancel={() => setDeletingTask(null)}
          onConfirm={handleDeleteTask}
          loading={loading}
        />
      )}
    </div>
  )
}
