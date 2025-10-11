import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ShoppingBag, User, MapPin, DollarSign, Calendar, Plus } from 'lucide-react'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  // Fetch posts
  let query = supabase
    .from('marketplace_posts')
    .select('*')
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,location.ilike.%${params.search}%`)
  }

  const { data: postsData, error } = await query.limit(100)

  // Log error for debugging
  if (error) {
    console.error('Error fetching posts:', error)
  }

  // Manually fetch user data
  let posts = postsData || []
  
  if (posts.length > 0) {
    const userIds = [...new Set(posts.map(p => p.user_id))]

    const { data: users } = await supabase
      .from('profiles')
      .select('id, email, nom, prenom')
      .in('id', userIds)

    posts = posts.map(post => ({
      ...post,
      user: users?.find(u => u.id === post.user_id)
    }))
  }

  // Get status counts
  const { data: statusCounts } = await supabase
    .from('marketplace_posts')
    .select('status')

  const counts = {
    all: statusCounts?.length || 0,
    active: statusCounts?.filter(p => p.status === 'active').length || 0,
    inactive: statusCounts?.filter(p => p.status === 'inactive').length || 0,
    sold: statusCounts?.filter(p => p.status === 'sold').length || 0,
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Annonces Marketplace</h1>
          <p className="text-slate-600 mt-2">Gérer toutes les annonces de la plateforme</p>
        </div>
        <Link
          href="/admin/dashboard/marketplace/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Annonce
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <form method="get" className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Rechercher par titre, description, localisation..."
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {[
          { label: 'Toutes', value: 'all', count: counts.all },
          { label: 'Actives', value: 'active', count: counts.active },
          { label: 'Inactives', value: 'inactive', count: counts.inactive },
          { label: 'Vendues', value: 'sold', count: counts.sold },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/dashboard/marketplace?status=${tab.value}`}
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
                  Annonce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Localisation
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
              {posts?.map((post: any) => (
                <tr key={post.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ShoppingBag className="w-8 h-8 text-slate-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{post.title}</div>
                        <div className="text-sm text-slate-500 line-clamp-1">{post.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-slate-400 mr-2" />
                      <div className="text-sm text-slate-900">
                        {post.user?.nom} {post.user?.prenom}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-900">
                      <DollarSign className="w-4 h-4 text-slate-400 mr-1" />
                      {post.price ? `${post.price} TND` : '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-900">
                      <MapPin className="w-4 h-4 text-slate-400 mr-1" />
                      {post.location || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : post.status === 'sold'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {post.status || 'active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/dashboard/marketplace/${post.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {posts?.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune annonce trouvée</h3>
            <p className="mt-1 text-sm text-slate-500">
              {params.search
                ? 'Essayez d\'ajuster votre recherche'
                : 'Aucune annonce dans le système'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
