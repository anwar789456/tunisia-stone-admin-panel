'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2 } from 'lucide-react'
import UserSearchDropdown from './UserSearchDropdown'

export default function MarketplaceCreateForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    user_id: '',
    title: '',
    description: '',
    price: '',
    location: '',
    category: '',
    status: 'active',
    contact_info: '',
  })

  // Fetch users for selection
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('id, email, nom, prenom')
        .order('nom', { ascending: true })
      
      if (data) setUsers(data)
    }
    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.user_id) {
      setError('Veuillez sélectionner un utilisateur')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      const { data, error: insertError } = await supabase
        .from('marketplace_posts')
        .insert({
          user_id: formData.user_id,
          title: formData.title,
          description: formData.description || null,
          price: formData.price ? Number(formData.price) : null,
          location: formData.location || null,
          category: formData.category || null,
          status: formData.status,
          contact_info: formData.contact_info || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push('/admin/dashboard/marketplace')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Échec de la création de l\'annonce')
      setLoading(false)
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
          Utilisateur <span className="text-red-500">*</span>
        </label>
        <UserSearchDropdown
          users={users}
          value={formData.user_id}
          onChange={(userId) => setFormData({ ...formData, user_id: userId })}
          placeholder="Sélectionner un utilisateur"
          required
        />
      </div>

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
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Catégorie
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
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
            <option value="sold">Vendue</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
          Informations de Contact
        </label>
        <input
          type="text"
          value={formData.contact_info}
          onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full sm:w-auto px-6 py-3 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-900 font-semibold rounded-lg transition min-h-[44px] touch-manipulation"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Créer l'Annonce
            </>
          )}
        </button>
      </div>
    </form>
  )
}
