// src/components/leaves/leave-balance-card.tsx
'use client'

import { LeaveType } from "@/types/leaveEnums"
import { Calendar } from "lucide-react"

interface LeaveBalanceCardProps {
  leaveType: LeaveType
  balance: number
  title: string
  color: 'blue' | 'red' | 'purple' | 'green'
}

export function LeaveBalanceCard({ leaveType, balance, title, color }: LeaveBalanceCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    green: 'bg-green-50 border-green-200 text-green-800'
  }

  const iconClasses = {
    blue: 'text-blue-500',
    red: 'text-red-500',
    purple: 'text-purple-500',
    green: 'text-green-500'
  }

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-2xl font-bold mt-1">{balance}</p>
          <p className="text-sm opacity-75">days remaining</p>
        </div>
        <Calendar className={`w-8 h-8 ${iconClasses[color]}`} />
      </div>
    </div>
  )
}
