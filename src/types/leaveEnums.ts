export enum LeaveType {
  Annual = 1,
  Sick = 2,
  Personal = 3,
  Maternity = 4,
  Paternity = 5,
  Emergency = 6,
  Bereavement = 7,
  Study = 8
}

export enum LeaveStatus {
  Pending = 1,
  Approved = 2,
  Rejected = 3,
  Cancelled = 4
}

export const getLeaveTypeString = (leaveType: LeaveType): string => {
  switch (leaveType) {
    case LeaveType.Annual: return 'Annual Leave'
    case LeaveType.Sick: return 'Sick Leave'
    case LeaveType.Personal: return 'Personal Leave'
    case LeaveType.Maternity: return 'Maternity Leave'
    case LeaveType.Paternity: return 'Paternity Leave'
    case LeaveType.Emergency: return 'Emergency Leave'
    case LeaveType.Bereavement: return 'Bereavement Leave'
    case LeaveType.Study: return 'Study Leave'
    default: return 'Unknown'
  }
}

export const getLeaveStatusString = (status: LeaveStatus): string => {
  switch (status) {
    case LeaveStatus.Pending: return 'Pending'
    case LeaveStatus.Approved: return 'Approved'
    case LeaveStatus.Rejected: return 'Rejected'
    case LeaveStatus.Cancelled: return 'Cancelled'
    default: return 'Unknown'
  }
}

export const getLeaveStatusColor = (status: LeaveStatus): string => {
  switch (status) {
    case LeaveStatus.Pending: return 'bg-yellow-100 text-yellow-800'
    case LeaveStatus.Approved: return 'bg-green-100 text-green-800'
    case LeaveStatus.Rejected: return 'bg-red-100 text-red-800'
    case LeaveStatus.Cancelled: return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getLeaveTypeColor = (leaveType: LeaveType): string => {
  switch (leaveType) {
    case LeaveType.Annual: return 'bg-blue-100 text-blue-800'
    case LeaveType.Sick: return 'bg-red-100 text-red-800'
    case LeaveType.Personal: return 'bg-purple-100 text-purple-800'
    case LeaveType.Maternity: return 'bg-pink-100 text-pink-800'
    case LeaveType.Paternity: return 'bg-indigo-100 text-indigo-800'
    case LeaveType.Emergency: return 'bg-orange-100 text-orange-800'
    case LeaveType.Bereavement: return 'bg-gray-100 text-gray-800'
    case LeaveType.Study: return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}