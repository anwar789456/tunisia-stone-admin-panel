'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ShoppingBag, MapPin, DollarSign, Calendar, Edit, User, Plus, Trash2, LayoutGrid, Table2 } from 'lucide-react'
import MarketplaceModal from '@/components/admin/MarketplaceModal'
import UserMarketplaceForm from '@/components/admin/UserMarketplaceForm'

type ViewMode = 'table' | 'grid'

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
  contact_info: string | null
  created_at: string
}

interface UserProfile {
  nom: string
  prenom: string
  email: string
}

export default function UserMarketplacePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = params.id as string
  const status = searchParams.get('status') || 'all'

  const [user, setUser] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<MarketplacePost[]>([])
  const [counts, setCounts] = useState({ all: 0, active: 0, inactive: 0 })
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<MarketplacePost | null>(null)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  useEffect(() => {
    fetchData()
  }, [id, status])

  const fetchData = async () => {
    setLoading(true)
    const supabase = createClient()

    // Fetch user
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('nom, prenom, email')
      .eq('id', id)
      .single()

    if (userError || !userData) {
      router.push('/admin/dashboard/users')
      return
    }

    setUser(userData)

    // Fetch user's marketplace posts
    let query = supabase
      .from('marketplace_posts')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: postsData, error: postsError } = await query

    if (postsError) {
      console.error('Error fetching posts:', postsError)
    }

    setPosts(postsData || [])

    // Get status counts
    const { data: allPosts } = await supabase
      .from('marketplace_posts')
      .select('status')
      .eq('user_id', id)

    setCounts({
      all: allPosts?.length || 0,
      active: allPosts?.filter(p => p.status === 'active').length || 0,
      inactive: allPosts?.filter(p => p.status === 'inactive').length || 0,
    })

    setLoading(false)
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return

    setDeletingPostId(postId)
    const supabase = createClient()

    try {
      // Get post to delete images
      const { data: post } = await supabase
        .from('marketplace_posts')
        .select('images')
        .eq('id', postId)
        .single()

      // Delete images from storage
      if (post?.images && post.images.length > 0) {
        await supabase.storage
          .from('marketplace_images')
          .remove(post.images)
      }

      // Delete post
      const { error } = await supabase
        .from('marketplace_posts')
        .delete()
        .eq('id', postId)

      if (error) throw error

      fetchData()
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Échec de la suppression de l\'annonce')
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleModalClose = () => {
    setIsCreateModalOpen(false)
    setEditingPost(null)
  }

  const handleSuccess = () => {
    handleModalClose()
    fetchData()
  }

  const getImageUrl = (imagePath: string) => {
    const supabase = createClient()
    const { data } = supabase.storage
      .from('marketplace_images')
      .getPublicUrl(imagePath)
    return data.publicUrl
  }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <Link
        href={`/admin/dashboard/users/${id}`}
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 min-h-[44px] touch-manipulation"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au Profil
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-slate-600" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Annonces de {user.nom} {user.prenom}
            </h1>
          </div>
          <p className="text-slate-600">
            {posts?.length || 0} annonce{(posts?.length || 0) !== 1 ? 's' : ''} marketplace
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouvelle Annonce
        </button>
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
            href={`/admin/dashboard/users/${id}/marketplace?status=${tab.value}`}
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

      {viewMode === 'table' ? (
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
          {posts && posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Annonce
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
                          {post.images && post.images.length > 0 ? (
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 mr-3 bg-slate-100">
                              <Image
                                src={getImageUrl(post.images[0])}
                                alt={post.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0">
                              <ShoppingBag className="w-8 h-8 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-900">{post.title}</div>
                            <div className="text-sm text-slate-500 line-clamp-1">{post.description}</div>
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPost(post)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            disabled={deletingPostId === post.id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Aucune annonce marketplace
              </h3>
              <p className="text-slate-500">
                Cet utilisateur n'a pas encore publié d'annonces
              </p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Card Image */}
                  {post.images && post.images.length > 0 ? (
                    <div className="relative w-full h-48 bg-slate-100">
                      <Image
                        src={getImageUrl(post.images[0])}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap backdrop-blur-sm ${
                          post.status === 'active'
                            ? 'bg-green-100/90 text-green-800'
                            : 'bg-gray-100/90 text-gray-800'
                        }`}
                      >
                        {post.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ) : (
                    <div className="relative w-full h-48 bg-slate-100 flex items-center justify-center">
                      <ShoppingBag className="w-16 h-16 text-slate-300" />
                      <span
                        className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                          post.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}
                  
                  {/* Card Header */}
                  <div className="p-4 sm:p-5">
                    <div className="mb-3">
                      <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                        {post.title}
                      </h3>
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
                    <div className="space-y-2 mb-4">
                      {post.location && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      {post.category && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                            {post.category}
                          </span>
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
                  <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingPostId === post.id}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 text-center py-12">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900 mb-1">
                Aucune annonce marketplace
              </h3>
              <p className="text-slate-500">
                Cet utilisateur n'a pas encore publié d'annonces
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <MarketplaceModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        title="Nouvelle Annonce"
      >
        <UserMarketplaceForm
          userId={id}
          onSuccess={handleSuccess}
          onCancel={handleModalClose}
        />
      </MarketplaceModal>

      {/* Edit Modal */}
      <MarketplaceModal
        isOpen={!!editingPost}
        onClose={handleModalClose}
        title="Modifier l'Annonce"
      >
        {editingPost && (
          <UserMarketplaceForm
            userId={id}
            post={editingPost}
            onSuccess={handleSuccess}
            onCancel={handleModalClose}
          />
        )}
      </MarketplaceModal>
    </div>
  )
}
