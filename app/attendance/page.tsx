'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, LogOut } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-300'
    case 'IN_PROGRESS':
      return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-300'
    case 'PENDING':
      return 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 text-yellow-300'
    default:
      return 'bg-white/5 text-foreground'
  }
}

function AttendanceContent() {
  const { attendance, addAttendance, updateAttendance, staff, patients } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    staff_id: '',
    staff_name: '',
    check_in: new Date().toISOString().slice(0, 16),
    check_out: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleOpenModal = (record?: any) => {
    if (record) {
      setEditingId(record.id)
      setFormData({
        staff_id: record.staff_id,
        staff_name: record.staff_name,
        check_in: record.check_in,
        check_out: record.check_out || '',
        date: record.date,
      })
    } else {
      setEditingId(null)
      setFormData({
        staff_id: '',
        staff_name: '',
        check_in: new Date().toISOString().slice(0, 16),
        check_out: '',
        date: new Date().toISOString().split('T')[0],
      })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.staff_id || !formData.staff_name || !formData.check_in) {
      alert('Please fill required fields')
      return
    }

    if (editingId) {
      updateAttendance(editingId, {
        staff_id: formData.staff_id,
        staff_name: formData.staff_name,
        check_in: formData.check_in,
        check_out: formData.check_out,
        date: formData.date,
      })
    } else {
      addAttendance({
        staff_id: formData.staff_id,
        staff_name: formData.staff_name,
        check_in: formData.check_in,
        check_out: formData.check_out,
        date: formData.date,
      })
    }

    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    // Note: attendance service doesn't have delete, but we can show this for future implementation
    setDeleteConfirm(null)
  }

  const handleCheckOut = (record: any) => {
    updateAttendance(record.id, {
      check_out: new Date().toISOString(),
    })
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold glow-text">Staff Attendance</h1>
          <button
            onClick={() => handleOpenModal()}
            className="glass-button-accent flex items-center gap-2 px-4 py-2"
          >
            <Plus size={20} />
            Check In
          </button>
        </div>

        <div className="glass">
          {attendance.length === 0 ? (
            <div className="p-8 text-center text-foreground/70">No attendance records found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Staff Member</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check In</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Check Out</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Duration</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const checkInTime = new Date(record.check_in)
                  const checkOutTime = record.check_out ? new Date(record.check_out) : null
                  const duration = checkOutTime
                    ? Math.round((checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60))
                    : null

                  return (
                    <tr key={record.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 text-sm font-medium">{record.staff_name}</td>
                      <td className="px-6 py-3 text-sm">{record.date}</td>
                      <td className="px-6 py-3 text-sm">{checkInTime.toLocaleTimeString()}</td>
                      <td className="px-6 py-3 text-sm">
                        {checkOutTime ? checkOutTime.toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        {duration ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '-'}
                      </td>
                      <td className="px-6 py-3 text-sm flex gap-2">
                        {!record.check_out && (
                          <button
                            onClick={() => handleCheckOut(record)}
                            className="text-green-600 hover:text-green-300"
                            title="Check Out"
                          >
                            <LogOut size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenModal(record)}
                          className="text-blue-600 hover:text-blue-300"
                        >
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass rounded-lg shadow-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Attendance' : 'Check In Staff'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Staff Member *</label>
                <select
                  value={formData.staff_id}
                  onChange={(e) => {
                    const selected = staff.find((s) => s.id === e.target.value)
                    setFormData({
                      ...formData,
                      staff_id: e.target.value,
                      staff_name: selected ? `${selected.first_name} ${selected.last_name}` : '',
                    })
                  }}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Staff</option>
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Check In Time *</label>
                <input
                  type="datetime-local"
                  value={formData.check_in}
                  onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Check Out Time</label>
                <input
                  type="datetime-local"
                  value={formData.check_out}
                  onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white py-2 rounded-lg font-semibold hover:from-blue-500/40 hover:to-purple-500/40"
                >
                  {editingId ? 'Update' : 'Check In'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-foreground/80 py-2 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sidebar>
  )
}

export default function AttendancePage() {
  return (
    <ProtectedRoute>
      <AttendanceContent />
    </ProtectedRoute>
  )
}
