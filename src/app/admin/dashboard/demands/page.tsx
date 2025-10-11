import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { MessageSquare, User, FileText, Calendar } from 'lucide-react'

export default async function DemandsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch demands first
  let query = supabase
    .from('postdemands')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  const { data: demandsData, error } = await query.limit(100)

  // Log error for debugging
  if (error) {
    console.error('Error fetching demands:', error)
  }

  // Manually fetch related data
  let demands = demandsData || []
  
  if (demands.length > 0) {
    const senderIds = [...new Set(demands.map(d => d.sender_id))]
    const postIds = [...new Set(demands.map(d => d.post_id))]

    // Fetch senders
    const { data: senders } = await supabase
      .from('profiles')
      .select('id, email, nom, prenom, societe')
      .in('id', senderIds)

    // Fetch posts
    const { data: posts } = await supabase
      .from('marketplace_posts')
      .select('id, title')
      .in('id', postIds)

    // Map the data
    demands = demands.map(demand => ({
      ...demand,
      sender: senders?.find(s => s.id === demand.sender_id),
      post: posts?.find(p => p.id === demand.post_id)
    }))
  }

  // Get status counts
  const { data: statusCounts } = await supabase
    .from('postdemands')
    .select('status')

  const counts = {
    all: statusCounts?.length || 0,
    pending: statusCounts?.filter(d => d.status === 'pending').length || 0,
    approved: statusCounts?.filter(d => d.status === 'approved').length || 0,
    rejected: statusCounts?.filter(d => d.status === 'rejected').length || 0,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Demandes de Posts</h1>
        <p className="text-slate-600 mt-2">Gérer toutes les demandes de posts</p>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {[
          { label: 'Toutes', value: 'all', count: counts.all },
          { label: 'En attente', value: 'pending', count: counts.pending },
          { label: 'Approuvées', value: 'approved', count: counts.approved },
          { label: 'Rejetées', value: 'rejected', count: counts.rejected },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/dashboard/demands?status=${tab.value}`}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition ${
              (params.status || 'all') === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label} ({tab.count})
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Expéditeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Statut
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
              {demands?.map((demand) => (
                <tr key={demand.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-8 h-8 text-slate-400" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900">
                          {demand.sender?.nom} {demand.sender?.prenom}
                        </div>
                        <div className="text-sm text-slate-500">{demand.sender?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-slate-400 mr-2" />
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {demand.post?.title || 'Annonce Inconnue'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 max-w-md truncate">
                      {demand.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(demand.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/dashboard/demands/${demand.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir Détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {demands?.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune demande trouvée</h3>
            <p className="mt-1 text-sm text-slate-500">
              {params.status && params.status !== 'all'
                ? `Aucune demande ${params.status === 'pending' ? 'en attente' : params.status === 'approved' ? 'approuvée' : 'rejetée'} pour le moment`
                : 'Aucune demande de post dans le système'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
