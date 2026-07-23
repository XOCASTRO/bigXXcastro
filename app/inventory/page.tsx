'use client'

import { useState } from 'react'
import { Plus, AlertTriangle, Edit2, Trash2 } from 'lucide-react'
import { Sidebar } from '../components/sidebar'
import { ProtectedRoute } from '../components/protected-route'
import { useData } from '../lib/data-context'

function InventoryContent() {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData()
  const [itemType, setItemType] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'MEDICINE' as 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY',
    quantity: '',
    unit: '',
    min_stock: '',
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const filtered =
    itemType === 'ALL' ? inventory : inventory.filter((item) => item.category === itemType)

  const handleOpenModal = (item?: any) => {
    if (item) {
      setEditingId(item.id)
      setFormData({
        name: item.name,
        category: item.category,
        quantity: String(item.quantity),
        unit: item.unit,
        min_stock: String(item.min_stock),
      })
    } else {
      setEditingId(null)
      setFormData({ name: '', category: 'MEDICINE', quantity: '', unit: '', min_stock: '' })
    }
    setShowModal(true)
  }

  const handleSave = () => {
    if (!formData.name || !formData.quantity || !formData.unit || !formData.min_stock) {
      alert('Please fill all fields')
      return
    }

    if (editingId) {
      updateInventoryItem(editingId, {
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        min_stock: Number(formData.min_stock),
      })
    } else {
      addInventoryItem({
        name: formData.name,
        category: formData.category,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        min_stock: Number(formData.min_stock),
      })
    }

    setShowModal(false)
    setFormData({ name: '', category: 'MEDICINE', quantity: '', unit: '', min_stock: '' })
  }

  const handleDelete = (id: string) => {
    deleteInventoryItem(id)
    setDeleteConfirm(null)
  }

  return (
    <Sidebar>
      <div className="space-y-2 sm:space-y-3 md:space-y-6">
        <div className="flex items-center justify-between gap-2 md:gap-4">
          <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold glow-text truncate">Inventory</h1>
          <button
            onClick={() => handleOpenModal()}
            className="glass-button-accent flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base flex-shrink-0"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Add Item</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        <div className="glass overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-3 sm:p-4 md:p-8 text-center text-foreground/70 text-xs sm:text-sm">No inventory items found</div>
          ) : (
            <table className="w-full min-w-max">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Item Name</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Category</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Qty</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Min</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Status</th>
                  <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] xs:text-xs sm:text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm font-medium">{item.name}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      <span className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 text-blue-300 rounded text-[10px] xs:text-xs font-semibold">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">{item.quantity}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">{item.unit}</td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                      {item.quantity <= item.min_stock ? (
                        <div className="flex items-center gap-0.5 sm:gap-1 text-red-600 text-xs sm:text-sm">
                          <AlertTriangle size={14} className="sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Low Stock</span>
                          <span className="sm:hidden">Low</span>
                        </div>
                      ) : (
                        <span className="text-green-600 text-xs sm:text-sm">OK</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="text-blue-600 hover:text-blue-300 p-1"
                      >
                        <Edit2 size={14} className="sm:w-5 sm:h-5" />
                      </button>
                      {deleteConfirm === item.id ? (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-xs px-1"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
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
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as 'MEDICINE' | 'EQUIPMENT' | 'SUPPLY',
                    })
                  }
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="MEDICINE">Medicine</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="SUPPLY">Supply</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Unit *</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., tablets, boxes, units"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Min Stock *</label>
                <input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  className="w-full px-3 py-2 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white py-2 rounded-lg font-semibold hover:from-blue-500/40 hover:to-purple-500/40"
                >
                  {editingId ? 'Update' : 'Add'} Item
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

export default function InventoryPage() {
  return (
    <ProtectedRoute>
      <InventoryContent />
    </ProtectedRoute>
  )
}
