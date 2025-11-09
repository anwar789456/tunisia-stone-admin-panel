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

  // Fetch user's posts (all of them)
  const { data: posts } = await supabase
    .from('marketplace_posts')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  // Fetch user's stock (all items for management)
  const { data: stock } = await supabase
    .from('stock_marbre')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <Link
        href="/admin/dashboard/users"
        className="inline-flex items-center text-sm sm:text-sm text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 min-h-[44px] touch-manipulation"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux Utilisateurs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="text-center">
              <UserCircle className="w-24 h-24 text-slate-400 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {user.nom} {user.prenom}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 mt-1">@{user.slug}</p>
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

              <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ShoppingBag className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">Annonces Marketplace</span>
                </div>
                <span className="font-semibold text-slate-900">{posts?.length || 0}</span>
              </div>
              <Link
                href={`/admin/dashboard/users/${id}/marketplace`}
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Voir les Annonces
              </Link>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">Articles en Stock</span>
                </div>
                <span className="font-semibold text-slate-900">{stock?.length || 0}</span>
              </div>
              <Link
                href={`/admin/dashboard/users/${id}/stock`}
                className="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
              >
                <Package className="w-5 h-5 mr-2" />
                Gérer le Stock
              </Link>
            </div>
            </div>
          </div>

          {/* Stats Card */}
          {/* <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Activité</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <ShoppingBag className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">Annonces Marketplace</span>
                </div>
                <span className="font-semibold text-slate-900">{posts?.length || 0}</span>
              </div>
              <Link
                href={`/admin/dashboard/users/${id}/marketplace`}
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Voir les Annonces
              </Link>

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Package className="w-4 h-4 text-slate-400 mr-2" />
                  <span className="text-slate-600">Articles en Stock</span>
                </div>
                <span className="font-semibold text-slate-900">{stock?.length || 0}</span>
              </div>
              <Link
                href={`/admin/dashboard/users/${id}/stock`}
                className="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
              >
                <Package className="w-5 h-5 mr-2" />
                Gérer le Stock
              </Link>
            </div>
          </div> */}
        </div>

        {/* Edit Form and Activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6">Modifier le Profil Utilisateur</h3>
            <UserEditForm user={user} />
          </div>

          {/* Marketplace Posts Link */}
          {/* <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Annonces Marketplace</h3>
              </div>
              <span className="text-sm text-slate-500">{posts?.length || 0} annonce{(posts?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Consultez toutes les annonces marketplace de cet utilisateur
            </p>
            <Link
              href={`/admin/dashboard/users/${id}/marketplace`}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Voir les Annonces
            </Link>
          </div> */}

          {/* Stock Management Link */}
          {/* <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-slate-600" />
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Stock de l'utilisateur</h3>
              </div>
              <span className="text-sm text-slate-500">{stock?.length || 0} article{(stock?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Gérez le stock de marbre de cet utilisateur
            </p>
            <Link
              href={`/admin/dashboard/users/${id}/stock`}
              className="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition min-h-[44px] touch-manipulation"
            >
              <Package className="w-5 h-5 mr-2" />
              Gérer le Stock
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  )
}
