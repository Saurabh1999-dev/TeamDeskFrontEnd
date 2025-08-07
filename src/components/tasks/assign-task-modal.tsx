// src/components/tasks/assign-task-modal.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, User, Bell, Mail } from 'lucide-react'
import { useTasksStore } from '@/stores/tasks-store'
import { useStaffStore } from '@/stores/staff-store'
import toast from 'react-hot-toast'
import type { Task } from '@/services/tasksApi'

interface AssignTaskModalProps {
  task: Task
  onClose: () => void
  onAssign: () => void
}

export function AssignTaskModal({ task, onClose, onAssign }: AssignTaskModalProps) {
  const { assignTask, loading } = useTasksStore()
  const { staff } = useStaffStore()

  const [selectedStaffId, setSelectedStaffId] = useState(task.assignedToId || '')
  const [sendNotification, setSendNotification] = useState(true)
  const [notificationMessage, setNotificationMessage] = useState(
    `You have been assigned a new task: "${task.title}" in project "${task.projectName}".`
  )

  const handleAssign = async () => {
    if (!selectedStaffId) {
      toast.error('Please select a staff member to assign this task to')
      return
    }

    const success = await assignTask({
      taskId: task.id,
      assignedToId: selectedStaffId,
      sendNotification
    })

    if (success) {
      const assignedStaff = staff.find(s => s.id === selectedStaffId)
      toast.success(`Task assigned to ${assignedStaff?.fullName || 'staff member'}${sendNotification ? ' with notification' : ''}`)
      onAssign()
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    // ✅ Fixed: Added proper backdrop and responsive container
    <div className="fixed inset-0 backdrop-blur bg-white/30 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        // ✅ Fixed: Responsive width and max height with scroll
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Assign Task</h2>
              <p className="text-xs sm:text-sm text-gray-600 truncate max-w-[200px] sm:max-w-none">
                {task.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Task Overview */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">Task Details</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-600 flex-shrink-0">Project:</span>
                <span className="text-gray-900 text-right truncate">{task.projectName}</span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-600 flex-shrink-0">Current Assignee:</span>
                <span className="text-gray-900 text-right truncate">
                  {task.assignedToName || 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <span className="text-gray-600 flex-shrink-0">Due Date:</span>
                <span className="text-gray-900 text-right">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                </span>
              </div>
            </div>
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Staff Member
            </label>
            <div className="grid grid-cols-1 gap-2 sm:gap-3 max-h-48 sm:max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
              {staff.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No staff members available</p>
                </div>
              ) : (
                staff.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedStaffId === member.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedStaffId(member.id)}
                  >
                    <input
                      type="radio"
                      name="staff"
                      value={member.id}
                      checked={selectedStaffId === member.id}
                      onChange={() => setSelectedStaffId(member.id)}
                      className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                    />
                    
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                      {getInitials(member.fullName)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {member.fullName}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {member.position}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {member.email}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs text-gray-500 block truncate max-w-[80px]">
                        {member.department}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notification Options */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="sendNotification"
                checked={sendNotification}
                onChange={(e) => setSendNotification(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
              />
              <label htmlFor="sendNotification" className="flex items-start gap-2 text-sm font-medium text-gray-700">
                <Bell className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Send notification to assigned staff member</span>
              </label>
            </div>

            {sendNotification && (
              <div className="ml-7 space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>Notification will be sent via email and in-app notification</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notification Message
                  </label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Enter a custom message for the notification..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This message will be included in the notification email
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {selectedStaffId && (
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Assignment Preview
              </h4>
              <div className="text-xs sm:text-sm text-blue-800 space-y-1">
                <p>
                  Task <strong>"{task.title}"</strong> will be assigned to{' '}
                  <strong>{staff.find(s => s.id === selectedStaffId)?.fullName}</strong>
                </p>
                {sendNotification && (
                  <p>
                    📧 Email notification will be sent to{' '}
                    <strong className="break-all">
                      {staff.find(s => s.id === selectedStaffId)?.email}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons - Fixed */}
        <div className="flex gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={loading || !selectedStaffId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Assigning...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Assign Task</span>
                <span className="sm:hidden">Assign</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
