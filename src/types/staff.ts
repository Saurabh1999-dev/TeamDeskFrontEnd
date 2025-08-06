// src/types/staff.ts
export interface Staff {
  id: string
  fullName: string
  email: string
  employeeCode: string
  department: string
  position: string
  hireDate: string
  skills: string[]
  isActive: boolean
  createdAt: string
}

export interface CreateStaffRequest {
  email: string
  firstName: string
  lastName: string
  employeeCode: string
  department: string
  position: string
  hireDate: string
  salary: number
  skills: string[]
  role: string
}
