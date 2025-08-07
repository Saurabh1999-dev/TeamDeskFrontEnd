// src/app/(dashboard)/staff/[id]/page.tsx
'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Trash2, UserCheck, UserX } from 'lucide-react'
import { useStaffStore } from '@/stores/staff-store'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/auth'
import { StaffDetailsModal } from '@/components/staff/staff-details-modal'
import { AddEditStaffModal } from '@/components/staff/add-edit-staff-modal'
import { DeleteConfirmModal } from '@/components/common/delete-confirm-modal'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Route } from 'next'

export default function StaffDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    currentStaff,
    loading,
    error,
    fetchStaffById,
    deleteStaff,
    toggleStaffStatus,
    clearCurrentStaff
  } = useStaffStore()

  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const staffId = params.id as string

  useEffect(() => {
    if (staffId) {
      fetchStaffById(staffId)
    }

    return () => {
      clearCurrentStaff()
    }
  }, [staffId, fetchStaffById, clearCurrentStaff])

  const handleEdit = () => {
    setShowEditModal(true)
  }

  const handleDelete = async () => {
    if (!currentStaff) return

    const success = await deleteStaff(currentStaff.id)
    if (success) {
      toast.success('Staff member deleted successfully')
      router.push('/staff' as Route)
    }
  }

  const handleToggleStatus = async () => {
    if (!currentStaff) return

    const success = await toggleStaffStatus(currentStaff.id)
    if (success) {
      toast.success(`Staff member ${currentStaff.isActive ? 'deactivated' : 'activated'} successfully`)
    }
  }

  const canManageStaff = user && [UserRole.Admin, UserRole.HR].includes(user.role)
  const canDeleteStaff = user && user.role === UserRole.Admin

  if (loading) {
    return (
      <div className="">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !currentStaff) {
    return (
      <div className="">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Staff Member Not Found</h3>
          <p className="text-gray-600 mb-4">
            The staff member you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push('/staff' as Route)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Staff List
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/staff' as Route)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{currentStaff.fullName}</h1>
            <p className="text-gray-600">{currentStaff.position}</p>
          </div>
        </div>

        {canManageStaff && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentStaff.isActive
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {currentStaff.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
              {currentStaff.isActive ? 'Deactivate' : 'Activate'}
            </button>

            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>

            {canDeleteStaff && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Staff Details */}
      <StaffDetailsModal
        staff={currentStaff}
        onClose={() => {}}
        onEdit={handleEdit}
      />

      {/* Modals */}
      {showEditModal && (
        <AddEditStaffModal
          staff={currentStaff}
          onClose={() => setShowEditModal(false)}
          onSave={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Staff Member"
          message={`Are you sure you want to delete "${currentStaff.fullName}"? This action cannot be undone.`}
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          loading={loading}
        />
      )}
    </div>
  )
}
