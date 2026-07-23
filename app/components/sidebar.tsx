'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, LogOut, Home, Users, Package, Clock, Pill, StethoscopeIcon, Calendar, FileText, BarChart3 } from 'lucide-react'
import { useAuth } from '../lib/auth-context'

interface SidebarProps {
  children: React.ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  const { logout, user } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Appointments', path: '/appointments', icon: Calendar },
    { label: 'Patients', path: '/patients', icon: Users },
    { label: 'Staff', path: '/staff', icon: StethoscopeIcon },
    { label: 'Inventory', path: '/inventory', icon: Package },
    { label: 'Attendance', path: '/attendance', icon: Clock },
    { label: 'Prescriptions', path: '/prescriptions', icon: Pill },
    { label: 'Medical Records', path: '/medical-records', icon: FileText },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ]

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } glass transition-all duration-300 border-r border-white/10 hidden md:flex md:flex-col`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
              PC
            </div>
            {sidebarOpen && <span className="font-bold text-lg text-foreground">PTI Clinic</span>}
          </div>
        </div>

        <nav className="p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-primary border border-blue-400/40'
                    : 'text-foreground/70 hover:text-foreground hover:glass/5'
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="glass border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
          <div className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex items-center justify-between gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-foreground md:hidden flex-shrink-0"
            >
              <Menu size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors text-foreground hidden md:block flex-shrink-0"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 flex-1">
              <span className="text-[10px] xs:text-xs sm:text-sm text-foreground/70 truncate">Welcome, {user?.email?.split('@')[0] || 'User'}</span>
              <button
                onClick={logout}
                className="flex items-center gap-0.5 sm:gap-1 md:gap-2 px-1.5 sm:px-2 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 text-foreground rounded-lg hover:from-red-500/30 hover:to-pink-500/30 transition-all duration-200 text-[10px] xs:text-xs sm:text-sm md:text-base flex-shrink-0"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 md:hidden" />
                <LogOut size={16} className="hidden md:block" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {sidebarOpen && (
            <nav className="md:hidden bg-white/5 border-t border-white/10 px-2 sm:px-4 py-2 space-y-0.5 sm:space-y-1 max-h-96 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-primary border border-blue-400/40'
                        : 'text-foreground/70 hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} className="sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-2 sm:p-3 md:p-6 bg-gradient-to-br from-transparent to-blue-900/10">
          {children}
        </main>
      </div>
    </div>
  )
}
