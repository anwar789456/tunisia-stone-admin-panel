import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShoppingBag, MapPin, DollarSign, Calendar, Edit, User } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserMarketplacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { id } = await params
  const { status = 'all' } = await searchParams
  const supabase = await createClient()

  // Fetch user
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('nom, prenom, email')
    .eq('id', id)
    .single()

  if (userError || !user) {
    notFound()
  }

  // Fetch user's marketplace posts with status filter
  let query = supabase
    .from('marketplace_posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: allPostsForFilter, error: postsError } = await query

  if (postsError) {
    console.error('Error fetching posts:', postsError)
  }

  // Filter posts client-side to handle any potential whitespace issues
  let posts = allPostsForFilter || []
  if (status && status !== 'all') {
    posts = posts.filter(p => p.status?.trim() === status)
  }

  // Get status counts
  const { data: allPosts, error: countError } = await supabase
    .from('marketplace_posts')
    .select('status')
    .eq('user_id', id)

  if (countError) {
    console.error('Error fetching counts:', countError)
  }

  // Debug: Check ALL posts in database to see if user_id is the issue
  const { data: allPostsInDb } = await supabase
    .from('marketplace_posts')
    .select('id, title, status, user_id')

  // Check for whitespace or case issues
  const statusDebug = allPosts?.map(p => ({
    status: p.status,
    isActive: p.status === 'active',
    isInactive: p.status === 'inactive',
    trimmedStatus: p.status?.trim(),
    statusLength: p.status?.length
  }))
  console.log('Status debug:', statusDebug)

  const counts = {
    all: allPosts?.length || 0,
    active: allPosts?.filter(p => p.status?.trim() === 'active').length || 0,
    inactive: allPosts?.filter(p => p.status?.trim() === 'inactive').length || 0,
  }

  console.log('Counts:', counts)
  console.log('=== END DEBUG ===')

  return (
    <div>
      <Link
        href={`/admin/dashboard/users/${id}`}
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 min-h-[44px] touch-manipulation"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au Profil
      </Link>

      <div className="mb-6">
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

                  <Link
                    href={`/admin/dashboard/marketplace/${post.id}`}
                    className="w-full sm:w-auto flex-shrink-0 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition min-h-[44px] touch-manipulation"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </Link>
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
    </div>
  )
}
