'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('marketplace_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      router.push('/admin/dashboard/marketplace')
      router.refresh()
    } catch (err: any) {
      alert('Erreur lors de la suppression: ' + err.message)
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Supprimer l'Annonce
      </button>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-red-900">
        Êtes-vous sûr ? Cette action est irréversible.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Suppression...
            </>
          ) : (
            'Confirmer'
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
