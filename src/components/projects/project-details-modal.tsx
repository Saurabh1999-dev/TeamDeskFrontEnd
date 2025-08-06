// src/components/projects/project-details-modal.tsx
'use client'

import { motion } from 'framer-motion'
import { X, FolderOpen, Building, Calendar, DollarSign, Users, Edit, AlertTriangle } from 'lucide-react'
import type { Project } from '@/services/projectsApi'
import { ProjectStatus, ProjectPriority, getProjectStatusString, getProjectPriorityString, getProjectRoleString } from '@/types/projects'

interface ProjectDetailsModalProps {
  project: Project
  onClose: () => void
  onEdit: () => void
}

export function ProjectDetailsModal({ project, onClose, onEdit }: ProjectDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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

  // ✅ Updated to use enum-based status colors
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Planning:
        return 'bg-blue-100 text-blue-800'
      case ProjectStatus.Active:
        return 'bg-green-100 text-green-800'
      case ProjectStatus.OnHold:
        return 'bg-yellow-100 text-yellow-800'
      case ProjectStatus.Completed:
        return 'bg-purple-100 text-purple-800'
      case ProjectStatus.Cancelled:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // ✅ Updated to use enum-based priority colors
  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.Low:
        return 'text-green-600 bg-green-100'
      case ProjectPriority.Medium:
        return 'text-yellow-600 bg-yellow-100'
      case ProjectPriority.High:
        return 'text-orange-600 bg-orange-100'
      case ProjectPriority.Critical:
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500'
    if (progress < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="fixed inset-0 backdrop-blur bg-white/30 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Project Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Project Header */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-3xl font-bold text-gray-900">{project.name}</h3>
                  {project.isOverdue && (
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <p className="text-gray-600 text-lg mb-4">{project.description}</p>
                <div className="flex items-center gap-3">
                  {/* ✅ Updated to use enum values and helper functions */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                    {getProjectStatusString(project.status)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                    {getProjectPriorityString(project.priority)} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Project Progress</span>
                <span className="text-sm text-gray-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Client Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                <p className="text-gray-900 font-medium">{project.client.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Contact Person</label>
                <p className="text-gray-900">{project.client.contactPerson}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-900">{project.client.contactEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <p className="text-gray-900">{project.client.contactPhone}</p>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Start Date
                </label>
                <p className="text-gray-900">{formatDate(project.startDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Deadline
                </label>
                <p className={`${project.isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {formatDate(project.deadline)}
                  {project.isOverdue && ' (Overdue)'}
                </p>
              </div>

              {project.endDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    End Date
                  </label>
                  <p className="text-gray-900">{formatDate(project.endDate)}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Budget
                </label>
                <p className="text-gray-900 font-semibold text-lg">{formatCurrency(project.budget)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Days Remaining
                </label>
                <p className={`${project.daysRemaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {project.daysRemaining < 0 ? `${Math.abs(project.daysRemaining)} days overdue` : `${project.daysRemaining} days`}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team Members ({project.staffAssignments?.length || 0})
            </h4>
            {project.staffAssignments && project.staffAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.staffAssignments.map((assignment) => (
                  <div key={assignment.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{assignment.staffName}</h5>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {assignment.allocationPercentage}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{assignment.staffEmail}</p>
                    {/* ✅ Updated to use enum helper function for role display */}
                    <p className="text-sm font-medium text-gray-700">
                      {getProjectRoleString(assignment.role)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Assigned: {formatDate(assignment.assignedDate)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No team members assigned yet</p>
            )}
          </div>

          {/* Timeline Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created At
              </label>
              <p className="text-gray-900">{formatDate(project.createdAt)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">{formatDate(project.updatedAt)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
