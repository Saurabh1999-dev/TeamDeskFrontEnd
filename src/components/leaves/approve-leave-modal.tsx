// src/components/leaves/approve-leave-modal.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, CheckCircle, XCircle } from 'lucide-react'
import { useLeavesStore } from '@/stores/leaves-store'
import { LeaveStatus, getLeaveTypeString, getLeaveStatusString } from '@/types/leaveEnums'
import toast from 'react-hot-toast'
import type { Leave, ApproveLeaveRequest } from '@/services/leavesApi'

interface ApproveLeaveModalProps {
  leave: Leave
  onClose: () => void
  onSuccess: () => void
}

export function ApproveLeaveModal({ leave, onClose, onSuccess }: ApproveLeaveModalProps) {
  const { approveLeave, loading } = useLeavesStore()
  const [status, setStatus] = useState<LeaveStatus>(LeaveStatus.Approved)
  const [comments, setComments] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (status === LeaveStatus.Rejected && !comments.trim()) {
      toast.error('Comments are required when rejecting a leave application')
      return
    }

    const request: ApproveLeaveRequest = {
      leaveId: leave.id,
      status,
      comments: comments.trim() || undefined
    }

    const success = await approveLeave(request)
    if (success) {
      toast.success(`Leave application ${status === LeaveStatus.Approved ? 'approved' : 'rejected'} successfully`)
      onSuccess()
    }
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    })
    const end = new Date(endDate).toLocaleDateString('en-US', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    })
    
    return start === end ? start : `${start} - ${end}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Review Leave Application</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leave Details */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Staff:</span>
              <p className="text-gray-900">{leave.staffName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Type:</span>
              <p className="text-gray-900">{getLeaveTypeString(leave.leaveType)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Dates:</span>
              <p className="text-gray-900">{formatDateRange(leave.startDate, leave.endDate)}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Duration:</span>
              <p className="text-gray-900">{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <span className="font-medium text-gray-700">Reason:</span>
            <p className="text-gray-900 mt-1">{leave.reason}</p>
          </div>

          {leave.attachments.length > 0 && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Attachments:</span>
              <div className="mt-2 space-y-2">
                {leave.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <span>{attachment.originalFileName}</span>
                    <span className="text-gray-500">({(attachment.fileSize / 1024).toFixed(1)} KB)</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Decision Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Decision *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus(LeaveStatus.Approved)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  status === LeaveStatus.Approved
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                Approve
              </button>
              
              <button
                type="button"
                onClick={() => setStatus(LeaveStatus.Rejected)}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  status === LeaveStatus.Rejected
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <XCircle className="w-5 h-5" />
                Reject
              </button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments {status === LeaveStatus.Rejected && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={
                status === LeaveStatus.Approved
                  ? "Add any approval comments (optional)..."
                  : "Please provide a reason for rejecting this leave application..."
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required={status === LeaveStatus.Rejected}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comments.length}/1000 characters
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                status === LeaveStatus.Approved
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {loading ? 'Processing...' : status === LeaveStatus.Approved ? 'Approve Leave' : 'Reject Leave'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
