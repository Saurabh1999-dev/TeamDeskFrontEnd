// src/stores/clients-store.ts
import { create } from 'zustand'
import {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  type Client,
  type CreateClientRequest,
  type UpdateClientRequest
} from '@/services/clientsApi'

interface ClientsState {
  clients: Client[]
  currentClient: Client | null
  loading: boolean
  error: string | null

  fetchClients: () => Promise<void>
  fetchClientById: (id: string) => Promise<void>
  createClient: (data: CreateClientRequest) => Promise<boolean>
  updateClient: (id: string, data: UpdateClientRequest) => Promise<boolean>
  deleteClient: (id: string) => Promise<boolean>
  clearError: () => void
  clearCurrentClient: () => void
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  currentClient: null,
  loading: false,
  error: null,

  fetchClients: async () => {
    set({ loading: true, error: null })
    try {
      const clientsArray = await getAllClients()
      console.log('📊 Clients array received:', clientsArray)
      console.log('📊 Clients count:', clientsArray.length)
      const processedClients = clientsArray.map((client: any) => ({
        ...client,
      }))

      set({
        clients: processedClients,
        loading: false,
        error: null
      })
    } catch (error: any) {
      console.error('❌ Error fetching clients:', error)
      set({
        error: error.message || 'Failed to fetch clients',
        loading: false,
        clients: []
      })
    }
  },

  fetchClientById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const client = await getClientById(id)
      const processedClient = {
        ...client,
      }

      set({ currentClient: processedClient, loading: false })
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch client', loading: false })
    }
  },

  createClient: async (data: CreateClientRequest) => {
    set({ loading: true, error: null })
    try {
      const newClient = await createClient(data)
      const processedClient = {
        ...newClient,
      }

      set(state => ({
        clients: [...state.clients, processedClient],
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to create client', loading: false })
      return false
    }
  },

  updateClient: async (id: string, data: UpdateClientRequest) => {
    set({ loading: true, error: null })
    try {
      const updatedClient = await updateClient(id, data)
      debugger
      const processedClient = {
        ...updatedClient,
      }

      set(state => ({
        clients: state.clients.map(c => c.id === id ? processedClient : c),
        currentClient: state.currentClient?.id === id ? processedClient : state.currentClient,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to update client', loading: false })
      return false
    }
  },

  deleteClient: async (id: string) => {
    set({ loading: true, error: null })
    try {
      await deleteClient(id)
      set(state => ({
        clients: state.clients.filter(c => c.id !== id),
        currentClient: state.currentClient?.id === id ? null : state.currentClient,
        loading: false
      }))
      return true
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete client', loading: false })
      return false
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentClient: () => set({ currentClient: null }),
}))
