// src/components/staff/staff-details-modal.tsx
'use client'

import { motion } from 'framer-motion'
import { X, User, Mail, Phone, Building, Calendar, DollarSign, Tag, Edit } from 'lucide-react'
import { getUserRoleString } from '@/types/auth'
import type { Staff } from '@/services/staffApi'

interface StaffDetailsModalProps {
  staff: Staff
  onClose: () => void
  onEdit: () => void
}

export function StaffDetailsModal({ staff, onClose, onEdit }: StaffDetailsModalProps) {
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Staff Details</h2>
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
          {/* Profile Section */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {getInitials(staff.fullName)}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{staff.fullName}</h3>
              <p className="text-lg text-gray-600">{staff.position}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {getUserRoleString(staff.role || 0)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  staff.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Email
                </label>
                <p className="text-gray-900">{staff.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Tag className="inline w-4 h-4 mr-1" />
                  Employee Code
                </label>
                <p className="text-gray-900 font-mono">{staff.employeeCode}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Building className="inline w-4 h-4 mr-1" />
                  Department
                </label>
                <p className="text-gray-900">{staff.department}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Hire Date
                </label>
                <p className="text-gray-900">{formatDate(staff.hireDate)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  <DollarSign className="inline w-4 h-4 mr-1" />
                  Salary
                </label>
                <p className="text-gray-900 font-semibold">{formatCurrency(staff.salary || 0)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Position
                </label>
                <p className="text-gray-900">{staff.position}</p>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-3">
              Skills & Expertise
            </label>
            <div className="flex flex-wrap gap-2">
              {staff.skills && staff.skills.length > 0 ? (
                staff.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 italic">No skills listed</p>
              )}
            </div>
          </div>

          {/* Timeline Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Created At
              </label>
              <p className="text-gray-900">{formatDate(staff.createdAt)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">{formatDate(staff.updatedAt || "")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
