// src/components/projects/add-edit-project-modal.tsx - Updated with enums
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, FolderOpen, Building, Calendar, DollarSign, Tag, Plus, Users } from 'lucide-react'
import { useProjectsStore } from '@/stores/projects-store'
import toast from 'react-hot-toast'
import type { Project } from '@/services/projectsApi'
import { ProjectStatus, ProjectPriority, ProjectRole, getProjectStatusString, getProjectPriorityString, getProjectRoleString } from '@/types/projects'

interface AddEditProjectModalProps {
  project?: Project | null
  onClose: () => void
  onSave: () => void
}

export function AddEditProjectModal({ project, onClose, onSave }: AddEditProjectModalProps) {
  const { createProject, updateProject, loading } = useProjectsStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '15F3E2C7-366A-4308-806D-CEB829BDB69D',
    startDate: '',
    deadline: '',
    budget: 0,
    status: ProjectStatus.Planning, // ✅ Use enum default
    priority: ProjectPriority.Medium, // ✅ Use enum default
    tags: [] as string[],
    staffAssignments: [] as {
      staffId: string
      role: ProjectRole // ✅ Use enum type
      allocationPercentage: number
    }[]
  })

  const [newTag, setNewTag] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Mock data - replace with real data from API
  const mockClients = [
    { id: '1', name: 'TechCorp Solutions' },
    { id: '2', name: 'StartupX Inc' },
    { id: '3', name: 'Digital Agency Pro' },
  ]

  const mockStaff = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
    { id: '3', name: 'Michael Chen', email: 'michael@example.com' },
  ]

  const isEditing = !!project

  // ✅ Use enum values for options
  const statusOptions = [
    { value: ProjectStatus.Planning, label: getProjectStatusString(ProjectStatus.Planning) },
    { value: ProjectStatus.Active, label: getProjectStatusString(ProjectStatus.Active) },
    { value: ProjectStatus.OnHold, label: getProjectStatusString(ProjectStatus.OnHold) },
    { value: ProjectStatus.Completed, label: getProjectStatusString(ProjectStatus.Completed) },
    { value: ProjectStatus.Cancelled, label: getProjectStatusString(ProjectStatus.Cancelled) },
  ]

  const priorityOptions = [
    { value: ProjectPriority.Low, label: getProjectPriorityString(ProjectPriority.Low) },
    { value: ProjectPriority.Medium, label: getProjectPriorityString(ProjectPriority.Medium) },
    { value: ProjectPriority.High, label: getProjectPriorityString(ProjectPriority.High) },
    { value: ProjectPriority.Critical, label: getProjectPriorityString(ProjectPriority.Critical) },
  ]

  const roleOptions = [
    { value: ProjectRole.TeamMember, label: getProjectRoleString(ProjectRole.TeamMember) },
    { value: ProjectRole.ProjectLead, label: getProjectRoleString(ProjectRole.ProjectLead) },
    { value: ProjectRole.TechnicalLead, label: getProjectRoleString(ProjectRole.TechnicalLead) },
    { value: ProjectRole.ProjectManager, label: getProjectRoleString(ProjectRole.ProjectManager) },
  ]

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        clientId: project.client.id,
        startDate: project.startDate.split('T')[0],
        deadline: project.deadline.split('T')[0],
        budget: project.budget,
        status: project.status, // ✅ Already enum type
        priority: project.priority, // ✅ Already enum type
        tags: project.tags || [],
        staffAssignments: project.staffAssignments.map(assignment => ({
          staffId: assignment.staffId,
          role: assignment.role, // ✅ Already enum type
          allocationPercentage: assignment.allocationPercentage,
        })) || []
      })
    }
  }, [project])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? parseFloat(value) || 0 :
        name === 'status' ? parseInt(value) as ProjectStatus : // ✅ Parse as enum
          name === 'priority' ? parseInt(value) as ProjectPriority : // ✅ Parse as enum
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

  const addStaffAssignment = () => {
    setFormData(prev => ({
      ...prev,
      staffAssignments: [...prev.staffAssignments, {
        staffId: '',
        role: ProjectRole.TeamMember, // ✅ Use enum default
        allocationPercentage: 100
      }]
    }))
  }

  const updateStaffAssignment = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      staffAssignments: prev.staffAssignments.map((assignment, i) =>
        i === index ? {
          ...assignment,
          [field]: field === 'role' ? parseInt(value.toString()) as ProjectRole : value // ✅ Parse role as enum
        } : assignment
      )
    }))
  }

  const removeStaffAssignment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      staffAssignments: prev.staffAssignments.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.clientId) newErrors.clientId = 'Client is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.deadline) newErrors.deadline = 'Deadline is required'
    if (formData.budget <= 0) newErrors.budget = 'Budget must be greater than 0'

    // Validate deadline is after start date
    if (formData.startDate && formData.deadline) {
      if (new Date(formData.deadline) <= new Date(formData.startDate)) {
        newErrors.deadline = 'Deadline must be after start date'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    let success = false

    if (isEditing && project) {
      success = await updateProject(project.id, formData)
      if (success) {
        toast.success('Project updated successfully')
      }
    } else {
      success = await createProject(formData)
      if (success) {
        toast.success('Project created successfully')
      }
    }

    if (success) {
      onSave()
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur bg-white/30 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FolderOpen className="inline w-4 h-4 mr-1" />
                Project Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter project name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="Enter project description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="inline w-4 h-4 mr-1" />
                Client
              </label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.clientId ? 'border-red-300' : 'border-gray-300'
                  }`}
              >
                <option value="">Select Client</option>
                {mockClients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              {errors.clientId && <p className="text-red-500 text-sm mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline w-4 h-4 mr-1" />
                Budget
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.budget ? 'border-red-300' : 'border-gray-300'
                  }`}
                placeholder="50000"
              />
              {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.deadline ? 'border-red-300' : 'border-gray-300'
                  }`}
              />
              {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
            </div>
          </div>

          {/* Status and Priority - ✅ Updated to use enum options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Staff Assignments - ✅ Updated to use enum for roles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                <Users className="inline w-4 h-4 mr-1" />
                Team Assignments
              </label>
              <button
                type="button"
                onClick={addStaffAssignment}
                className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Member
              </button>
            </div>

            <div className="space-y-3">
              {formData.staffAssignments.map((assignment, index) => (
                <div key={index} className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg">
                  <select
                    value={assignment.staffId}
                    onChange={(e) => updateStaffAssignment(index, 'staffId', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Staff</option>
                    {mockStaff.map(staff => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>

                  <select
                    value={assignment.role}
                    onChange={(e) => updateStaffAssignment(index, 'role', e.target.value)}
                    className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {roleOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    value={assignment.allocationPercentage}
                    onChange={(e) => updateStaffAssignment(index, 'allocationPercentage', parseInt(e.target.value))}
                    min="1"
                    max="100"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                  <span className="text-sm text-gray-500">%</span>

                  <button
                    type="button"
                    onClick={() => removeStaffAssignment(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Project' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
