'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Sidebar } from '../../components/sidebar'
import { ProtectedRoute } from '../../components/protected-route'
import { useData } from '../../lib/data-context'

function PatientDetailContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getPatient, prescriptions, addPrescription, deletePrescription, appointments } = useData()
  const patient = getPatient(params.id)
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [prescriptionData, setPrescriptionData] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  })

  const patientPrescriptions = prescriptions.filter((p) => p.patient_id === params.id)
  const patientAppointments = appointments.filter(
    (a) => a.patient_email === patient?.email || a.id === params.id
  )

  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault()
    if (prescriptionData.medication && prescriptionData.dosage) {
      addPrescription({
        patient_id: params.id,
        medication: prescriptionData.medication,
        dosage: prescriptionData.dosage,
        frequency: prescriptionData.frequency,
        duration: prescriptionData.duration,
        notes: prescriptionData.notes,
      })
      setPrescriptionData({
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
      })
      setShowPrescriptionForm(false)
    }
  }

  if (!patient) {
    return (
      <Sidebar>
        <div className="text-center py-12">
          <p className="text-foreground/70 text-lg">Patient not found</p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-300 font-semibold"
          >
            Go Back
          </button>
        </div>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-foreground/80" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {patient.first_name} {patient.last_name}
              </h1>
              <p className="text-foreground/70">Patient #{patient.patient_number}</p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="glass rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Basic Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-foreground/70">Email</p>
                <p className="font-semibold text-foreground">{patient.email || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Phone</p>
                <p className="font-semibold text-foreground">{patient.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Date of Birth</p>
                <p className="font-semibold text-foreground">{patient.date_of_birth || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Blood Group</p>
                <p className="font-semibold text-foreground">{patient.blood_group || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Address & Medical Info */}
          <div className="glass rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Medical Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-foreground/70">Address</p>
                <p className="font-semibold text-foreground">{patient.address || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/70">Medical History</p>
                <p className="font-semibold text-foreground line-clamp-4">
                  {patient.medical_history || 'No history recorded'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions */}
        <div className="glass rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-foreground">Prescriptions</h2>
            <button
              onClick={() => setShowPrescriptionForm(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white px-3 py-2 rounded-lg hover:from-blue-500/40 hover:to-purple-500/40 font-semibold"
            >
              <Plus size={18} />
              Add Prescription
            </button>
          </div>

          {/* Prescription Form Modal */}
          {showPrescriptionForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="glass rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center p-6 border-b">
                  <h3 className="text-xl font-bold text-foreground">Add Prescription</h3>
                  <button
                    onClick={() => setShowPrescriptionForm(false)}
                    className="text-foreground/60 hover:text-foreground/80"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddPrescription} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Medication *
                    </label>
                    <input
                      type="text"
                      required
                      value={prescriptionData.medication}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, medication: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., Amoxicillin"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      required
                      value={prescriptionData.dosage}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, dosage: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Frequency
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.frequency}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, frequency: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 3 times daily"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={prescriptionData.duration}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, duration: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g., 7 days"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground/80 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={prescriptionData.notes}
                      onChange={(e) =>
                        setPrescriptionData({ ...prescriptionData, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setShowPrescriptionForm(false)}
                      className="px-4 py-2 border border-white/20 rounded-lg text-foreground/80 font-semibold hover:bg-white/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white rounded-lg font-semibold hover:from-blue-500/40 hover:to-purple-500/40"
                    >
                      Add Prescription
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Prescriptions List */}
          {patientPrescriptions.length === 0 ? (
            <p className="text-foreground/60 text-center py-8">No prescriptions yet</p>
          ) : (
            <div className="space-y-3">
              {patientPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{prescription.medication}</h3>
                      <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-foreground/70">
                        <div>
                          <p className="text-xs text-foreground/60">Dosage</p>
                          <p className="font-semibold">{prescription.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60">Frequency</p>
                          <p className="font-semibold">{prescription.frequency || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-foreground/60">Duration</p>
                          <p className="font-semibold">{prescription.duration || 'N/A'}</p>
                        </div>
                      </div>
                      {prescription.notes && (
                        <p className="mt-2 text-sm text-foreground/70">Notes: {prescription.notes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deletePrescription(prescription.id)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments */}
        {patientAppointments.length > 0 && (
          <div className="glass rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Related Appointments</h2>
            <div className="space-y-3">
              {patientAppointments.map((apt) => (
                <div key={apt.id} className="border border-white/10 rounded-lg p-4 hover:bg-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground">{apt.appointment_date} at {apt.appointment_time}</p>
                      <p className="text-sm text-foreground/70 mt-1">{apt.reason}</p>
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                        apt.status === 'PENDING' ? 'bg-gradient-to-br from-yellow-500/20 to-amber-500/10 text-yellow-300' :
                        apt.status === 'CONFIRMED' ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-300' :
                        apt.status === 'COMPLETED' ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/10 text-green-300' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <PatientDetailContent params={params} />
    </ProtectedRoute>
  )
}
