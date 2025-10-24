'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ShoppingBag, User, MapPin, DollarSign, Calendar, Plus, LayoutGrid, Table2 } from 'lucide-react'

type ViewMode = 'table' | 'grid'

interface MarketplacePost {
  id: string
  title: string
  description?: string
  price?: number
  location?: string
  category?: string
  status: string
  created_at: string
  user_id: string
  user?: {
    id: string
    email: string
    nom: string
    prenom: string
  }
}

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [posts, setPosts] = useState<MarketplacePost[]>([])
  const [counts, setCounts] = useState({ all: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  
  const status = searchParams.get('status') || 'all'
  const search = searchParams.get('search') || ''

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search])

  async function fetchPosts() {
    setLoading(true)
    const supabase = createClient()

    // Fetch posts
    let query = supabase
      .from('marketplace_posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`)
    }

    const { data: postsData, error } = await query.limit(100)

    if (error) {
      console.error('Error fetching posts:', error)
    }

    // Manually fetch user data
    let fetchedPosts = postsData || []
    
    if (fetchedPosts.length > 0) {
      const userIds = [...new Set(fetchedPosts.map(p => p.user_id))]

      const { data: users } = await supabase
        .from('profiles')
        .select('id, email, nom, prenom')
        .in('id', userIds)

      fetchedPosts = fetchedPosts.map(post => ({
        ...post,
        user: users?.find(u => u.id === post.user_id)
      }))
    }

    setPosts(fetchedPosts)

    // Get status counts
    const { data: statusCounts } = await supabase
      .from('marketplace_posts')
      .select('status')

    setCounts({
      all: statusCounts?.length || 0,
      active: statusCounts?.filter(p => p.status === 'active').length || 0,
      inactive: statusCounts?.filter(p => p.status === 'inactive').length || 0,
    })

    setLoading(false)
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Annonces Marketplace</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Gérer toutes les annonces de la plateforme</p>
        </div>
        <Link
          href="/admin/dashboard/marketplace/new"
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation whitespace-nowrap"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Annonce
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-4 sm:mb-6">
        <form method="get" className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Rechercher..."
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 text-sm sm:text-base min-h-[44px]"
          />
          <button
            type="submit"
            className="px-6 py-2.5 sm:py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Status Filter Tabs and Layout Toggle */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto w-full sm:w-auto">
          {[
            { label: 'Toutes', value: 'all', count: counts.all },
            { label: 'Actives', value: 'active', count: counts.active },
            { label: 'Inactives', value: 'inactive', count: counts.inactive },
          ].map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/dashboard/marketplace?status=${tab.value}`}
              className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm border-b-2 transition whitespace-nowrap min-h-[44px] flex items-center touch-manipulation ${
                status === tab.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label} ({tab.count})
            </Link>
          ))}
        </div>
        
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
      </div>

      {loading ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Chargement...</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
          {/* Table View */}
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
                {posts.map((post) => (
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
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('fr-FR')}
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

          {posts.length === 0 && (
            <div className="text-center py-8 sm:py-12">
              <ShoppingBag className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune annonce trouvée</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                {search
                  ? 'Essayez d&apos;ajuster votre recherche'
                  : 'Aucune annonce dans le système'}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Grid View */}
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/admin/dashboard/marketplace/${post.id}`}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                          <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition">
                            {post.title}
                          </h3>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${
                          post.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Description */}
                    {post.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {post.description}
                      </p>
                    )}

                    {/* Price */}
                    {post.price && (
                      <div className="mb-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <span className="text-xl font-bold text-blue-600">
                            {post.price} TND
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Details */}
                    <div className="space-y-2">
                      {post.user && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>{post.user.nom} {post.user.prenom}</span>
                        </div>
                      )}
                      {post.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      {post.created_at && (
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                      Voir les détails →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 text-center py-12">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900">Aucune annonce trouvée</h3>
              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? 'Essayez d&apos;ajuster votre recherche'
                  : 'Aucune annonce dans le système'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
