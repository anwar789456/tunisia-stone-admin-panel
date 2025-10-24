'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { Save, Loader2 } from 'lucide-react'

export default function UserEditForm({ user }: { user: Profile }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    email: user.email || '',
    telephone: user.telephone || '',
    nom: user.nom || '',
    prenom: user.prenom || '',
    societe: user.societe || '',
    category: user.category || '',
    is_pro: user.is_pro || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      // Use API route with service role to bypass RLS
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telephone: formData.telephone,
          nom: formData.nom,
          prenom: formData.prenom,
          societe: formData.societe,
          category: formData.category,
          is_pro: formData.is_pro,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update user')
      }

      setSuccess(true)
      
      // Force a hard refresh to reload data from server
      setTimeout(() => {
        router.refresh()
      }, 500)
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm">
          Profil utilisateur mis à jour avec succès !
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-3 rounded-lg text-xs sm:text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Prénom
          </label>
          <input
            type="text"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Nom
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            inputMode="email"
            value={formData.email}
            readOnly
            disabled
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed text-sm sm:text-base min-h-[44px]"
          />
          <p className="text-xs text-slate-500 mt-1">L'email ne peut pas être modifié</p>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Téléphone
          </label>
          <input
            type="tel"
            inputMode="tel"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
            Société
          </label>
          <input
            type="text"
            value={formData.societe}
            onChange={(e) => setFormData({ ...formData, societe: e.target.value })}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
        </div>

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
            <option value="industriel">Industriel</option>
            <option value="commercial">Commercial</option>
            <option value="service">Service</option>
            <option value="employe">Employé</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_pro"
          checked={formData.is_pro}
          onChange={(e) => setFormData({ ...formData, is_pro: e.target.checked })}
          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="is_pro" className="ml-2 text-sm font-medium text-slate-700">
          Compte Professionnel
        </label>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] touch-manipulation"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </form>
  )
}
