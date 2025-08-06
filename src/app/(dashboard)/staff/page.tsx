// src/app/(dashboard)/staff/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Users, Mail, Phone, Calendar, Edit, Trash2, Eye, UserCheck, UserX } from 'lucide-react'
import { useStaffStore } from '@/stores/staff-store'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole, getUserRoleString } from '@/types/auth'
import toast from 'react-hot-toast'
import type { Staff } from '@/services/staffApi'
import { DeleteConfirmModal } from '@/components/common/delete-confirm-modal'
import { AddEditStaffModal } from '@/components/staff/add-edit-staff-modal'
import { StaffDetailsModal } from '@/components/staff/staff-details-modal'

export default function StaffPage() {
  const { user } = useAuthStore()
  const {
    staff,
    loading,
    error,
    fetchStaff,
    deleteStaff,
    toggleStaffStatus,
    clearError
  } = useStaffStore()
debugger
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedRole, setSelectedRole] = useState('all')
  const [showActiveOnly, setShowActiveOnly] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null)
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null)

  const departments = ['all', 'Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Finance']
  const roles = [
    { value: 'all', label: 'All Roles' },
    { value: UserRole.Staff, label: 'Staff' },
    { value: UserRole.HR, label: 'HR' },
    { value: UserRole.Admin, label: 'Admin' },
  ]

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  useEffect(() => {
    return () => clearError()
  }, [clearError])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const filteredStaff = staff && staff.filter(member => {
    const matchesSearch = 
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || member.department === selectedDepartment
    const matchesRole = selectedRole === 'all' || member.role === Number(selectedRole)
    const matchesStatus = !showActiveOnly || member.isActive
    
    return matchesSearch && matchesDepartment && matchesRole && matchesStatus
  })
debugger
  const handleAddStaff = () => {
    setEditingStaff(null)
    setShowAddModal(true)
  }

  const handleEditStaff = (staff: Staff) => {
    setEditingStaff(staff)
    setShowAddModal(true)
  }

  const handleViewStaff = (staff: Staff) => {
    setViewingStaff(staff)
  }

  const handleDeleteStaff = async () => {
    if (!deletingStaff) return

    const success = await deleteStaff(deletingStaff.id)
    if (success) {
      toast.success('Staff member deleted successfully')
      setDeletingStaff(null)
    }
  }

  const handleToggleStatus = async (staff: Staff) => {
    const success = await toggleStaffStatus(staff.id)
    if (success) {
      toast.success(`Staff member ${staff.isActive ? 'deactivated' : 'activated'} successfully`)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case UserRole.Admin: return 'bg-red-100 text-red-800'
      case UserRole.HR: return 'bg-blue-100 text-blue-800'
      case UserRole.Staff: return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Check permissions
  const canManageStaff = user && [UserRole.Admin, UserRole.HR].includes(user.role)
  const canDeleteStaff = user && user.role === UserRole.Admin

  if (!canManageStaff) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to manage staff members.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredStaff && filteredStaff.length} of {staff && staff.length} staff members
          </p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddStaff}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Staff Member
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
              placeholder="Search by name, email, employee code, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Department Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[120px]"
          >
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>

          {/* Active Only Filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Active Only</span>
          </label>
        </div>
      </div>

      {/* Staff Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
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
            {filteredStaff && filteredStaff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 ${
                  !member.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(member.fullName)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{member.fullName}</h3>
                    <p className="text-gray-600 text-sm">{member.position}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role || 0)}`}>
                        {getUserRoleString(member.role || 0)}
                      </span>
                      {!member.isActive && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{member.department}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(member.hireDate)}</span>
                  </div>
                </div>

                {/* Employee Code Badge */}
                <div className="mb-4 pt-4 border-t border-gray-100">
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                    {member.employeeCode}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleViewStaff(member)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleEditStaff(member)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleToggleStatus(member)}
                    className={`p-2 rounded-lg transition-colors ${
                      member.isActive 
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {member.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>

                  {canDeleteStaff && (
                    <button
                      onClick={() => setDeletingStaff(member)}
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
      {!loading && (filteredStaff && filteredStaff.length === 0) && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No staff members found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedDepartment !== 'all' || selectedRole !== 'all' 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first team member'
            }
          </p>
          {(!searchTerm && selectedDepartment === 'all' && selectedRole === 'all') && (
            <button
              onClick={handleAddStaff}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Staff Member
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEditStaffModal
          staff={editingStaff}
          onClose={() => {
            setShowAddModal(false)
            setEditingStaff(null)
          }}
          onSave={() => {
            setShowAddModal(false)
            setEditingStaff(null)
          }}
        />
      )}

      {viewingStaff && (
        <StaffDetailsModal
          staff={viewingStaff}
          onClose={() => setViewingStaff(null)}
          onEdit={() => {
            setEditingStaff(viewingStaff)
            setViewingStaff(null)
            setShowAddModal(true)
          }}
        />
      )}

      {deletingStaff && (
        <DeleteConfirmModal
          title="Delete Staff Member"
          message={`Are you sure you want to delete "${deletingStaff.fullName}"? This action cannot be undone.`}
          onCancel={() => setDeletingStaff(null)}
          onConfirm={handleDeleteStaff}
          loading={loading}
        />
      )}
    </div>
  )
}
