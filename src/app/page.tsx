'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Users, 
  FolderOpen, 
  BarChart3, 
  Shield, 
  Clock, 
  CheckCircle 
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { Route } from 'next'

export default function HomePage() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore() // Changed 'loading' to 'isLoading'
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Only redirect if we're specifically on the root page and authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) { // Changed 'loading' to 'isLoading'
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router]) // Changed 'loading' to 'isLoading'

  const features = [
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage your team members, roles, and permissions with ease.',
    },
    {
      icon: FolderOpen,
      title: 'Project Tracking',
      description: 'Track project progress, deadlines, and deliverables in real-time.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into team performance and project metrics.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control.',
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description: 'Monitor time spent on projects and tasks efficiently.',
    },
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Create, assign, and track tasks with powerful collaboration tools.',
    },
  ]

  // Show loading while checking authentication
  if (isLoading) { // Changed 'loading' to 'isLoading'
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // If authenticated, show loading state while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TD</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TeamDesk</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href={"/login" as Route}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={"/signup" as Route}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Manage Your Team &{' '}
              <span className="text-blue-600">Projects</span>{' '}
              Effortlessly
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              TeamDesk is a comprehensive project management solution that helps you organize teams, 
              track projects, and deliver results faster than ever before.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href={"/signup" as Route}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold text-lg"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href= {"/login" as Route}
                className="inline-flex items-center gap-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 transition-colors font-semibold text-lg"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to streamline your workflow and boost team productivity.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using TeamDesk to deliver amazing results.
          </p>
          <Link
            href={"/signup" as Route}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TD</span>
                </div>
                <span className="text-xl font-bold">TeamDesk</span>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering teams to achieve more with intelligent project management solutions.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TeamDesk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
