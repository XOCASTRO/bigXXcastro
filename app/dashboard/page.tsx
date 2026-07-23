'use client'

import { Users, Package, Clock, AlertCircle, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function DashboardContent() {
  const { patients, staff, inventory, appointments } = useData()
  
  const pendingAppointments = appointments.filter((a) => a.status === 'PENDING')
  const lowStockItems = inventory.filter((i) => i.quantity <= i.min_stock)

  // Summary data from actual data
  const summary = {
    total_patients: patients.length,
    total_staff: staff.length,
    total_inventory: inventory.length,
    pending_appointments: pendingAppointments.length,
  }

  const stats = [
    {
      label: 'Total Patients',
      value: summary.total_patients,
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Pending Appointments',
      value: summary.pending_appointments,
      icon: Calendar,
      color: 'red',
    },
    {
      label: 'Total Staff',
      value: summary.total_staff,
      icon: Users,
      color: 'green',
    },
    {
      label: 'Inventory Items',
      value: summary.total_inventory,
      icon: Package,
      color: 'purple',
    },
  ]

  const colorMap: Record<string, string> = {
    blue: 'glass bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-300',
    green: 'glass bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-300',
    purple: 'glass bg-gradient-to-br from-purple-500/20 to-pink-500/10 text-purple-300',
    orange: 'glass bg-gradient-to-br from-orange-500/20 to-red-500/10 text-orange-300',
  }

  return (
    <Sidebar>
      <div className="space-y-2 sm:space-y-3 md:space-y-6">
        <div>
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold glow-text">Dashboard</h1>
          <p className="text-foreground/70 mt-0.5 sm:mt-1 md:mt-2 text-xs xs:text-sm md:text-base">Welcome back to PTI Clinic Management System</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="glass-card p-2 sm:p-3 md:p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground/70 text-[10px] xs:text-xs sm:text-sm truncate">{stat.label}</p>
                    <p className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-primary mt-1 md:mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-1.5 sm:p-2 md:p-3 rounded-lg flex-shrink-0 ${colorMap[stat.color]}`}>
                    <Icon size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Low Stock Alert */}
        <div className="glass-card bg-gradient-to-br from-orange-500/10 to-red-500/5 p-2 sm:p-3 md:p-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 md:mb-4">
            <AlertCircle className="text-orange-400 flex-shrink-0" size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
            <h2 className="text-xs sm:text-sm md:text-lg font-semibold text-orange-200 truncate">Low Stock Items</h2>
          </div>
          <p className="text-foreground/70 text-[10px] xs:text-xs sm:text-sm md:text-sm">No items currently below reorder level</p>
        </div>
      </div>
    </Sidebar>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
