'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../lib/auth-context'
import { useData } from '../lib/data-context'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'appointment' | 'status'>('login')
  const [email, setEmail] = useState('admin@pticlinic.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { addAppointment } = useData()
  const router = useRouter()

  // Appointment form state
  const [appointmentData, setAppointmentData] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
  })
  const [appointmentSuccess, setAppointmentSuccess] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Use auth context login
      await login(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!appointmentData.patient_name || !appointmentData.patient_email || !appointmentData.appointment_date) {
      setError('Please fill in all required fields')
      return
    }

    try {
      addAppointment({
        patient_name: appointmentData.patient_name,
        patient_email: appointmentData.patient_email,
        patient_phone: appointmentData.patient_phone,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        reason: appointmentData.reason,
      })

      setAppointmentSuccess(true)
      setAppointmentData({
        patient_name: '',
        patient_email: '',
        patient_phone: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
      })

      setTimeout(() => {
        setAppointmentSuccess(false)
      }, 5000)
    } catch (err) {
      setError('Failed to book appointment')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-2 sm:p-3 md:p-4">
      <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl">
        <div className="glass overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/10 gap-0.5 sm:gap-0">
            <button
              onClick={() => {
                setActiveTab('login')
                setError('')
              }}
              className={`flex-1 py-1.5 sm:py-2 md:py-4 font-semibold text-[10px] xs:text-xs sm:text-sm md:text-base text-center transition-all duration-200 truncate ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-primary border-b-2 border-primary'
                  : 'text-foreground/60 hover:text-foreground/80 hover:bg-white/5'
              }`}
            >
              <span className="hidden sm:inline">Staff </span>Login
            </button>
            <button
              onClick={() => {
                setActiveTab('appointment')
                setError('')
              }}
              className={`flex-1 py-1.5 sm:py-2 md:py-4 font-semibold text-[10px] xs:text-xs sm:text-sm md:text-base text-center transition-all duration-200 truncate ${
                activeTab === 'appointment'
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-primary border-b-2 border-primary'
                  : 'text-foreground/60 hover:text-foreground/80 hover:bg-white/5'
              }`}
            >
              <span className="hidden sm:inline">Book </span>Appt
            </button>
            <button
              onClick={() => {
                setActiveTab('status')
                setError('')
              }}
              className={`flex-1 py-1.5 sm:py-2 md:py-4 font-semibold text-[10px] xs:text-xs sm:text-sm md:text-base text-center transition-all duration-200 truncate ${
                activeTab === 'status'
                  ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-primary border-b-2 border-primary'
                  : 'text-foreground/60 hover:text-foreground/80 hover:bg-white/5'
              }`}
            >
              <span className="hidden xs:inline">Status</span><span className="xs:hidden">Info</span>
            </button>
          </div>

          <div className="p-2 sm:p-4 md:p-8">
            <div className="text-center mb-3 sm:mb-4 md:mb-8">
              <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold glow-text">PTI Clinic</h1>
              <p className="text-foreground/70 mt-0.5 sm:mt-1 md:mt-2 text-xs xs:text-sm md:text-base">Management System</p>
            </div>

            {error && (
              <div className="mb-2 sm:mb-4 md:mb-6 p-1.5 sm:p-2 md:p-4 glass-sm bg-gradient-to-r from-red-500/20 to-pink-500/10 border border-red-400/30 rounded-lg flex items-start sm:items-center gap-2 sm:gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" size={16} className="sm:w-5 sm:h-5" />
                <span className="text-red-200 text-xs sm:text-sm">{error}</span>
              </div>
            )}

            {appointmentSuccess && (
              <div className="mb-2 sm:mb-4 md:mb-6 p-1.5 sm:p-2 md:p-4 glass-sm bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-400/30 rounded-lg flex items-start sm:items-center gap-2 sm:gap-3">
                <CheckCircle className="text-green-400 flex-shrink-0 mt-0.5 sm:mt-0" size={16} className="sm:w-5 sm:h-5" />
                <span className="text-green-200 text-xs sm:text-sm">Appointment booked successfully! Check your email.</span>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-2 sm:space-y-3 md:space-y-4">
                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-medium text-foreground/80 mb-1 sm:mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input w-full px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                    placeholder="admin@pticlinic.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] xs:text-xs sm:text-sm font-medium text-foreground/80 mb-1 sm:mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass-input w-full px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="glass-button-accent w-full py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed rounded-lg mt-1"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>

                <p className="text-center text-foreground/60 text-[10px] xs:text-xs sm:text-sm">
                  Demo Credentials Pre-filled
                </p>
              </form>
            )}

            {/* Appointment Form */}
            {activeTab === 'appointment' && (
              <form onSubmit={handleAppointmentSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                  <div>
                    <label className="block text-[11px] xs:text-xs sm:text-sm font-medium text-foreground/80 mb-1 sm:mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={appointmentData.patient_name}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, patient_name: e.target.value })
                      }
                      className="glass-input w-full px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground/80 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={appointmentData.patient_email}
                      onChange={(e) =>
                        setAppointmentData({ ...appointmentData, patient_email: e.target.value })
                      }
                      className="glass-input w-full px-3 md:px-4 py-2 text-sm"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-foreground/80 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={appointmentData.patient_phone}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, patient_phone: e.target.value })
                    }
                    className="glass-input w-full px-3 md:px-4 py-2 text-sm"
                    placeholder="555-1234"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground/80 mb-2">
                      Appointment Date *
                    </label>
                    <input
                      type="date"
                      value={appointmentData.appointment_date}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          appointment_date: e.target.value,
                        })
                      }
                      className="glass-input w-full px-3 md:px-4 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-foreground/80 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={appointmentData.appointment_time}
                      onChange={(e) =>
                        setAppointmentData({
                          ...appointmentData,
                          appointment_time: e.target.value,
                        })
                      }
                      className="glass-input w-full px-3 md:px-4 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-foreground/80 mb-2">
                    Reason for Visit
                  </label>
                  <textarea
                    value={appointmentData.reason}
                    onChange={(e) =>
                      setAppointmentData({ ...appointmentData, reason: e.target.value })
                    }
                    className="glass-input w-full px-3 md:px-4 py-2 text-sm"
                    placeholder="Describe your reason for visiting"
                    rows={3}
                  />
                </div>

                <button
                  type="submit"
                  className="glass-button-accent w-full py-2 text-sm md:text-base"
                >
                  Book Appointment
                </button>
              </form>
            )}

            {/* Status Check Form */}
            {activeTab === 'status' && (
              <div className="space-y-3 md:space-y-4 text-center">
                <p className="text-foreground/70 mb-4 md:mb-6 text-sm md:text-base">
                  Enter your email to check the status of your appointment
                </p>
                <a
                  href="/student/appointments"
                  className="glass-button-accent w-full inline-block py-2 text-sm md:text-base"
                >
                  Go to Status Check
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
