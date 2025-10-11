import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UserEditForm from '@/components/admin/UserEditForm'
import { ArrowLeft, Mail, Phone, Building, Tag, UserCircle, ShoppingBag, Package } from 'lucide-react'
import Link from 'next/link'

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    notFound()
  }

  // Fetch user's posts
  const { data: posts } = await supabase
    .from('marketplace_posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch user's stock
  const { data: stock } = await supabase
    .from('stock_marbre')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div>
      <Link
        href="/admin/dashboard/users"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux Utilisateurs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="text-center">
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={`${user.nom} ${user.prenom}`}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
              ) : (
                <UserCircle className="w-24 h-24 text-slate-400 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold text-slate-900">
                {user.nom} {user.prenom}
              </h2>
              <p className="text-slate-600 mt-1">@{user.slug}</p>
              <div className="mt-4">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_pro
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user.is_pro ? 'Professionnel' : 'Utilisateur Standard'}
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Email</p>
                  <p className="text-sm text-slate-900">{user.email || '-'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Phone</p>
                  <p className="text-sm text-slate-900">{user.telephone || '-'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Building className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Company</p>
                  <p className="text-sm text-slate-900">{user.societe || '-'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Tag className="w-5 h-5 text-slate-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-500">Category</p>
                  <p className="text-sm text-slate-900">{user.category || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Activité</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ShoppingBag className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">Annonces Marketplace</span>
                </div>
                <span className="font-semibold text-slate-900">{posts?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">Articles en Stock</span>
                </div>
                <span className="font-semibold text-slate-900">{stock?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form and Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Modifier le Profil Utilisateur</h3>
            <UserEditForm user={user} />
          </div>

          {/* Recent Posts */}
          {posts && posts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Annonces Récentes</h3>
              <div className="space-y-3">
                {posts.map((post) => (
                  <div key={post.id} className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900">{post.title}</h4>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">{post.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-medium text-blue-600">
                        {post.price ? `${post.price} TND` : 'Prix non défini'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        post.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {post.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Stock */}
          {stock && stock.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Articles en Stock Récents</h3>
              <div className="space-y-3">
                {stock.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900">{item.product_name}</h4>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-slate-600">
                      <div>Type: {item.type_marbre || '-'}</div>
                      <div>Quantity: {item.quantity || 0}</div>
                      {item.longueur && <div>L: {item.longueur}cm</div>}
                      {item.largeur && <div>W: {item.largeur}cm</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
