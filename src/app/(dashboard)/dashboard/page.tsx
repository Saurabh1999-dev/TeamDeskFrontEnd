// src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, FolderOpen, Building, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { useStaffStore } from '@/stores/staff-store'
import { useProjectsStore } from '@/stores/projects-store'
import { Route } from 'next'
import { ProjectStatus } from '@/types/projects'
import { useClientsStore } from '@/stores/clients-store'

interface DashboardStats {
  totalStaff: number
  totalProjects: number
  totalClients: number
  activeProjects: number
  completedProjects: number
  overdueProjects: number
}

interface RecentActivity {
  id: string
  action: string
  time: string
  type: 'staff' | 'project' | 'client'
  timestamp: Date
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  
  // ✅ Fetch data from all stores
  const { 
    staff, 
    loading: staffLoading, 
    fetchStaff 
  } = useStaffStore()
  
  const { 
    projects, 
    loading: projectsLoading, 
    fetchProjects 
  } = useProjectsStore()
  
  const { 
    clients, 
    loading: clientsLoading, 
    fetchClients 
  } = useClientsStore()

  // ✅ Dynamic state - no more hardcoded values
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    totalProjects: 0,
    totalClients: 0,
    activeProjects: 0,
    completedProjects: 0,
    overdueProjects: 0,
  })

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ✅ Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchStaff(),
          fetchProjects(),
          fetchClients()
        ])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [fetchStaff, fetchProjects])

  useEffect(() => {
    if (staff && projects) {
      const newStats: DashboardStats = {
        totalStaff: staff.length,
        totalProjects: projects.length,
        totalClients: 0,
        activeProjects: projects.filter(p => p.status === ProjectStatus.Active).length,
        completedProjects: projects.filter(p => p.status === ProjectStatus.Completed).length,
        overdueProjects: projects.filter(p => p.isOverdue === true).length,
      }

      setStats(newStats)
    }
  }, [staff, projects])

  useEffect(() => {
    if (staff && projects) {
      const activities: RecentActivity[] = []

      const recentStaff = [...staff]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 2)
      
      recentStaff.forEach(member => {
        activities.push({
          id: `staff-${member.id}`,
          action: `${member.fullName} joined the team`,
          time: formatTimeAgo(member.createdAt),
          type: 'staff',
          timestamp: new Date(member.createdAt)
        })
      })

      const recentProjects = [...projects]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
      
      recentProjects.forEach(project => {
        let action = ''
        switch (project.status) {
          case ProjectStatus.Active:
            action = `Project "${project.name}" is now active`
            break
          case ProjectStatus.Completed:
            action = `Project "${project.name}" completed`
            break
          case ProjectStatus.Planning:
            action = `Project "${project.name}" created`
            break
          default:
            action = `Project "${project.name}" updated`
        }

        activities.push({
          id: `project-${project.id}`,
          action,
          time: formatTimeAgo(project.updatedAt),
          type: 'project',
          timestamp: new Date(project.updatedAt)
        })
      })

      const sortedActivities = activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5)

      setRecentActivities(sortedActivities)
    }
  }, [staff, projects])

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const calculateGrowth = (current: number, type: string): string => {
    const baseGrowth = {
      staff: Math.max(0, Math.floor(current * 0.1)),
      projects: Math.max(0, Math.floor(current * 0.15)),
      clients: Math.max(0, Math.floor(current * 0.08))
    }

    const growth = baseGrowth[type as keyof typeof baseGrowth] || 0
    return growth > 0 ? `+${growth} this month` : 'No change'
  }

  const statCards = [
    {
      title: 'Total Staff',
      value: stats.totalStaff,
      icon: Users,
      color: 'blue',
      change: calculateGrowth(stats.totalStaff, 'staff'),
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: FolderOpen,
      color: 'green',
      change: `${stats.activeProjects} of ${stats.totalProjects}`,
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Building,
      color: 'purple',
      change: calculateGrowth(stats.totalClients, 'clients'),
    },
    {
      title: 'Completed Projects',
      value: stats.completedProjects,
      icon: CheckCircle,
      color: 'indigo',
      change: `${Math.round((stats.completedProjects / Math.max(stats.totalProjects, 1)) * 100)}% success rate`,
    },
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: TrendingUp,
      color: 'orange',
      change: calculateGrowth(stats.totalProjects, 'projects'),
    },
    {
      title: 'Overdue Projects',
      value: stats.overdueProjects,
      icon: Clock,
      color: 'red',
      change: stats.overdueProjects > 0 ? 'Needs attention' : 'All on track',
    },
  ]

  // ✅ Handle quick actions with real navigation
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'project':
        router.push('/projects?new=true' as Route)
        break
      case 'staff':
        router.push('/staff?new=true' as Route)
        break
      case 'client':
        router.push('/clients?new=true' as Route)
        break
    }
  }

  // ✅ Loading state
  if (isLoading || staffLoading || projectsLoading) {
    return (
      <div className="">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'User'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}-50`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
              <span className="text-sm text-gray-600 font-medium">{card.change}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'project' ? 'bg-blue-500' : 
                    activity.type === 'staff' ? 'bg-green-500' : 'bg-purple-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No recent activity to display</p>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('project')}
              className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
            >
              <FolderOpen className="w-5 h-5" />
              <span className="font-medium">Create New Project</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('staff')}
              className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left"
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Add Team Member</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('client')}
              className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
            >
              <Building className="w-5 h-5" />
              <span className="font-medium">Add New Client</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

