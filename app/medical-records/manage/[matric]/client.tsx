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

export default function EditMedicalRecordClient({ matric }: { matric: string }) {
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

  const decodedMatric = decodeURIComponent(matric);

  // Fetch record
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(`/api/medical-records/${encodeURIComponent(decodedMatric)}`);
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
  }, [decodedMatric]);

  // Update student info
  const handleStudentUpdate = async () => {
    try {
      const response = await fetch(`/api/medical-records/${encodeURIComponent(decodedMatric)}`, {
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

  // Handle save edit
  const handleSaveEdit = async (type: string, id: number) => {
    try {
      let endpoint = '';
      if (type === 'allergy') endpoint = `/api/allergies/${id}`;
      else if (type === 'treatment') endpoint = `/api/treatments/${id}`;
      else if (type === 'prescription') endpoint = `/api/prescription-history/${id}`;
      else if (type === 'note') endpoint = `/api/doctor-notes/${id}`;
      else if (type === 'visit') endpoint = `/api/clinic-visits/${id}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        setSaveSuccess('Item updated successfully');
        setTimeout(() => setSaveSuccess(''), 3000);
        // Refetch record
        const recordResponse = await fetch(`/api/medical-records/${encodeURIComponent(decodedMatric)}`);
        if (recordResponse.ok) {
          setRecord(await recordResponse.json());
        }
        if (type === 'allergy') setEditingAllergy(null);
        else if (type === 'treatment') setEditingTreatment(null);
        else if (type === 'prescription') setEditingPrescription(null);
        else if (type === 'note') setEditingNote(null);
        else if (type === 'visit') setEditingVisit(null);
      }
    } catch (err) {
      setError('Failed to save item');
      console.error('[v0] Save error:', err);
    }
  };

  // Handle delete
  const handleDelete = async (type: string, id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      let endpoint = '';
      if (type === 'allergy') endpoint = `/api/allergies/${id}`;
      else if (type === 'treatment') endpoint = `/api/treatments/${id}`;
      else if (type === 'prescription') endpoint = `/api/prescription-history/${id}`;
      else if (type === 'note') endpoint = `/api/doctor-notes/${id}`;
      else if (type === 'visit') endpoint = `/api/clinic-visits/${id}`;

      const response = await fetch(endpoint, { method: 'DELETE' });
      if (response.ok) {
        setSaveSuccess('Item deleted successfully');
        setTimeout(() => setSaveSuccess(''), 3000);
        // Refetch record
        const recordResponse = await fetch(`/api/medical-records/${encodeURIComponent(decodedMatric)}`);
        if (recordResponse.ok) {
          setRecord(await recordResponse.json());
        }
      }
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  // Handle add new item
  const handleAddItem = async (type: string) => {
    try {
      let endpoint = '';
      if (type === 'allergy') endpoint = `/api/medical-records/${encodeURIComponent(decodedMatric)}/allergies`;
      else if (type === 'treatment') endpoint = `/api/medical-records/${encodeURIComponent(decodedMatric)}/treatments`;
      else if (type === 'prescription') endpoint = `/api/medical-records/${encodeURIComponent(decodedMatric)}/prescriptions`;
      else if (type === 'note') endpoint = `/api/medical-records/${encodeURIComponent(decodedMatric)}/notes`;
      else if (type === 'visit') endpoint = `/api/medical-records/${encodeURIComponent(decodedMatric)}/visits`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaveSuccess('Item added successfully');
        setFormData({});
        setShowAddForm(null);
        setTimeout(() => setSaveSuccess(''), 3000);
        // Refetch record
        const recordResponse = await fetch(`/api/medical-records/${encodeURIComponent(decodedMatric)}`);
        if (recordResponse.ok) {
          setRecord(await recordResponse.json());
        }
      }
    } catch (err) {
      setError('Failed to add item');
    }
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Sidebar>
    );
  }

  if (!record) {
    return (
      <Sidebar>
        <div className="space-y-4">
          <Link href="/medical-records">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-red-500">{error || 'Record not found'}</p>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Link href="/medical-records">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-2xl md:text-4xl font-bold flex-1">
            Edit Medical Record - {record.student_file.student_name}
          </h1>
        </div>

        {/* Messages */}
        {saveSuccess && (
          <div className="p-4 bg-green-500/10 border border-green-500 rounded text-green-700">
            {saveSuccess}
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
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
          <div className="space-y-4">
            {!editingStudent ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{record.student_file.student_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matric Number</p>
                  <p className="font-semibold">{record.student_file.matric_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Level</p>
                  <p className="font-semibold">{record.student_file.level}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{record.student_file.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{record.student_file.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-semibold">{record.student_file.address}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={editFormData.student_name || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, student_name: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={editFormData.address || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <div className="flex gap-2">
                  <Button onClick={handleStudentUpdate}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingStudent(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {!editingStudent && (
              <Button onClick={() => { setEditingStudent(true); setEditFormData(record.student_file); }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Student Info
              </Button>
            )}
          </div>
        )}

        {/* Allergies Tab */}
        {activeTab === 'allergies' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {record.allergies.map((allergy: any) => (
                <div key={allergy.id} className="p-4 border border-border rounded">
                  {editingAllergy === allergy.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Allergen"
                        value={editFormData.allergen || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, allergen: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <select
                        value={editFormData.severity || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, severity: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      >
                        <option>Low</option>
                        <option>Moderate</option>
                        <option>High</option>
                      </select>
                      <textarea
                        placeholder="Notes"
                        value={editFormData.notes || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit('allergy', allergy.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingAllergy(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{allergy.allergen}</p>
                        <p className="text-sm text-muted-foreground">{allergy.notes}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-orange-500/20 text-orange-700 text-sm rounded">
                          {allergy.severity}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit('allergy', allergy)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('allergy', allergy.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddForm !== 'allergy' && (
              <Button onClick={() => setShowAddForm('allergy')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Allergy
              </Button>
            )}
            {showAddForm === 'allergy' && (
              <div className="p-4 border border-border rounded space-y-3">
                <input
                  type="text"
                  placeholder="Allergen"
                  value={formData.allergen || ''}
                  onChange={(e) => setFormData({ ...formData, allergen: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <select
                  value={formData.severity || ''}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                >
                  <option>Low</option>
                  <option>Moderate</option>
                  <option>High</option>
                </select>
                <textarea
                  placeholder="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('allergy')}>Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Treatments Tab */}
        {activeTab === 'treatments' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {record.treatment_history.map((treatment: any) => (
                <div key={treatment.id} className="p-4 border border-border rounded">
                  {editingTreatment === treatment.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Treatment Type"
                        value={editFormData.treatment_type || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, treatment_type: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <textarea
                        placeholder="Description"
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <input
                        type="date"
                        value={editFormData.start_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, start_date: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit('treatment', treatment.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingTreatment(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{treatment.treatment_type}</p>
                        <p className="text-sm text-muted-foreground">{treatment.description}</p>
                        <p className="text-xs text-muted-foreground">Started: {treatment.start_date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit('treatment', treatment)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('treatment', treatment.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddForm !== 'treatment' && (
              <Button onClick={() => setShowAddForm('treatment')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Treatment
              </Button>
            )}
            {showAddForm === 'treatment' && (
              <div className="p-4 border border-border rounded space-y-3">
                <input
                  type="text"
                  placeholder="Treatment Type"
                  value={formData.treatment_type || ''}
                  onChange={(e) => setFormData({ ...formData, treatment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <input
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('treatment')}>Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Prescriptions Tab */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {record.prescriptions.map((prescription: any) => (
                <div key={prescription.id} className="p-4 border border-border rounded">
                  {editingPrescription === prescription.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Medication"
                        value={editFormData.medication || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, medication: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Dosage"
                        value={editFormData.dosage || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, dosage: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <select
                        value={editFormData.status || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      >
                        <option>Active</option>
                        <option>Completed</option>
                        <option>Discontinued</option>
                      </select>
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit('prescription', prescription.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingPrescription(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{prescription.medication}</p>
                        <p className="text-sm text-muted-foreground">Dosage: {prescription.dosage}</p>
                        <span className="inline-block mt-2 px-2 py-1 bg-blue-500/20 text-blue-700 text-sm rounded">
                          {prescription.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit('prescription', prescription)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('prescription', prescription.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddForm !== 'prescription' && (
              <Button onClick={() => setShowAddForm('prescription')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Prescription
              </Button>
            )}
            {showAddForm === 'prescription' && (
              <div className="p-4 border border-border rounded space-y-3">
                <input
                  type="text"
                  placeholder="Medication"
                  value={formData.medication || ''}
                  onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <input
                  type="text"
                  placeholder="Dosage"
                  value={formData.dosage || ''}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                >
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Discontinued</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('prescription')}>Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {record.doctor_notes.map((note: any) => (
                <div key={note.id} className="p-4 border border-border rounded">
                  {editingNote === note.id ? (
                    <div className="space-y-3">
                      <textarea
                        placeholder="Note"
                        value={editFormData.note || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, note: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit('note', note.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingNote(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm">{note.note}</p>
                        <p className="text-xs text-muted-foreground mt-2">{note.created_at}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit('note', note)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('note', note.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddForm !== 'note' && (
              <Button onClick={() => setShowAddForm('note')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            )}
            {showAddForm === 'note' && (
              <div className="p-4 border border-border rounded space-y-3">
                <textarea
                  placeholder="Note"
                  value={formData.note || ''}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('note')}>Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {record.clinic_visits.map((visit: any) => (
                <div key={visit.id} className="p-4 border border-border rounded">
                  {editingVisit === visit.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Visit Type"
                        value={editFormData.visit_type || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, visit_type: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <input
                        type="date"
                        value={editFormData.visit_date || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, visit_date: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <textarea
                        placeholder="Reason"
                        value={editFormData.reason || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded"
                      />
                      <div className="flex gap-2">
                        <Button onClick={() => handleSaveEdit('visit', visit.id)}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingVisit(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{visit.visit_type}</p>
                        <p className="text-sm text-muted-foreground">{visit.reason}</p>
                        <p className="text-xs text-muted-foreground">Date: {visit.visit_date}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleStartEdit('visit', visit)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete('visit', visit.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {showAddForm !== 'visit' && (
              <Button onClick={() => setShowAddForm('visit')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Visit
              </Button>
            )}
            {showAddForm === 'visit' && (
              <div className="p-4 border border-border rounded space-y-3">
                <input
                  type="text"
                  placeholder="Visit Type"
                  value={formData.visit_type || ''}
                  onChange={(e) => setFormData({ ...formData, visit_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <input
                  type="date"
                  value={formData.visit_date || ''}
                  onChange={(e) => setFormData({ ...formData, visit_date: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <textarea
                  placeholder="Reason"
                  value={formData.reason || ''}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded"
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleAddItem('visit')}>Save</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
