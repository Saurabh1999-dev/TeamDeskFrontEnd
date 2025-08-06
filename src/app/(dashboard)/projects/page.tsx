// src/app/(dashboard)/projects/page.tsx - Updated with enums
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, FolderOpen, Calendar, DollarSign, Users, AlertTriangle, Edit, Trash2, Eye, BarChart } from 'lucide-react'
import { useProjectsStore } from '@/stores/projects-store'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/auth'
import toast from 'react-hot-toast'
import { AddEditProjectModal } from '@/components/projects/add-edit-project-modal'
import { DeleteConfirmModal } from '@/components/common/delete-confirm-modal'
import { ProjectDetailsModal } from '@/components/projects/project-details-modal'
import { ProgressUpdateModal } from '@/components/projects/progress-update-modal'
import type { Project } from '@/services/projectsApi'
import { ProjectStatus, ProjectPriority, getProjectStatusString, getProjectPriorityString } from '@/types/projects'

export default function ProjectsPage() {
  const { user } = useAuthStore()
  const {
    projects,
    loading,
    error,
    fetchProjects,
    deleteProject,
    updateProjectProgress,
    clearError
  } = useProjectsStore()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null)
  const [progressProject, setProgressProject] = useState<Project | null>(null)

  // ✅ Updated status options to use enums
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: ProjectStatus.Planning, label: 'Planning', color: 'blue' },
    { value: ProjectStatus.Active, label: 'Active', color: 'green' },
    { value: ProjectStatus.OnHold, label: 'On Hold', color: 'yellow' },
    { value: ProjectStatus.Completed, label: 'Completed', color: 'purple' },
    { value: ProjectStatus.Cancelled, label: 'Cancelled', color: 'red' },
  ]

  // ✅ Updated priority options to use enums
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: ProjectPriority.Low, label: 'Low Priority' },
    { value: ProjectPriority.Medium, label: 'Medium Priority' },
    { value: ProjectPriority.High, label: 'High Priority' },
    { value: ProjectPriority.Critical, label: 'Critical Priority' },
  ]

  // Load projects on component mount
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

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

  // ✅ Updated filter logic to handle enum values
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || project.status === Number(selectedStatus)
    const matchesPriority = selectedPriority === 'all' || project.priority === Number(selectedPriority)
    const matchesOverdue = !showOverdueOnly || project.isOverdue
    
    return matchesSearch && matchesStatus && matchesPriority && matchesOverdue
  })

  // Event handlers remain the same...
  const handleAddProject = () => {
    setEditingProject(null)
    setShowAddModal(true)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setShowAddModal(true)
  }

  const handleViewProject = (project: Project) => {
    setViewingProject(project)
  }

  const handleDeleteProject = async () => {
    if (!deletingProject) return

    const success = await deleteProject(deletingProject.id)
    if (success) {
      toast.success('Project deleted successfully')
      setDeletingProject(null)
    }
  }

  const handleUpdateProgress = async (progress: number) => {
    if (!progressProject) return

    const success = await updateProjectProgress(progressProject.id, progress)
    if (success) {
      toast.success('Project progress updated successfully')
      setProgressProject(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // ✅ Updated to use enum-based color mapping
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning: return 'blue'
      case ProjectStatus.Active: return 'green'
      case ProjectStatus.OnHold: return 'yellow'
      case ProjectStatus.Completed: return 'purple'
      case ProjectStatus.Cancelled: return 'red'
      default: return 'gray'
    }
  }

  // ✅ Updated to use enum-based priority colors
  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.Low: return 'text-green-600 bg-green-100'
      case ProjectPriority.Medium: return 'text-yellow-600 bg-yellow-100'
      case ProjectPriority.High: return 'text-orange-600 bg-orange-100'
      case ProjectPriority.Critical: return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Check permissions
  const canManageProjects = user && [UserRole.Admin, UserRole.HR].includes(user.role)
  const canDeleteProjects = user && user.role === UserRole.Admin

  if (!canManageProjects) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage projects.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header - same as before */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredProjects.length} of {projects.length} projects
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddProject}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          New Project
        </motion.button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects, clients, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
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

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100"
              >
                {/* Priority Indicator */}
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  project.priority === ProjectPriority.Critical ? 'bg-red-500' :
                  project.priority === ProjectPriority.High ? 'bg-orange-500' :
                  project.priority === ProjectPriority.Medium ? 'bg-yellow-500' : 'bg-green-500'
                } rounded-l-xl`} />
                
                {/* Header */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
                      {project.name}
                    </h3>
                    {project.isOverdue && (
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <p className="text-blue-600 text-sm font-medium">
                    {project.client.name}
                  </p>
                </div>

                {/* Status and Priority - ✅ Updated to use enum helper functions */}
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${getStatusColor(project.status)}-100 text-${getStatusColor(project.status)}-800`}>
                    {getProjectStatusString(project.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {getProjectPriorityString(project.priority)}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Budget</span>
                    </div>
                    <span className="font-medium text-gray-900">{formatCurrency(project.budget)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Deadline</span>
                    </div>
                    <span className={`font-medium ${project.isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(project.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Team</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {project.staffAssignments.length} members
                    </span>
                  </div>
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewProject(project)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleEditProject(project)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => setProgressProject(project)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <BarChart className="w-4 h-4" />
                  </button>

                  {canDeleteProjects && (
                    <button
                      onClick={() => setDeletingProject(project)}
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
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all' || showOverdueOnly
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first project'
            }
          </p>
          {(!searchTerm && selectedStatus === 'all' && selectedPriority === 'all' && !showOverdueOnly) && (
            <button
              onClick={handleAddProject}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create First Project
            </button>
          )}
        </div>
      )}

      {/* Modals - same as before */}
      {showAddModal && (
        <AddEditProjectModal
          project={editingProject}
          onClose={() => {
            setShowAddModal(false)
            setEditingProject(null)
          }}
          onSave={() => {
            setShowAddModal(false)
            setEditingProject(null)
          }}
        />
      )}

      {viewingProject && (
        <ProjectDetailsModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onEdit={() => {
            setEditingProject(viewingProject)
            setViewingProject(null)
            setShowAddModal(true)
          }}
        />
      )}

      {progressProject && (
        <ProgressUpdateModal
          project={progressProject}
          onClose={() => setProgressProject(null)}
          onUpdate={handleUpdateProgress}
        />
      )}

      {deletingProject && (
        <DeleteConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete "${deletingProject.name}"? This action cannot be undone.`}
          onCancel={() => setDeletingProject(null)}
          onConfirm={handleDeleteProject}
          loading={loading}
        />
      )}
    </div>
  )
}
