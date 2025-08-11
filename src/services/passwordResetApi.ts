// src/services/passwordResetApi.ts
import { api } from "@/lib/api"

export interface ForgotPasswordRequest {
  email: string
  clientURI: string
}

export interface ResetPasswordRequest {
  email: string
  token: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyResetTokenRequest {
  email: string
  token: string
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
}

export interface VerifyTokenResponse {
  isValid: boolean
  email: string
  message: string
}

// Send forgot password email
export const forgotPassword = async (request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
  try {
    const response = await api.post<ForgotPasswordResponse>('/passwordreset/forgot-password', request)
    return response
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to send reset email')
  }
}

// Verify reset token
export const verifyResetToken = async (request: VerifyResetTokenRequest): Promise<VerifyTokenResponse> => {
  try {
    const response = await api.post<VerifyTokenResponse>('/passwordreset/verify-reset-token', request)
    return response
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to verify token')
  }
}

// Reset password
export const resetPassword = async (request: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>('/passwordreset/reset-password', request)
    return response
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to reset password')
  }
}
