'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Navbar } from '@/components/dashboard/navbar'
import { MobileSidebar } from '@/components/dashboard/mobile-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <MobileSidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 pt-6 pl-70 pr-6 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
