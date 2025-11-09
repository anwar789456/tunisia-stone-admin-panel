'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, X, Upload, Trash2 } from 'lucide-react'
import LocationSelect from './LocationSelect'

const CATEGORIES = [
  'Marbre',
  'Granit',
  'Pierre naturelle',
  'Céramique',
  'Équipement',
  'Services',
  'Autre'
]

interface MarketplacePost {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  images: string[] | null
  category: string | null
  status: string
}

interface UserMarketplaceFormProps {
  userId: string
  post?: MarketplacePost
  onSuccess?: () => void
  onCancel?: () => void
}

export default function UserMarketplaceForm({ userId, post, onSuccess, onCancel }: UserMarketplaceFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [formData, setFormData] = useState({
    title: post?.title || '',
    description: post?.description || '',
    price: post?.price?.toString() || '',
    location: post?.location || '',
    category: post?.category || '',
    status: post?.status || 'active',
  })

  const [existingImages, setExistingImages] = useState<string[]>(post?.images || [])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Create previews
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...previews])
    setNewImageFiles(prev => [...prev, ...files])
  }

  const removeNewImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = async (imageUrl: string) => {
    if (!post) return
    
    try {
      const supabase = createClient()
      
      // Remove from storage
      const { error: storageError } = await supabase.storage
        .from('marketplace_images')
        .remove([imageUrl])

      if (storageError) throw storageError

      // Update database
      const updatedImages = existingImages.filter(img => img !== imageUrl)
      const { error: dbError } = await supabase
        .from('marketplace_posts')
        .update({ images: updatedImages })
        .eq('id', post.id)

      if (dbError) throw dbError

      setExistingImages(updatedImages)
    } catch (err) {
      console.error('Error removing image:', err)
      setError('Échec de la suppression de l\'image')
    }
  }

  const uploadImages = async (): Promise<string[]> => {
    if (newImageFiles.length === 0) return []

    const supabase = createClient()
    const uploadedUrls: string[] = []

    for (const file of newImageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('marketplace_images')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      uploadedUrls.push(fileName)
    }

    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Upload new images
      let uploadedImageUrls: string[] = []
      if (newImageFiles.length > 0) {
        setUploadingImages(true)
        uploadedImageUrls = await uploadImages()
        setUploadingImages(false)
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImageUrls]

      const postData = {
        title: formData.title,
        description: formData.description || null,
        price: formData.price ? Number(formData.price) : null,
        location: formData.location || null,
        category: formData.category || null,
        status: formData.status,
        images: allImages.length > 0 ? allImages : null,
      }

      if (post) {
        // Update existing post
        const { error: updateError } = await supabase
          .from('marketplace_posts')
          .update({
            ...postData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        if (updateError) throw updateError
      } else {
        // Create new post
        const { error: insertError } = await supabase
          .from('marketplace_posts')
          .insert({
            ...postData,
            user_id: userId,
          })

        if (insertError) throw insertError
      }

      router.refresh()
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError(err.message || 'Échec de l\'enregistrement de l\'annonce')
      setLoading(false)
      setUploadingImages(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
          Description
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Catégorie
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          >
            <option value="">Sélectionner une catégorie</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Prix (TND)
          </label>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Localisation
          </label>
          <LocationSelect
            value={formData.location}
            onChange={(value) => setFormData({ ...formData, location: value })}
            placeholder="Sélectionner un gouvernorat"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Statut
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Images Section */}
      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
          Images
        </label>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-600 mb-2">Images actuelles:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existingImages.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/marketplace_images/${imageUrl}`}
                    alt={`Image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(imageUrl)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-600 mb-2">Nouvelles images:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 border-2 border-dashed border-slate-300 hover:border-blue-500 text-slate-600 hover:text-blue-600 rounded-lg transition min-h-[44px]"
        >
          <Upload className="w-5 h-5 mr-2" />
          Ajouter des images
        </button>
        <p className="text-xs text-slate-500 mt-2">
          Formats acceptés: JPG, PNG, GIF. Plusieurs images peuvent être sélectionnées.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || uploadingImages}
            className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-semibold rounded-lg transition min-h-[44px] touch-manipulation disabled:opacity-50"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={loading || uploadingImages}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
        >
          {uploadingImages ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Téléchargement des images...
            </>
          ) : loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {post ? 'Enregistrement...' : 'Création...'}
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              {post ? 'Enregistrer' : 'Créer l\'Annonce'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}