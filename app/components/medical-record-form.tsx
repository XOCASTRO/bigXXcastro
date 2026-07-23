'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface FormData {
  matric_number: string
  student_name: string
  date_of_birth: string
  level: string
  phone: string
  email: string
  address: string
  parent_contact: string
  emergency_contact: string
}

interface StaffMember {
  staff_id: number
  email: string
  full_name: string
  role: string
  department: string
  can_create_records: boolean
}

interface MedicalRecordFormProps {
  onSuccess?: (matric: string, name: string) => void
  canCreateRecords: boolean
  staffId?: number
  token?: string
}

export default function MedicalRecordForm({ onSuccess, canCreateRecords, staffId, token }: MedicalRecordFormProps) {
  const [formData, setFormData] = useState<FormData>({
    matric_number: '',
    student_name: '',
    date_of_birth: '',
    level: '100',
    phone: '',
    email: '',
    address: '',
    parent_contact: '',
    emergency_contact: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [matricValidation, setMatricValidation] = useState<{ valid: boolean; error?: string } | null>(null)
  const [checkingMatric, setCheckingMatric] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(staffId || null)
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [seedingDb, setSeedingDb] = useState(false)

  // Load available staff members on component mount
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await axios.get('/api/staff/setup')
        if (response.data.success && response.data.staff.length > 0) {
          setStaffMembers(response.data.staff)
          setSelectedStaffId(response.data.staff[0].staff_id)
        } else {
          // No staff, try to seed
          await seedStaff()
        }
      } catch (error) {
        console.error('[v0] Error loading staff:', error)
      } finally {
        setLoadingStaff(false)
      }
    }

    loadStaff()
  }, [])

  // Seed database with default staff
  const seedStaff = async () => {
    setSeedingDb(true)
    try {
      console.log('[v0] Seeding staff members...')
      const response = await axios.post('/api/staff/setup')
      if (response.data.success) {
        setStaffMembers(response.data.staff)
        setSelectedStaffId(response.data.staff[0]?.staff_id || null)
        console.log('[v0] Staff seeded successfully')
      }
    } catch (error) {
      console.error('[v0] Error seeding staff:', error)
    } finally {
      setSeedingDb(false)
    }
  }

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate matric number on blur
  const handleMatricBlur = async () => {
    if (!formData.matric_number.trim()) {
      setMatricValidation(null)
      return
    }

    setCheckingMatric(true)
    try {
      const response = await axios.get('/api/medical-records/create', {
        params: { matric_number: formData.matric_number },
      })
      setMatricValidation(response.data)
    } catch (error) {
      setMatricValidation({ valid: false, error: 'Error validating matric number' })
    } finally {
      setCheckingMatric(false)
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.matric_number.trim()) {
      newErrors.matric_number = 'Matric number is required'
    } else if (!matricValidation?.valid) {
      newErrors.matric_number = matricValidation?.error || 'Invalid matric number'
    }

    if (!formData.student_name.trim()) {
      newErrors.student_name = 'Student name is required'
    }

    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required'
    } else {
      const dob = new Date(formData.date_of_birth)
      if (dob > new Date()) {
        newErrors.date_of_birth = 'Date of birth cannot be in the future'
      }
    }

    if (!formData.level) {
      newErrors.level = 'Level is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedStaffId) {
      setErrors({ submit: 'Please select a staff member' })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        '/api/medical-records/create',
        formData,
        {
          headers: {
            'x-staff-id': String(selectedStaffId),
            'x-can-create-records': 'true',
            'Authorization': token ? `Bearer ${token}` : undefined,
          },
        }
      )

      setSuccess(true)
      setSuccessMessage(
        `Medical record created successfully! Matric: ${response.data.matric_number}`
      )

      // Reset form
      setFormData({
        matric_number: '',
        student_name: '',
        date_of_birth: '',
        level: '100',
        phone: '',
        email: '',
        address: '',
        parent_contact: '',
        emergency_contact: '',
      })
      setMatricValidation(null)

      // Call callback
      if (onSuccess) {
        onSuccess(response.data.matric_number, response.data.student_name)
      }

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (error: any) {
      console.error('[v0] Form submission error:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create medical record'
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  if (!canCreateRecords) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-amber-800">You do not have permission to create medical records.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl glass p-6 rounded-lg border border-white/10">
      <h2 className="text-2xl font-bold text-foreground">Create Medical Record</h2>

      {loadingStaff && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Loading staff members...</p>
        </div>
      )}

      {seedingDb && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">Setting up database with default staff...</p>
        </div>
      )}

      {staffMembers.length === 0 && !loadingStaff && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-amber-800">No staff members found. Please contact administrator.</p>
        </div>
      )}

      {staffMembers.length > 0 && (
        <div>
          <label htmlFor="staff_id" className="block text-sm font-medium text-foreground/80 mb-1">
            Creating Staff Member *
          </label>
          <select
            id="staff_id"
            value={selectedStaffId || ''}
            onChange={(e) => setSelectedStaffId(Number(e.target.value))}
            className="w-full px-3 py-2 border border-white/20 rounded-md"
          >
            <option value="">Select a staff member</option>
            {staffMembers.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name} - {staff.role} ({staff.department})
              </option>
            ))}
          </select>
          {errors.submit && errors.submit.includes('staff') && (
            <p className="text-sm text-red-600 mt-1">{errors.submit}</p>
          )}
        </div>
      )}

      {success && (
        <div className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-200 rounded-lg">
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}

      {errors.submit && (
        <div className="p-4 bg-gradient-to-br from-red-500/10 to-pink-500/5 border border-red-200 rounded-lg">
          <p className="text-red-800">{errors.submit}</p>
        </div>
      )}

      {/* Matric Number */}
      <div>
        <label htmlFor="matric_number" className="block text-sm font-medium text-foreground/80 mb-1">
          Matric Number *
        </label>
        <input
          id="matric_number"
          type="text"
          name="matric_number"
          value={formData.matric_number}
          onChange={handleChange}
          onBlur={handleMatricBlur}
          placeholder="m.24/nd/001234"
          className={`w-full px-3 py-2 border rounded-md ${
            errors.matric_number ? 'border-red-500' : matricValidation?.valid ? 'border-green-500' : 'border-white/20'
          }`}
        />
        {checkingMatric && <p className="text-sm text-foreground/60 mt-1">Checking...</p>}
        {matricValidation?.valid && <p className="text-sm text-green-600 mt-1">✓ Matric number is available</p>}
        {matricValidation?.error && <p className="text-sm text-red-600 mt-1">{matricValidation.error}</p>}
        {errors.matric_number && <p className="text-sm text-red-600 mt-1">{errors.matric_number}</p>}
      </div>

      {/* Student Name */}
      <div>
        <label htmlFor="student_name" className="block text-sm font-medium text-foreground/80 mb-1">
          Student Name *
        </label>
        <input
          id="student_name"
          type="text"
          name="student_name"
          value={formData.student_name}
          onChange={handleChange}
          placeholder="Full name"
          className={`w-full px-3 py-2 border rounded-md ${errors.student_name ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.student_name && <p className="text-sm text-red-600 mt-1">{errors.student_name}</p>}
      </div>

      {/* Date of Birth */}
      <div>
        <label htmlFor="date_of_birth" className="block text-sm font-medium text-foreground/80 mb-1">
          Date of Birth *
        </label>
        <input
          id="date_of_birth"
          type="date"
          name="date_of_birth"
          value={formData.date_of_birth}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${errors.date_of_birth ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.date_of_birth && <p className="text-sm text-red-600 mt-1">{errors.date_of_birth}</p>}
      </div>

      {/* Level */}
      <div>
        <label htmlFor="level" className="block text-sm font-medium text-foreground/80 mb-1">
          Level *
        </label>
        <select
          id="level"
          name="level"
          value={formData.level}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${errors.level ? 'border-red-500' : 'border-white/20'}`}
        >
          <option value="100">100 Level</option>
          <option value="200">200 Level</option>
          <option value="300">300 Level</option>
          <option value="400">400 Level</option>
          <option value="500">500 Level</option>
        </select>
        {errors.level && <p className="text-sm text-red-600 mt-1">{errors.level}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-foreground/80 mb-1">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="08012345678"
          className="w-full px-3 py-2 border border-white/20 rounded-md"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="student@university.edu"
          className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-white/20'}`}
        />
        {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-foreground/80 mb-1">
          Address
        </label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Physical address"
          className="w-full px-3 py-2 border border-white/20 rounded-md"
          rows={2}
        />
      </div>

      {/* Parent Contact */}
      <div>
        <label htmlFor="parent_contact" className="block text-sm font-medium text-foreground/80 mb-1">
          Parent/Guardian Contact
        </label>
        <input
          id="parent_contact"
          type="tel"
          name="parent_contact"
          value={formData.parent_contact}
          onChange={handleChange}
          placeholder="08098765432"
          className="w-full px-3 py-2 border border-white/20 rounded-md"
        />
      </div>

      {/* Emergency Contact */}
      <div>
        <label htmlFor="emergency_contact" className="block text-sm font-medium text-foreground/80 mb-1">
          Emergency Contact
        </label>
        <input
          id="emergency_contact"
          type="tel"
          name="emergency_contact"
          value={formData.emergency_contact}
          onChange={handleChange}
          placeholder="08011223344"
          className="w-full px-3 py-2 border border-white/20 rounded-md"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition"
      >
        {loading ? 'Creating...' : 'Create Medical Record'}
      </button>
    </form>
  )
}
