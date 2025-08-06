'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { Route } from 'next'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore() // Changed from 'loading' to 'isLoading'
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const authenticateUser = async () => {
      await checkAuth()
      setIsChecking(false)
    }
    
    authenticateUser()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !isChecking && !isAuthenticated) {
      router.push('/login' as Route)
    }
  }, [isAuthenticated, isLoading, isChecking, router])

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
