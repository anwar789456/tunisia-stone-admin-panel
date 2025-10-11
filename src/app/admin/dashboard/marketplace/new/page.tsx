import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import MarketplaceCreateForm from '@/components/admin/MarketplaceCreateForm'

export default function NewMarketplacePage() {
  return (
    <div>
      <Link
        href="/admin/dashboard/marketplace"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux Annonces
      </Link>

      <div className="max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Créer une Nouvelle Annonce</h1>
          <MarketplaceCreateForm />
        </div>
      </div>
    </div>
  )
}
