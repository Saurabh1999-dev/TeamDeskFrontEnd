'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Users, FolderOpen, Building, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole, getUserRoleString } from '@/types/auth'
import { Route } from 'next'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  { 
    label: 'Dashboard', 
    path: '/dashboard', 
    icon: Home, 
    roles: [UserRole.Admin, UserRole.HR, UserRole.Staff] 
  },
  { 
    label: 'Projects', 
    path: '/projects', 
    icon: FolderOpen, 
    roles: [UserRole.Admin, UserRole.HR, UserRole.Staff] 
  },
  { 
    label: 'Staff', 
    path: '/staff', 
    icon: Users, 
    roles: [UserRole.Admin, UserRole.HR]
  },
  { 
    label: 'Clients', 
    path: '/clients', 
    icon: Building, 
    roles: [UserRole.Admin, UserRole.HR, UserRole.Staff] 
  },
]

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuthStore()

  const filteredItems = navigationItems.filter(item => 
    user ? item.roles.includes(user.role) : false
  )

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />

          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 lg:hidden"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">TD</span>
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900">TeamDesk</h1>
                    <p className="text-xs text-gray-500">
                      {user ? getUserRoleString(user.role) : 'Guest'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 overflow-y-auto">
                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        href={item.path as Route}
                        onClick={onClose}
                        className={`group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
                        )}
                        
                        <item.icon 
                          className={`mr-3 h-5 w-5 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`} 
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
