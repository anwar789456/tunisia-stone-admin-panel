import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Trash2 } from 'lucide-react'
import Link from 'next/link'
import MarketplaceEditForm from '@/components/admin/MarketplaceEditForm'
import DeletePostButton from '@/components/admin/DeletePostButton'

export default async function MarketplaceEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('marketplace_posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !post) {
    notFound()
  }

  // Fetch user data
  const { data: user } = await supabase
    .from('profiles')
    .select('id, email, nom, prenom, societe, telephone')
    .eq('id', post.user_id)
    .single()

  return (
    <div>
      <Link
        href="/admin/dashboard/marketplace"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux Annonces
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Propriétaire</h3>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-5 h-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {user?.nom} {user?.prenom}
                  </p>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>

              {user?.societe && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Société</p>
                  <p className="text-sm text-slate-900">{user.societe}</p>
                </div>
              )}

              {user?.telephone && (
                <div className="pt-3 border-t border-slate-200">
                  <p className="text-sm font-medium text-slate-500">Téléphone</p>
                  <p className="text-sm text-slate-900">{user.telephone}</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                href={`/admin/dashboard/users/${post.user_id}`}
                className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                Voir le Profil
              </Link>
            </div>
          </div>

          {/* Delete Section */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Zone de Danger</h3>
            <p className="text-sm text-slate-600 mb-4">
              La suppression de cette annonce est irréversible.
            </p>
            <DeletePostButton postId={post.id} />
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Modifier l'Annonce</h3>
            <MarketplaceEditForm post={post} />
          </div>
        </div>
      </div>
    </div>
  )
}
