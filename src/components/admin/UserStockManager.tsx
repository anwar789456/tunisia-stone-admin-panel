'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { StockMarbre } from '@/lib/types'
import { Plus, Edit2, Trash2, Save, X, Loader2, Package, LayoutGrid, Table2, Upload, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ViewMode = 'table' | 'grid'

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
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [uploadedImages, setUploadedImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setUploadedImages(prev => [...prev, ...files])
    }
  }

  // Remove uploaded image
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  // Remove existing image
  const removeExistingImage = (imagePath: string) => {
    setExistingImages(prev => prev.filter(img => img !== imagePath))
  }

  // Upload images to Supabase storage
  const uploadImages = async (): Promise<string[]> => {
    if (uploadedImages.length === 0) return []
    
    setUploading(true)
    const supabase = createClient()
    const uploadedPaths: string[] = []

    try {
      for (const file of uploadedImages) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('stock_marbre_images')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        uploadedPaths.push(fileName)
      }
    } catch (err) {
      console.error('Error uploading images:', err)
      throw err
    } finally {
      setUploading(false)
    }

    return uploadedPaths
  }

  // Get image URL
  const getImageUrl = (imagePath: string) => {
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/stock_marbre_images/${imagePath}`
  }

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
      // Upload images first
      const newImagePaths = await uploadImages()
      const allImages = [...existingImages, ...newImagePaths]

      const response = await fetch('/api/admin/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...formData,
          images: allImages.length > 0 ? allImages : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create stock item')
      }

      setSuccess('Article ajouté avec succès!')
      setFormData(emptyForm)
      setUploadedImages([])
      setExistingImages([])
      setIsAdding(false)
      await fetchStock()
      router.refresh()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create stock item')
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
      // Upload new images
      const newImagePaths = await uploadImages()
      const allImages = [...existingImages, ...newImagePaths]

      const response = await fetch(`/api/admin/stock/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: allImages.length > 0 ? allImages : null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update stock item')
      }

      setSuccess('Article mis à jour avec succès!')
      setEditingId(null)
      setFormData(emptyForm)
      setUploadedImages([])
      setExistingImages([])
      await fetchStock()
      router.refresh()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update stock item')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stock item')
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
    setExistingImages(item.images || [])
    setUploadedImages([])
    setIsAdding(false)
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData(emptyForm)
    setUploadedImages([])
    setExistingImages([])
    setError('')
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Gestion du Stock</h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Layout Toggle */}
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 className="w-4 h-4" />
              <span className="text-sm font-medium">Tableau</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Grille</span>
            </button>
          </div>
          
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

      {/* Add/Edit Form Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={cancelEdit}
          />
          
          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 sm:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-slate-900">
                  {isAdding ? 'Nouvel Article' : 'Modifier l\'Article'}
                </h4>
                <button
                  onClick={cancelEdit}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom du Produit *
                  </label>
                  <input
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-base min-h-[44px]"
                    placeholder="Ex: Marbre Blanc Carrara"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Type de Marbre *
                  </label>
                  <input
                    type="text"
                    value={formData.type_marbre}
                    onChange={(e) => setFormData({ ...formData, type_marbre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-base min-h-[44px]"
                    placeholder="Ex: Carrara, Calacatta"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-base min-h-[44px]"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Longueur (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.longueur}
                    onChange={(e) => setFormData({ ...formData, longueur: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-base min-h-[44px]"
                    min="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Largeur (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.largeur}
                    onChange={(e) => setFormData({ ...formData, largeur: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-base min-h-[44px]"
                    min="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Épaisseur (cm) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.epaisseur}
                    onChange={(e) => setFormData({ ...formData, epaisseur: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-base min-h-[44px]"
                    min="0.01"
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Images
                  </label>
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-600 mb-2">Images existantes:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingImages.map((imagePath, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200">
                              <Image
                                src={getImageUrl(imagePath)}
                                alt={`Image ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeExistingImage(imagePath)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Images Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-600 mb-2">Nouvelles images:</p>
                      <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((file, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-blue-200">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`New ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeUploadedImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Button */}
                  <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition cursor-pointer">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-600">Ajouter des images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={cancelEdit}
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg transition min-h-[44px] touch-manipulation"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
                <button
                  onClick={() => isAdding ? handleCreate() : handleUpdate(editingId!)}
                  disabled={loading}
                  className="inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 min-h-[44px] touch-manipulation"
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
          </div>
        </div>
      )}

      {/* Stock List */}
      {stock.length > 0 ? (
        viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Dimensions (L×l×É)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {stock.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.images && item.images.length > 0 ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3 bg-slate-100">
                            <Image
                              src={getImageUrl(item.images[0])}
                              alt={item.product_name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                            <Package className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <div className="text-sm font-medium text-slate-900">{item.product_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{item.type_marbre}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {item.longueur} × {item.largeur} × {item.epaisseur} cm
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!isAdding && !editingId && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {stock.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Image */}
                {item.images && item.images.length > 0 ? (
                  <div className="relative w-full h-48 bg-slate-100">
                    <Image
                      src={getImageUrl(item.images[0])}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center">
                    <Package className="w-16 h-16 text-slate-300" />
                  </div>
                )}

                {/* Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="mb-3">
                    <h4 className="text-base font-semibold text-slate-900 line-clamp-2">
                      {item.product_name}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">{item.type_marbre}</p>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Quantité</span>
                      <span className="font-semibold text-slate-900">{item.quantity}</span>
                    </div>
                    <div className="border-t border-slate-100 pt-2">
                      <div className="text-sm text-slate-600 mb-1">Dimensions (cm)</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-slate-500">Longueur</div>
                          <div className="font-semibold text-slate-900">{item.longueur}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Largeur</div>
                          <div className="font-semibold text-slate-900">{item.largeur}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Épaisseur</div>
                          <div className="font-semibold text-slate-900">{item.epaisseur}</div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500 pt-2">
                      Créé le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                {!isAdding && !editingId && (
                  <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={loading}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
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
