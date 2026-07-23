'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function PrescriptionsContent() {
  const { prescriptions, addPrescription, updatePrescription, deletePrescription, patients } = useData()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE' | 'COMPLETED'>('ALL')
  const [formData, setFormData] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'COMPLETED',
  })

  const filtered =
    filterStatus === 'ALL' ? prescriptions : prescriptions.filter((p) => p.status === filterStatus)

  const handleOpenModal = (prescription?: any) => {
    if (prescription) {
      setEditingId(prescription.id)
      setFormData({
        patient_id: prescription.patient_id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        notes: prescription.notes || '',
        status: prescription.status,
      })
    } else {
      setEditingId(null)
      setFormData({
        patient_id: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
        status: 'ACTIVE',
      })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.patient_id || !formData.medication || !formData.dosage || !formData.frequency || !formData.duration) {
      alert('Please fill all required fields')
      return
    }

    if (editingId) {
      updatePrescription(editingId, {
        patient_id: formData.patient_id,
        medication: formData.medication,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        notes: formData.notes,
        status: formData.status,
      })
    } else {
      addPrescription({
        patient_id: formData.patient_id,
        medication: formData.medication,
        dosage: formData.dosage,
        frequency: formData.frequency,
        duration: formData.duration,
        notes: formData.notes,
        status: formData.status,
      })
    }

    setShowModal(false)
  }

  const handleDelete = (id: string) => {
    deletePrescription(id)
    setDeleteConfirm(null)
  }

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    return patient ? `${patient.first_name} ${patient.last_name}` : `Patient ${patientId}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-300'
      case 'INACTIVE':
        return 'bg-white/5 text-foreground'
      case 'COMPLETED':
        return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-300'
      default:
        return 'bg-white/5 text-foreground'
    }
  }

  return (
    <Sidebar>
      <div className="space-y-2 sm:space-y-3 md:space-y-6">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold glow-text truncate">Prescriptions</h1>
          <button
            onClick={() => handleOpenModal()}
            className="glass-button-accent flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base flex-shrink-0"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">New</span>
          </button>
        </div>

        {/* Filter */}
        <div className="glass p-2 sm:p-3 md:p-4 overflow-x-auto">
          <div className="flex gap-1 sm:gap-2 md:gap-4 min-w-max">
            {['ALL', 'ACTIVE', 'INACTIVE', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as any)}
                className={`px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                  filterStatus === status
                    ? 'glass-button-accent'
                    : 'glass text-foreground/70 hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="glass overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-3 sm:p-4 md:p-8 text-center text-foreground/70 text-xs sm:text-sm">No prescriptions found</div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Patient</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Med</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Dosage</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Freq</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Dur</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prescription) => (
                  <tr key={prescription.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium truncate">{getPatientName(prescription.patient_id)}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm truncate">{prescription.medication}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">{prescription.dosage}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">{prescription.frequency}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">{prescription.duration}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] xs:text-xs font-semibold ${getStatusColor(prescription.status)}`}>
                        {prescription.status}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleOpenModal(prescription)}
                        className="text-blue-600 hover:text-blue-300 p-1"
                      >
                        <Edit2 size={14} className="sm:w-5 sm:h-5" />
                      </button>
                      {deleteConfirm === prescription.id ? (
                        <button
                          onClick={() => handleDelete(prescription.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs px-1"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(prescription.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 size={14} className="sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass rounded-lg shadow-lg p-6 w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Prescription' : 'New Prescription'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Patient *</label>
                <select
                  value={formData.patient_id}
                  onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.first_name} {p.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Medication *</label>
                <input
                  type="text"
                  value={formData.medication}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Paracetamol 500mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Dosage *</label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 500mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Frequency *</label>
                <input
                  type="text"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Duration *</label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., 7 days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Special instructions..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' })
                  }
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white py-2 rounded-lg font-semibold hover:from-blue-500/40 hover:to-purple-500/40"
                >
                  {editingId ? 'Update' : 'Create'} Prescription
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

export default function PrescriptionsPage() {
  return (
    <ProtectedRoute>
      <PrescriptionsContent />
    </ProtectedRoute>
  )
}
