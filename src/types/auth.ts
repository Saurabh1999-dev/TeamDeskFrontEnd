export enum UserRole {
  Staff = 0,
  Admin = 1,
  HR = 2
}

export const getUserRoleString = (role: UserRole): string => {
  return UserRole[role]
}

export const getUserRoleFromString = (roleString: string): UserRole => {
  switch (roleString) {
    case 'Staff': return UserRole.Staff
    case 'Admin': return UserRole.Admin
    case 'HR': return UserRole.HR
    default: return UserRole.Staff
  }
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: User
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: UserRole
}
