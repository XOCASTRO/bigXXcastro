'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '../../../components/sidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2, Plus, Edit2, X } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';

interface StudentFile {
  matric_number: string;
  student_name: string;
  level: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  parent_contact: string;
  emergency_contact: string;
}

interface MedicalRecord {
  student_file: StudentFile;
  allergies: any[];
  treatment_history: any[];
  prescriptions: any[];
  doctor_notes: any[];
  clinic_visits: any[];
}

export default function EditMedicalRecordPage({ params }: { params: { matric: string } }) {
  const { user } = useAuth();
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [editingStudent, setEditingStudent] = useState(false);
  const [editingAllergy, setEditingAllergy] = useState<number | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<number | null>(null);
  const [editingPrescription, setEditingPrescription] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [editingVisit, setEditingVisit] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [editFormData, setEditFormData] = useState<any>({});

  const matric = decodeURIComponent(params.matric);

  // Fetch record
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/medical-records/${encodeURIComponent(matric)}`);
        if (response.ok) {
          const data = await response.json();
          setRecord(data);
        } else {
          setError('Failed to load medical record');
        }
      } catch (err) {
        setError('Error loading medical record');
        console.error('[v0] Error fetching record:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [matric]);

  // Update student info
  const handleStudentUpdate = async () => {
    try {
      const response = await fetch(`/api/medical-records/${encodeURIComponent(matric)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updated = await response.json();
        setRecord(prev => prev ? { ...prev, student_file: updated } : null);
        setEditingStudent(false);
        setSaveSuccess('Student information updated successfully');
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update student information');
      console.error('[v0] Update error:', err);
    }
  };

  // Handle edit item
  const handleStartEdit = (type: string, item: any) => {
    setEditFormData(item);
    if (type === 'allergy') setEditingAllergy(item.id);
    else if (type === 'treatment') setEditingTreatment(item.id);
    else if (type === 'prescription') setEditingPrescription(item.id);
    else if (type === 'note') setEditingNote(item.id);
    else if (type === 'visit') setEditingVisit(item.id);
  };

  // Save edited item
  const handleSaveItem = async (type: string, id: number) => {
    try {
      const endpoint = type === 'allergy' ? `/api/allergies/${id}`
        : type === 'treatment' ? `/api/treatments/${id}`
        : type === 'prescription' ? `/api/prescription-history/${id}`
        : type === 'note' ? `/api/doctor-notes/${id}`
        : `/api/clinic-visits/${id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        // Refetch the record
        const recordResponse = await fetch(`/api/medical-records/${encodeURIComponent(matric)}`);
        if (recordResponse.ok) {
          setRecord(await recordResponse.json());
        }
        setSaveSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} updated successfully`);
        setTimeout(() => setSaveSuccess(''), 3000);
        setEditingAllergy(null);
        setEditingTreatment(null);
        setEditingPrescription(null);
        setEditingNote(null);
        setEditingVisit(null);
      }
    } catch (err) {
      setError(`Failed to update ${type}`);
      console.error('[v0] Save error:', err);
    }
  };

  // Delete item
  const handleDeleteItem = async (type: string, id: number) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const endpoint = type === 'allergy' ? `/api/allergies/${id}`
        : type === 'treatment' ? `/api/treatments/${id}`
        : type === 'prescription' ? `/api/prescription-history/${id}`
        : type === 'note' ? `/api/doctor-notes/${id}`
        : `/api/clinic-visits/${id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        const recordResponse = await fetch(`/api/medical-records/${encodeURIComponent(matric)}`);
        if (recordResponse.ok) {
          setRecord(await recordResponse.json());
        }
        setSaveSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        setTimeout(() => setSaveSuccess(''), 3000);
      }
    } catch (err) {
      setError(`Failed to delete ${type}`);
      console.error('[v0] Delete error:', err);
    }
  };

  // Add new item
  const handleAddItem = async (type: string) => {
    try {
      const endpoint = type === 'allergy' ? `/api/medical-records/${encodeURIComponent(matric)}/allergies`
        : type === 'treatment' ? `/api/medical-records/${encodeURIComponent(matric)}/treatments`
        : type === 'prescription' ? `/api/medical-records/${encodeURIComponent(matric)}/prescriptions`
        : type === 'note' ? `/api/medical-records/${encodeURIComponent(matric)}/notes`
        : `/api/medical-records/${encodeURIComponent(matric)}/visits`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const recordResponse = await fetch(`/api/medical-records/${encodeURIComponent(matric)}`);
        if (recordResponse.ok) {
          setRecord(await recordResponse.json());
        }
        setSaveSuccess(`New ${type} added successfully`);
        setTimeout(() => setSaveSuccess(''), 3000);
        setFormData({});
        setShowAddForm(null);
      }
    } catch (err) {
      setError(`Failed to add ${type}`);
      console.error('[v0] Add error:', err);
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg">Loading medical record...</p>
        </div>
      </Sidebar>
    );
  }

  if (!record) {
    return (
      <Sidebar>
        <div className="space-y-4">
          <Link href="/medical-records">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Records
            </Button>
          </Link>
          <div className="text-red-600">{error || 'Record not found'}</div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <Link href="/medical-records">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{record.student_file.student_name}</h1>
              <p className="text-muted-foreground">Matric: {record.student_file.matric_number}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="p-4 bg-red-500/10 border border-red-200 rounded-lg text-red-600">{error}</div>}
        {saveSuccess && <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg text-green-600">{saveSuccess}</div>}

        {/* Tabs */}
        <div className="border-b border-border flex gap-2 overflow-x-auto">
          {['overview', 'allergies', 'treatments', 'prescriptions', 'notes', 'visits'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-card rounded-lg border border-border p-6">
            {editingStudent ? (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Edit Student Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(editFormData).map(([key, value]) => (
                    key !== 'matric_number' && (
                      <div key={key}>
                        <label className="block text-sm font-medium mb-1 capitalize">{key.replace(/_/g, ' ')}</label>
                        <input
                          type={key.includes('date') ? 'date' : key.includes('level') ? 'number' : 'text'}
                          value={value as string}
                          onChange={(e) => setEditFormData({ ...editFormData, [key]: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        />
                      </div>
                    )
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleStudentUpdate} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditingStudent(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(record.student_file).map(([key, value]) => (
                    key !== 'matric_number' && (
                      <div key={key}>
                        <p className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                        <p className="font-semibold">{value as string}</p>
                      </div>
                    )
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditFormData(record.student_file);
                    setEditingStudent(true);
                  }}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Information
                </Button>
              </>
            )}
          </div>
        )}

        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Allergies</h2>
              <Button onClick={() => setShowAddForm(showAddForm === 'allergy' ? null : 'allergy')} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Allergy
              </Button>
            </div>

            {showAddForm === 'allergy' && (
              <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Allergen"
                  value={formData.allergen || ''}
                  onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <select
                  value={formData.severity || ''}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="">Select Severity</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
                <textarea
                  placeholder="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('allergy')} size="sm">Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)} size="sm">Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {record.allergies.map((allergy) => (
                <div key={allergy.id} className="bg-card rounded-lg border border-border p-4">
                  {editingAllergy === allergy.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editFormData.allergen || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, allergen: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <select
                        value={editFormData.severity || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, severity: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                      <textarea
                        value={editFormData.notes || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveItem('allergy', allergy.id)} size="sm">Save</Button>
                        <Button variant="outline" onClick={() => setEditingAllergy(null)} size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">{allergy.allergen}</p>
                          <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                        </div>
                        <span className="px-2 py-1 bg-orange-200 text-orange-900 text-xs rounded">{allergy.severity}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartEdit('allergy', allergy)} size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteItem('allergy', allergy.id)} size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Treatments Tab */}
        {activeTab === 'treatments' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Treatments</h2>
              <Button onClick={() => setShowAddForm(showAddForm === 'treatment' ? null : 'treatment')} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Treatment
              </Button>
            </div>

            {showAddForm === 'treatment' && (
              <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                <input
                  type="date"
                  value={formData.visit_date || ''}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Diagnosis"
                  value={formData.diagnosis || ''}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <textarea
                  placeholder="Treatment"
                  value={formData.treatment || ''}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Doctor Name"
                  value={formData.doctor_name || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_required || false}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                  />
                  <span>Follow-up Required</span>
                </label>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('treatment')} size="sm">Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)} size="sm">Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {record.treatment_history.map((treatment) => (
                <div key={treatment.id} className="bg-card rounded-lg border border-border p-4">
                  {editingTreatment === treatment.id ? (
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={editFormData.visit_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, visit_date: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.diagnosis || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, diagnosis: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <textarea
                        value={editFormData.treatment || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, treatment: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={3}
                      />
                      <input
                        type="text"
                        value={editFormData.doctor_name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, doctor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editFormData.follow_up_required || false}
                          onChange={(e) => setEditFormData({ ...editFormData, follow_up_required: e.target.checked })}
                        />
                        <span>Follow-up Required</span>
                      </label>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveItem('treatment', treatment.id)} size="sm">Save</Button>
                        <Button variant="outline" onClick={() => setEditingTreatment(null)} size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <p className="font-semibold">{treatment.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">{treatment.visit_date}</p>
                        <p className="text-sm mt-2">{treatment.treatment}</p>
                        <p className="text-sm mt-1"><strong>Doctor:</strong> {treatment.doctor_name}</p>
                        {treatment.follow_up_required && <span className="px-2 py-1 bg-yellow-200 text-yellow-900 text-xs rounded mt-2 inline-block">Follow-up</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartEdit('treatment', treatment)} size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteItem('treatment', treatment.id)} size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Prescriptions</h2>
              <Button onClick={() => setShowAddForm(showAddForm === 'prescription' ? null : 'prescription')} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Prescription
              </Button>
            </div>

            {showAddForm === 'prescription' && (
              <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                <input
                  type="date"
                  value={formData.prescription_date || ''}
                  onChange={(e) => setFormData({ ...formData, prescription_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Medication"
                  value={formData.medication || ''}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={formData.dosage || ''}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={formData.frequency || ''}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Duration"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Doctor Name"
                  value={formData.doctor_name || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
                <textarea
                  placeholder="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('prescription')} size="sm">Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)} size="sm">Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {record.prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-card rounded-lg border border-border p-4">
                  {editingPrescription === prescription.id ? (
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={editFormData.prescription_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, prescription_date: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.medication || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, medication: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.dosage || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, dosage: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.frequency || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, frequency: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.duration || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.doctor_name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, doctor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <select
                        value={editFormData.status || 'active'}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="completed">Completed</option>
                      </select>
                      <textarea
                        value={editFormData.notes || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveItem('prescription', prescription.id)} size="sm">Save</Button>
                        <Button variant="outline" onClick={() => setEditingPrescription(null)} size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{prescription.medication}</p>
                            <p className="text-sm text-muted-foreground">{prescription.prescription_date}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${prescription.status === 'active' ? 'bg-green-200 text-green-900' : 'bg-gray-200 text-gray-900'}`}>
                            {prescription.status}
                          </span>
                        </div>
                        <p className="text-sm mt-2"><strong>Dosage:</strong> {prescription.dosage}</p>
                        <p className="text-sm"><strong>Frequency:</strong> {prescription.frequency}</p>
                        <p className="text-sm"><strong>Duration:</strong> {prescription.duration}</p>
                        <p className="text-sm"><strong>Doctor:</strong> {prescription.doctor_name}</p>
                        {prescription.notes && <p className="text-sm mt-1"><strong>Notes:</strong> {prescription.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartEdit('prescription', prescription)} size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteItem('prescription', prescription.id)} size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Doctor Notes</h2>
              <Button onClick={() => setShowAddForm(showAddForm === 'note' ? null : 'note')} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </div>

            {showAddForm === 'note' && (
              <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                <input
                  type="date"
                  value={formData.note_date || ''}
                  onChange={(e) => setFormData({ ...formData, note_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Doctor Name"
                  value={formData.doctor_name || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <textarea
                  placeholder="Note Content"
                  value={formData.note_content || ''}
                  onChange={(e) => setFormData({ ...formData, note_content: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={4}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.follow_up_required || false}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                  />
                  <span>Follow-up Required</span>
                </label>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('note')} size="sm">Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)} size="sm">Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {record.doctor_notes.map((note) => (
                <div key={note.id} className="bg-card rounded-lg border border-border p-4">
                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={editFormData.note_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, note_date: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.doctor_name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, doctor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <textarea
                        value={editFormData.note_content || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, note_content: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={4}
                      />
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editFormData.follow_up_required || false}
                          onChange={(e) => setEditFormData({ ...editFormData, follow_up_required: e.target.checked })}
                        />
                        <span>Follow-up Required</span>
                      </label>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveItem('note', note.id)} size="sm">Save</Button>
                        <Button variant="outline" onClick={() => setEditingNote(null)} size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <p className="font-semibold">{note.doctor_name}</p>
                        <p className="text-sm text-muted-foreground">{note.note_date}</p>
                        <p className="text-sm mt-2">{note.note_content}</p>
                        {note.follow_up_required && <span className="px-2 py-1 bg-yellow-200 text-yellow-900 text-xs rounded mt-2 inline-block">Follow-up</span>}
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartEdit('note', note)} size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteItem('note', note.id)} size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Clinic Visits</h2>
              <Button onClick={() => setShowAddForm(showAddForm === 'visit' ? null : 'visit')} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Visit
              </Button>
            </div>

            {showAddForm === 'visit' && (
              <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                <input
                  type="date"
                  value={formData.visit_date || ''}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <input
                  type="text"
                  placeholder="Visit Type"
                  value={formData.visit_type || ''}
                  onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <textarea
                  placeholder="Reason for Visit"
                  value={formData.reason_for_visit || ''}
                  onChange={(e) => setFormData({ ...formData, reason_for_visit: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  rows={3}
                />
                <input
                  type="text"
                  placeholder="Doctor Name"
                  value={formData.doctor_name || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                />
                <select
                  value={formData.status || 'completed'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md"
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('visit')} size="sm">Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)} size="sm">Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {record.clinic_visits.map((visit) => (
                <div key={visit.id} className="bg-card rounded-lg border border-border p-4">
                  {editingVisit === visit.id ? (
                    <div className="space-y-3">
                      <input
                        type="date"
                        value={editFormData.visit_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, visit_date: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <input
                        type="text"
                        value={editFormData.visit_type || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, visit_type: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <textarea
                        value={editFormData.reason_for_visit || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, reason_for_visit: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                        rows={3}
                      />
                      <input
                        type="text"
                        value={editFormData.doctor_name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, doctor_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      />
                      <select
                        value={editFormData.status || 'completed'}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md"
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveItem('visit', visit.id)} size="sm">Save</Button>
                        <Button variant="outline" onClick={() => setEditingVisit(null)} size="sm">Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{visit.visit_type}</p>
                            <p className="text-sm text-muted-foreground">{visit.visit_date}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-200 text-green-900 text-xs rounded">{visit.status}</span>
                        </div>
                        <p className="text-sm mt-2"><strong>Reason:</strong> {visit.reason_for_visit}</p>
                        <p className="text-sm"><strong>Doctor:</strong> {visit.doctor_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleStartEdit('visit', visit)} size="sm" variant="outline">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDeleteItem('visit', visit.id)} size="sm" variant="outline" className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
