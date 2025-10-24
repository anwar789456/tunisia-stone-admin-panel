'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, MapPin, DollarSign, Calendar, Edit, User, Plus, Trash2 } from 'lucide-react'
import MarketplaceModal from '@/components/admin/MarketplaceModal'
import UserMarketplaceForm from '@/components/admin/UserMarketplaceForm'

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

      {/* Status Filter Tabs */}
      <div className="mb-4 sm:mb-6 flex gap-1 sm:gap-2 border-b border-slate-200 overflow-x-auto">
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

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        {posts && posts.length > 0 ? (
          <div className="divide-y divide-slate-200">
            {posts.map((post) => (
              <div key={post.id} className="p-4 sm:p-6 hover:bg-slate-50 transition">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg flex-1">
                        {post.title}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${
                          post.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : post.status === 'inactive'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {post.status === 'active'
                          ? 'Active'
                          : 'Inactive'}
                      </span>
                    </div>

                    {post.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {post.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      {post.price && (
                        <div className="flex items-center gap-1 font-semibold text-blue-600">
                          <DollarSign className="w-4 h-4" />
                          <span>{post.price} TND</span>
                        </div>
                      )}
                      {post.location && (
                        <div className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{post.location}</span>
                        </div>
                      )}
                      {post.category && (
                        <span className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">
                          {post.category}
                        </span>
                      )}
                      {post.created_at && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(post.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition min-h-[44px] touch-manipulation"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingPostId === post.id}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-lg transition min-h-[44px] touch-manipulation disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
