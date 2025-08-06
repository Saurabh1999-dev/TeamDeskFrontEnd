import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'
import { User, UserRole, getUserRoleFromString, getUserRoleString } from '@/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: { email: string; password: string }) => Promise<boolean>
  register: (data: any) => Promise<boolean>
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true, // Initialize as true to prevent premature redirects
      isAuthenticated: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await api.post<any>('/auth/login', credentials)
          
          if (response.success && response.token && response.user) {
            // Convert backend role number to enum
            const user: User = {
              ...response.user,
              role: response.user.role as UserRole // Backend sends number, cast to enum
            }
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.token)
            }
            
            set({
              user: user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Login error:', error)
          set({ isLoading: false })
          return false
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          // Convert role string to enum value before sending
          const registerData = {
            ...data,
            role: typeof data.role === 'string' ? getUserRoleFromString(data.role) : data.role
          }
          
          const response = await api.post<any>('/auth/register', registerData)
          
          if (response.success && response.token && response.user) {
            const user: User = {
              ...response.user,
              role: response.user.role as UserRole
            }
            
            if (typeof window !== 'undefined') {
              localStorage.setItem('token', response.token)
            }
            
            set({
              user: user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            })
            return true
          } else {
            set({ isLoading: false })
            return false
          }
        } catch (error) {
          console.error('Register error:', error)
          set({ isLoading: false })
          return false
        }
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      checkAuth: async () => {
        set({ isLoading: true })
        
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          
          if (!token) {
            set({ 
              isLoading: false, 
              isAuthenticated: false, 
              user: null, 
              token: null 
            })
            return
          }

          const response = await api.get<any>('/auth/verify')

          if (response.success && response.user) {
            const user: User = {
              ...response.user,
              role: response.user.role as UserRole
            }
            
            set({
              user: user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token')
            }
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
            })
          }
        } catch (error) {
          console.error('Auth check error:', error)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)
