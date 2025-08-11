// src/app/(dashboard)/leaves/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Filter, Calendar, Clock, CheckCircle, XCircle, 
  AlertTriangle, User, CalendarDays, Edit, Trash2, Eye, 
  LayoutGrid, List, FileText, Upload, Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLeavesStore } from '@/stores/leaves-store'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole } from '@/types/auth'
import { 
  LeaveStatus, 
  LeaveType, 
  getLeaveTypeString, 
  getLeaveStatusString, 
  getLeaveStatusColor,
  getLeaveTypeColor 
} from '@/types/leaveEnums'
import toast from 'react-hot-toast'
import { DeleteConfirmModal } from '@/components/common/delete-confirm-modal'
import type { Leave } from '@/services/leavesApi'
import { ApplyLeaveModal } from '@/components/leaves/apply-leave-modal'
import { ApproveLeaveModal } from '@/components/leaves/approve-leave-modal'
import { LeaveBalanceCard } from '@/components/leaves/leave-balance-card'

export default function LeavesPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const {
    leaves,
    myLeaves,
    pendingLeaves,
    loading,
    error,
    leaveBalance,
    fetchAllLeaves,
    fetchMyLeaves,
    fetchPendingLeaves,
    deleteLeave,
    clearError,
    fetchLeaveBalance
  } = useLeavesStore()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDateRange, setSelectedDateRange] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'my-leaves' | 'all-leaves' | 'pending'>('my-leaves')

  // Modal states
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [viewingLeave, setViewingLeave] = useState<Leave | null>(null)
  const [approvingLeave, setApprovingLeave] = useState<Leave | null>(null)
  const [deletingLeave, setDeletingLeave] = useState<Leave | null>(null)

  const isAdmin = user && [UserRole.Admin, UserRole.HR].includes(user.role)
  const isStaff = user && user.role === UserRole.Staff

  // Status and type options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: LeaveStatus.Pending, label: getLeaveStatusString(LeaveStatus.Pending) },
    { value: LeaveStatus.Approved, label: getLeaveStatusString(LeaveStatus.Approved) },
    { value: LeaveStatus.Rejected, label: getLeaveStatusString(LeaveStatus.Rejected) },
    { value: LeaveStatus.Cancelled, label: getLeaveStatusString(LeaveStatus.Cancelled) },
  ]

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: LeaveType.Annual, label: getLeaveTypeString(LeaveType.Annual) },
    { value: LeaveType.Sick, label: getLeaveTypeString(LeaveType.Sick) },
    { value: LeaveType.Personal, label: getLeaveTypeString(LeaveType.Personal) },
    { value: LeaveType.Maternity, label: getLeaveTypeString(LeaveType.Maternity) },
    { value: LeaveType.Paternity, label: getLeaveTypeString(LeaveType.Paternity) },
    { value: LeaveType.Emergency, label: getLeaveTypeString(LeaveType.Emergency) },
    { value: LeaveType.Bereavement, label: getLeaveTypeString(LeaveType.Bereavement) },
    { value: LeaveType.Study, label: getLeaveTypeString(LeaveType.Study) },
  ]

  // Load data on component mount
  useEffect(() => {
    if (isAdmin && activeTab === 'all-leaves') {
      fetchAllLeaves()
    } else if (isAdmin && activeTab === 'pending') {
      fetchPendingLeaves()
    } else {
      fetchMyLeaves()
    }

    // Fetch leave balances for common leave types
    if (user?.role === UserRole.Staff) {
      fetchLeaveBalance(LeaveType.Annual)
      fetchLeaveBalance(LeaveType.Sick)
      fetchLeaveBalance(LeaveType.Personal)
    }
  }, [activeTab, isAdmin, fetchAllLeaves, fetchMyLeaves, fetchPendingLeaves, fetchLeaveBalance, user?.role])

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

  // Get current leaves based on active tab
  const getCurrentLeaves = () => {
    switch (activeTab) {
      case 'all-leaves':
        return leaves
      case 'pending':
        return pendingLeaves
      default:
        return myLeaves
    }
  }

  // Filter leaves
  const filteredLeaves = getCurrentLeaves().filter(leave => {
    const matchesSearch = 
      leave.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLeaveTypeString(leave.leaveType).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === 'all' || leave.status === Number(selectedStatus)
    const matchesType = selectedType === 'all' || leave.leaveType === Number(selectedType)
    
    // Date range filtering
    let matchesDateRange = true
    if (selectedDateRange !== 'all') {
      const now = new Date()
      const leaveStartDate = new Date(leave.startDate)
      
      switch (selectedDateRange) {
        case 'this-month':
          matchesDateRange = leaveStartDate.getMonth() === now.getMonth() && 
                            leaveStartDate.getFullYear() === now.getFullYear()
          break
        case 'next-month':
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1)
          matchesDateRange = leaveStartDate.getMonth() === nextMonth.getMonth() && 
                            leaveStartDate.getFullYear() === nextMonth.getFullYear()
          break
        case 'this-year':
          matchesDateRange = leaveStartDate.getFullYear() === now.getFullYear()
          break
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesDateRange
  })

  const handleApplyLeave = () => {
    setShowApplyModal(true)
  }

  const handleViewLeave = (leave: Leave) => {
    setViewingLeave(leave)
  }

  const handleApproveLeave = (leave: Leave) => {
    setApprovingLeave(leave)
  }

  const handleDeleteLeave = async () => {
    if (!deletingLeave) return

    const success = await deleteLeave(deletingLeave.id)
    if (success) {
      toast.success('Leave application deleted successfully')
      setDeletingLeave(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate)
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const getDaysUntilLeave = (startDate: string) => {
    const today = new Date()
    const leaveDate = new Date(startDate)
    const diffTime = leaveDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'Started'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return `In ${diffDays} days`
  }

  // Check permissions
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">Please log in to access leave management.</p>
        </div>
      </div>
    )
  }

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {filteredLeaves.map((leave, index) => (
          <motion.div
            key={leave.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-100 relative"
          >
            {/* Status Indicator */}
            <div className={`absolute top-0 left-0 w-1 h-full rounded-l-xl ${
              leave.status === LeaveStatus.Approved ? 'bg-green-500' :
              leave.status === LeaveStatus.Rejected ? 'bg-red-500' :
              leave.status === LeaveStatus.Pending ? 'bg-yellow-500' : 'bg-gray-500'
            }`} />
            
            {/* Leave Header */}
            <div className="mb-4 pl-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {getLeaveTypeString(leave.leaveType)}
                </h3>
                {leave.status === LeaveStatus.Pending && (
                  <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}
                  </span>
                  {leave.status === LeaveStatus.Approved && new Date(leave.startDate) > new Date() && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getDaysUntilLeave(leave.startDate)}
                    </span>
                  )}
                </div>

                {activeTab !== 'my-leaves' && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{leave.staffName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status and Type */}
            <div className="flex items-center gap-2 mb-4 pl-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveStatusColor(leave.status)}`}>
                {getLeaveStatusString(leave.status)}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                {getLeaveTypeString(leave.leaveType)}
              </span>
            </div>

            {/* Reason */}
            <div className="mb-4 pl-3">
              <p className="text-sm text-gray-600 line-clamp-2">{leave.reason}</p>
            </div>

            {/* Approval Info */}
            {leave.status !== LeaveStatus.Pending && leave.approvedByName && (
              <div className="mb-4 pl-3 text-xs text-gray-500">
                {leave.status === LeaveStatus.Approved ? 'Approved' : 'Rejected'} by {leave.approvedByName}
                {leave.approvedAt && ` on ${formatDate(leave.approvedAt)}`}
              </div>
            )}

            {/* Rejection Comments */}
            {leave.status === LeaveStatus.Rejected && leave.approvalComments && (
              <div className="mb-4 pl-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    <strong>Rejection Reason:</strong> {leave.approvalComments}
                  </p>
                </div>
              </div>
            )}

            {/* Attachments */}
            {leave.attachments.length > 0 && (
              <div className="mb-4 pl-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>{leave.attachments.length} attachment{leave.attachments.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pl-3">
              <button
                onClick={() => handleViewLeave(leave)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              
              {isAdmin && (
                <button
                  onClick={() => handleApproveLeave(leave)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Review
                </button>
              )}

              {activeTab === 'my-leaves' && leave.status === LeaveStatus.Pending && (
                <button
                  onClick={() => setDeletingLeave(leave)}
                  className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  title="Delete leave application"
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

  // List View Component (similar structure but in table format)
  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
        <div className="col-span-2">Type</div>
        <div className="col-span-2">Dates</div>
        <div className="col-span-1">Days</div>
        <div className="col-span-1">Status</div>
        {activeTab !== 'my-leaves' && <div className="col-span-2">Staff</div>}
        <div className={activeTab !== 'my-leaves' ? "col-span-2" : "col-span-4"}>Reason</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        <AnimatePresence>
          {filteredLeaves.map((leave, index) => (
            <motion.div
              key={leave.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors relative"
            >
              {/* Status Indicator */}
              <div className={`absolute left-0 top-0 w-1 h-full ${
                leave.status === LeaveStatus.Approved ? 'bg-green-500' :
                leave.status === LeaveStatus.Rejected ? 'bg-red-500' :
                leave.status === LeaveStatus.Pending ? 'bg-yellow-500' : 'bg-gray-500'
              }`} />

              {/* Type */}
              <div className="col-span-2 flex items-center pl-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.leaveType)}`}>
                  {getLeaveTypeString(leave.leaveType)}
                </span>
              </div>

              {/* Dates */}
              <div className="col-span-2 flex items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDateRange(leave.startDate, leave.endDate)}
                  </div>
                  {leave.status === LeaveStatus.Approved && new Date(leave.startDate) > new Date() && (
                    <div className="text-xs text-blue-600">
                      {getDaysUntilLeave(leave.startDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Days */}
              <div className="col-span-1 flex items-center">
                <span className="text-sm text-gray-700">{leave.totalDays}</span>
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLeaveStatusColor(leave.status)}`}>
                  {getLeaveStatusString(leave.status)}
                </span>
              </div>

              {/* Staff (for admin view) */}
              {activeTab !== 'my-leaves' && (
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-gray-700 truncate">{leave.staffName}</span>
                </div>
              )}

              {/* Reason */}
              <div className={`${activeTab !== 'my-leaves' ? "col-span-2" : "col-span-4"} flex items-center`}>
                <div className="w-full">
                  <p className="text-sm text-gray-700 line-clamp-1">{leave.reason}</p>
                  {leave.status === LeaveStatus.Rejected && leave.approvalComments && (
                    <p className="text-xs text-red-600 mt-1 line-clamp-1">
                      Rejected: {leave.approvalComments}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center gap-1">
                <button
                  onClick={() => handleViewLeave(leave)}
                  className="p-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="View leave"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                {isAdmin && leave.status === LeaveStatus.Pending && (
                  <button
                    onClick={() => handleApproveLeave(leave)}
                    className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    title="Review leave"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}

                {activeTab === 'my-leaves' && leave.status === LeaveStatus.Pending && (
                  <button
                    onClick={() => setDeletingLeave(leave)}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    title="Delete leave"
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
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">
            {filteredLeaves.length} of {getCurrentLeaves().length} leave applications
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
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
            onClick={handleApplyLeave}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Apply for Leave
          </motion.button>
        </div>
      </div>

      {/* Leave Balance Cards (for staff) */}
      {user.role === UserRole.Staff && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <LeaveBalanceCard 
            leaveType={LeaveType.Annual}
            balance={leaveBalance[LeaveType.Annual] || 0}
            title="Annual Leave"
            color="blue"
          />
          <LeaveBalanceCard 
            leaveType={LeaveType.Sick}
            balance={leaveBalance[LeaveType.Sick] || 0}
            title="Sick Leave"
            color="red"
          />
          <LeaveBalanceCard 
            leaveType={LeaveType.Personal}
            balance={leaveBalance[LeaveType.Personal] || 0}
            title="Personal Leave"
            color="purple"
          />
        </div>
      )}

      {/* Tabs (for admin) */}
      {isAdmin && (
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-leaves')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-leaves'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Leaves
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pending Approvals
              {pendingLeaves.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                  {pendingLeaves.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('all-leaves')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all-leaves'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Leaves
            </button>
          </nav>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by reason, staff name, or leave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-gray-400" />
            
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

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
            >
              <option value="all">All Dates</option>
              <option value="this-month">This Month</option>
              <option value="next-month">Next Month</option>
              <option value="this-year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
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
      {!loading && filteredLeaves.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leave applications found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus !== 'all' || selectedType !== 'all' || selectedDateRange !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by applying for your first leave'
            }
          </p>
          {(!searchTerm && selectedStatus === 'all' && selectedType === 'all' && selectedDateRange === 'all') && (
            <button
              onClick={handleApplyLeave}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply for Leave
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showApplyModal && (
        <ApplyLeaveModal
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setShowApplyModal(false)
            fetchMyLeaves()
          }}
        />
      )}

      {/* {viewingLeave && (
        <LeaveDetailsModal
          leave={viewingLeave}
          onClose={() => setViewingLeave(null)}
          onEdit={() => {
            // Handle edit functionality
            setViewingLeave(null)
          }}
        />
      )} */}

      {approvingLeave && (
        <ApproveLeaveModal
          leave={approvingLeave}
          onClose={() => setApprovingLeave(null)}
          onSuccess={() => {
            setApprovingLeave(null)
            // Refresh appropriate list based on active tab
            if (activeTab === 'pending') {
              fetchPendingLeaves()
            } else if (activeTab === 'all-leaves') {
              fetchAllLeaves()
            }
          }}
        />
      )}

      {deletingLeave && (
        <DeleteConfirmModal
          title="Delete Leave Application"
          message={`Are you sure you want to delete your ${getLeaveTypeString(deletingLeave.leaveType)} application? This action cannot be undone.`}
          onCancel={() => setDeletingLeave(null)}
          onConfirm={handleDeleteLeave}
          loading={loading}
        />
      )}
    </div>
  )
}
