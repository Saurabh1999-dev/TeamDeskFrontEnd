import { api } from "@/lib/api"

export interface TaskCommentResponse {
  id: string
  taskId: string
  userId: string
  userName: string
  comment: string
  createdAt: string
}

export interface AddTaskCommentRequest {
  comment: string
}

// Add comment to task
export const addTaskComment = async (taskId: string, request: AddTaskCommentRequest): Promise<TaskCommentResponse> => {
  try {
    const response = await api.post<TaskCommentResponse>(`/taskcomments/${taskId}/comments`, request)
    return response
  } catch (error) {
    console.error('Error adding task comment:', error)
    throw error
  }
}

// Get task comments
export const getTaskComments = async (taskId: string): Promise<TaskCommentResponse[]> => {
  try {
    const response = await api.get<TaskCommentResponse[]>(`/taskcomments/${taskId}/comments`)
    return response
  } catch (error) {
    console.error('Error fetching task comments:', error)
    throw error
  }
}

// Delete task comment
export const deleteTaskComment = async (taskId: string, commentId: string): Promise<{ success: boolean }> => {
  try {
    const response = await api.delete<{ success: boolean }>(`/taskcomments/${taskId}/comments/${commentId}`)
    return response
  } catch (error) {
    console.error('Error deleting task comment:', error)
    throw error
  }
}
