import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArrowLeft, User, Mail, Building, MessageSquare, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function DemandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: demandData, error } = await supabase
    .from('postdemands')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !demandData) {
    notFound()
  }

  // Fetch related sender profile
  const { data: sender } = await supabase
    .from('profiles')
    .select('id, email, nom, prenom, societe, telephone, avatar_url')
    .eq('id', demandData.sender_id)
    .single()

  // Fetch related post
  const { data: post } = await supabase
    .from('marketplace_posts')
    .select('id, title, description, price, location, status')
    .eq('id', demandData.post_id)
    .single()

  const demand = {
    ...demandData,
    sender,
    post
  }

  return (
    <div>
      <Link
        href="/admin/dashboard/demands"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux Demandes
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sender Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Informations de l'Expéditeur</h3>
            
            <div className="text-center mb-4">
              {demand.sender?.avatar_url ? (
                <img
                  src={demand.sender.avatar_url}
                  alt={`${demand.sender.nom} ${demand.sender.prenom}`}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <User className="w-20 h-20 text-slate-400 mx-auto mb-3" />
              )}
              <h4 className="text-xl font-bold text-slate-900">
                {demand.sender?.nom} {demand.sender?.prenom}
              </h4>
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-sm text-slate-900">{demand.sender?.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Société</p>
                  <p className="text-sm text-slate-900">{demand.sender?.societe || '-'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Envoyé le</p>
                  <p className="text-sm text-slate-900">
                    {new Date(demand.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/admin/dashboard/users/${demand.sender_id}`}
                className="block w-full text-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                Voir le Profil de l'Expéditeur
              </Link>
            </div>
          </div>
        </div>

        {/* Demand Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Statut de la Demande</h3>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  demand.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : demand.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : demand.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {demand.status || 'pending'}
              </span>
            </div>
          </div>

          {/* Message Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-5 h-5 text-slate-400 mr-2" />
              <h3 className="text-xl font-bold text-slate-900">Message</h3>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-900 whitespace-pre-wrap">{demand.message}</p>
            </div>
          </div>

          {/* Related Post Card */}
          {demand.post && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center mb-4">
                <FileText className="w-5 h-5 text-slate-400 mr-2" />
                <h3 className="text-xl font-bold text-slate-900">Annonce Associée</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Titre</p>
                  <p className="text-lg font-semibold text-slate-900">{demand.post.title}</p>
                </div>

                {demand.post.description && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Description</p>
                    <p className="text-sm text-slate-900">{demand.post.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {demand.post.price && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Prix</p>
                      <p className="text-sm text-slate-900">{demand.post.price} TND</p>
                    </div>
                  )}

                  {demand.post.location && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Localisation</p>
                      <p className="text-sm text-slate-900">{demand.post.location}</p>
                    </div>
                  )}

                  {demand.post.status && (
                    <div>
                      <p className="text-sm font-medium text-slate-500">Statut de l'Annonce</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        demand.post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {demand.post.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
