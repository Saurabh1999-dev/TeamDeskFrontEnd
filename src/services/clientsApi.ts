import { api } from "@/lib/api"

export interface Client {
  id: string
  name: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address: string
  projectsCount: number
  totalValue: number
  status: 'Active' | 'Inactive'
  createdAt: string
}

export interface CreateClientRequest {
  name: string
  contactPerson: string
  contactEmail: string
  contactPhone: string
  address: string
  status: 'Active' | 'Inactive'
}

export interface UpdateClientRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  // Add other properties for updates
}

export const getAllClients = async (): Promise<any> => {
  const response = await api.get('/client/clients')
  return response
}

export const getClientById = async (id: string): Promise<any> => {
  const response = await api.get(`/client/clients/${id}`)
  return response
}

export const createClient = async (data: CreateClientRequest): Promise<any> => {
  const response = await api.post('/client/clients', data)
  return response
}

export const updateClient = async (id: string, data: UpdateClientRequest): Promise<any> => {
  const response = await api.put(`/client/clients/${id}`, data)
  return response
}

export const deleteClient = async (id: string): Promise<boolean> => {
  await api.delete(`/client/clients/${id}`)
  return true
}
