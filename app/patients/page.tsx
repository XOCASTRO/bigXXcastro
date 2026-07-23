'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Trash2, Edit, X } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function PatientsContent() {
  const { patients, addPatient, updatePatient, deletePatient } = useData()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    patient_number: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    blood_group: '',
    address: '',
    medical_history: '',
  })

  const filteredPatients = patients.filter((p) =>
    `${p.first_name} ${p.last_name} ${p.patient_number}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      updatePatient(editingId, formData)
      setEditingId(null)
    } else {
      const nextNumber = `P${String(patients.length + 1).padStart(3, '0')}`
      addPatient({ ...formData, patient_number: nextNumber })
    }
    setFormData({
      patient_number: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      blood_group: '',
      address: '',
      medical_history: '',
    })
    setShowForm(false)
  }

  const handleEdit = (patient: any) => {
    setFormData(patient)
    setEditingId(patient.id)
    setShowForm(true)
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold glow-text">Patients Management</h1>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingId(null)
              setFormData({
                patient_number: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                date_of_birth: '',
                blood_group: '',
                address: '',
                medical_history: '',
              })
            }}
            className="glass-button-accent flex items-center gap-2 px-4 py-2"
          >
            <Plus size={20} />
            Add Patient
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-foreground/40" size={20} />
          <input
            type="text"
            placeholder="Search by name or patient number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2"
          />
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b border-white/10 sticky top-0 glass/5">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingId ? 'Edit Patient' : 'Add New Patient'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-foreground/70 hover:text-foreground"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="glass-input w-full px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="glass-input w-full px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="glass-input w-full px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="glass-input w-full px-3 py-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) =>
                        setFormData({ ...formData, date_of_birth: e.target.value })
                      }
                      className="glass-input w-full px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Blood Group
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) =>
                        setFormData({ ...formData, blood_group: e.target.value })
                      }
                      className="glass-input w-full px-3 py-2"
                    >
                      <option value="">Select...</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="glass-input w-full px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-2">
                    Medical History
                  </label>
                  <textarea
                    value={formData.medical_history}
                    onChange={(e) =>
                      setFormData({ ...formData, medical_history: e.target.value })
                    }
                    rows={3}
                    className="glass-input w-full px-3 py-2"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-foreground/20 rounded-lg text-foreground/80 font-semibold hover:glass/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="glass-button-accent px-4 py-2"
                  >
                    {editingId ? 'Update Patient' : 'Add Patient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Patients Table */}
        <div className="glass overflow-hidden">
          <table className="w-full">
            <thead className="glass/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Patient #</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Phone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Blood Group</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-foreground/50">
                    No patients found
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-white/5 hover:glass/5 transition-colors">
                    <td className="px-6 py-3 text-sm text-foreground font-semibold">
                      {patient.patient_number}
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="text-primary hover:text-blue-300 font-semibold"
                      >
                        {patient.first_name} {patient.last_name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground/80">{patient.email}</td>
                    <td className="px-6 py-3 text-sm text-foreground/80">{patient.phone}</td>
                    <td className="px-6 py-3 text-sm text-foreground/80">{patient.blood_group}</td>
                    <td className="px-6 py-3 text-sm space-x-2 flex">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-primary hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => deletePatient(patient.id)}
                        className="text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Sidebar>
  )
}

export default function PatientsPage() {
  return (
    <ProtectedRoute>
      <PatientsContent />
    </ProtectedRoute>
  )
}
