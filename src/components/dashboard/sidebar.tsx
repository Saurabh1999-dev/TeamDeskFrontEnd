// src/components/dashboard/sidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Users, FolderOpen, Building, Settings, LogOut, CheckSquare } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { UserRole, getUserRoleString } from '@/types/auth'
import { Route } from 'next'

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
    label: 'Tasks', 
    path: '/tasks', 
    icon: CheckSquare, 
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

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  const filteredItems = navigationItems.filter(item => 
    user ? item.roles.includes(user.role) : false
  )

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white shadow-xl border-r border-gray-100 flex flex-col z-50">
      <div className="p-6 border-b border-gray-100">
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
      </div>

      <nav className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {filteredItems.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path as Route}
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

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors w-full text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
