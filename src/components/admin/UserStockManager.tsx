'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { StockMarbre } from '@/lib/types'
import { Plus, Edit2, Trash2, Save, X, Loader2, Package } from 'lucide-react'

interface UserStockManagerProps {
  userId: string
  initialStock?: StockMarbre[]
}

export default function UserStockManager({ userId, initialStock = [] }: UserStockManagerProps) {
  const router = useRouter()
  const [stock, setStock] = useState<StockMarbre[]>(initialStock)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const emptyForm = {
    product_name: '',
    type_marbre: '',
    quantity: 1,
    longueur: 0,
    largeur: 0,
    epaisseur: 0,
  }
  
  const [formData, setFormData] = useState(emptyForm)

  // Fetch stock items
  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/admin/stock?user_id=${userId}`)
      const result = await response.json()
      
      if (response.ok) {
        setStock(result.data || [])
      }
    } catch (err) {
      console.error('Error fetching stock:', err)
    }
  }

  // Fetch stock on component mount
  useEffect(() => {
    fetchStock()
  }, [userId])

  // Create new stock item
  const handleCreate = async () => {
    if (!formData.product_name.trim()) {
      setError('Le nom du produit est requis')
      return
    }
    if (!formData.type_marbre.trim()) {
      setError('Le type de marbre est requis')
      return
    }
    if (formData.quantity <= 0) {
      setError('La quantité doit être supérieure à 0')
      return
    }
    if (formData.longueur <= 0 || formData.largeur <= 0 || formData.epaisseur <= 0) {
      setError('Les dimensions doivent être supérieures à 0')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create stock item')
      }

      setSuccess('Article ajouté avec succès!')
      setFormData(emptyForm)
      setIsAdding(false)
      await fetchStock()
      router.refresh()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to create stock item')
    } finally {
      setLoading(false)
    }
  }

  // Update stock item
  const handleUpdate = async (id: string) => {
    if (!formData.product_name.trim()) {
      setError('Le nom du produit est requis')
      return
    }
    if (!formData.type_marbre.trim()) {
      setError('Le type de marbre est requis')
      return
    }
    if (formData.quantity <= 0) {
      setError('La quantité doit être supérieure à 0')
      return
    }
    if (formData.longueur <= 0 || formData.largeur <= 0 || formData.epaisseur <= 0) {
      setError('Les dimensions doivent être supérieures à 0')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/stock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update stock item')
      }

      setSuccess('Article mis à jour avec succès!')
      setEditingId(null)
      setFormData(emptyForm)
      await fetchStock()
      router.refresh()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update stock item')
    } finally {
      setLoading(false)
    }
  }

  // Delete stock item
  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article?')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/admin/stock/${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete stock item')
      }

      setSuccess('Article supprimé avec succès!')
      await fetchStock()
      router.refresh()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to delete stock item')
    } finally {
      setLoading(false)
    }
  }

  // Start editing
  const startEdit = (item: StockMarbre) => {
    setEditingId(item.id)
    setFormData({
      product_name: item.product_name,
      type_marbre: item.type_marbre,
      quantity: item.quantity,
      longueur: item.longueur,
      largeur: item.largeur,
      epaisseur: item.epaisseur,
    })
    setIsAdding(false)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData(emptyForm)
    setError('')
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Gestion du Stock</h3>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition min-h-[44px] touch-manipulation"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </button>
        )}
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm mb-4">
          {success}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-slate-900 mb-4">
            {isAdding ? 'Nouvel Article' : 'Modifier l\'Article'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Nom du Produit *
              </label>
              <input
                type="text"
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
                placeholder="Ex: Marbre Blanc Carrara"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Type de Marbre *
              </label>
              <input
                type="text"
                value={formData.type_marbre}
                onChange={(e) => setFormData({ ...formData, type_marbre: e.target.value })}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
                placeholder="Ex: Carrara, Calacatta"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Quantité *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Longueur (cm) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.longueur}
                onChange={(e) => setFormData({ ...formData, longueur: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
                min="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Largeur (cm) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.largeur}
                onChange={(e) => setFormData({ ...formData, largeur: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
                min="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
                Épaisseur (cm) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.epaisseur}
                onChange={(e) => setFormData({ ...formData, epaisseur: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 sm:px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
                min="0.01"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={cancelEdit}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition min-h-[44px] touch-manipulation"
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </button>
            <button
              onClick={() => isAdding ? handleCreate() : handleUpdate(editingId!)}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 min-h-[44px] touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stock List */}
      {stock.length > 0 ? (
        <div className="space-y-3">
          {stock.map((item) => (
            <div
              key={item.id}
              className="p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-base">{item.product_name}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Type:</span> {item.type_marbre}
                    </div>
                    <div>
                      <span className="font-medium">Quantité:</span> {item.quantity}
                    </div>
                    <div>
                      <span className="font-medium">L:</span> {item.longueur}cm
                    </div>
                    <div>
                      <span className="font-medium">l:</span> {item.largeur}cm
                    </div>
                    <div>
                      <span className="font-medium">É:</span> {item.epaisseur}cm
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                
                {!isAdding && !editingId && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition min-h-[44px] min-w-[44px] touch-manipulation"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 min-h-[44px] min-w-[44px] touch-manipulation"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isAdding && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Aucun article en stock</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition min-h-[44px] touch-manipulation"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter le premier article
            </button>
          </div>
        )
      )}
    </div>
  )
}
