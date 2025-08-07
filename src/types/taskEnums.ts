// src/types/taskEnums.ts
export enum TaskStatus {
  Todo = 0,
  InProgress = 1,
  InReview = 2,
  Completed = 3,
  Cancelled = 4
}

export enum TaskPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

// Helper functions for string conversion
export const getTaskStatusString = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Todo: return 'To Do'
    case TaskStatus.InProgress: return 'In Progress'
    case TaskStatus.InReview: return 'In Review'
    case TaskStatus.Completed: return 'Completed'
    case TaskStatus.Cancelled: return 'Cancelled'
    default: return 'Unknown'
  }
}

export const getTaskPriorityString = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.Low: return 'Low'
    case TaskPriority.Medium: return 'Medium'
    case TaskPriority.High: return 'High'
    case TaskPriority.Critical: return 'Critical'
    default: return 'Unknown'
  }
}

export const getTaskStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.Todo: return 'bg-gray-100 text-gray-800'
    case TaskStatus.InProgress: return 'bg-blue-100 text-blue-800'
    case TaskStatus.InReview: return 'bg-yellow-100 text-yellow-800'
    case TaskStatus.Completed: return 'bg-green-100 text-green-800'
    case TaskStatus.Cancelled: return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getTaskPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TaskPriority.Low: return 'text-green-600 bg-green-100'
    case TaskPriority.Medium: return 'text-yellow-600 bg-yellow-100'
    case TaskPriority.High: return 'text-orange-600 bg-orange-100'
    case TaskPriority.Critical: return 'text-red-600 bg-red-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}
