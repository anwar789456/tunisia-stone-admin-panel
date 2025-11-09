import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UserCircle, Package } from 'lucide-react'
import SearchUsers from '@/components/admin/SearchUsers'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('*')
    .order('email', { ascending: true })

  if (params.search) {
    query = query.or(`email.ilike.%${params.search}%,nom.ilike.%${params.search}%,prenom.ilike.%${params.search}%,societe.ilike.%${params.search}%`)
  }

  const { data: users, error } = await query.limit(100)

  // Log error for debugging
  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Utilisateurs</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Gérer tous les utilisateurs de la plateforme</p>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
        <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200">
          <SearchUsers />
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Téléphone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Société
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users?.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserCircle className="w-10 h-10 text-slate-400" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">
                          {user.nom} {user.prenom}
                        </div>
                        <div className="text-sm text-slate-500">{user.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{user.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{user.telephone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{user.societe || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_pro
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_pro ? 'Pro' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/dashboard/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir Profil
                      </Link>
                      {/* <Link
                        href={`/admin/dashboard/users/${user.id}/stock`}
                        className="inline-flex items-center text-green-600 hover:text-green-900"
                        title="Gérer le stock"
                      >
                        <Package className="w-4 h-4" />
                        Voir Stock
                      </Link> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-slate-200">
          {users?.map((user) => (
            <div key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <UserCircle className="w-12 h-12 text-slate-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 truncate">
                        {user.nom} {user.prenom}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">@{user.slug}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 ${
                        user.is_pro
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.is_pro ? 'Pro' : 'Standard'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {user.email && (
                      <p className="text-xs text-slate-600 truncate">{user.email}</p>
                    )}
                    {user.telephone && (
                      <p className="text-xs text-slate-600">{user.telephone}</p>
                    )}
                    {user.societe && (
                      <p className="text-xs text-slate-600 truncate">{user.societe}</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/admin/dashboard/users/${user.id}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition min-h-[44px] flex items-center justify-center touch-manipulation"
                    >
                      Voir Profil
                    </Link>
                    <Link
                      href={`/admin/dashboard/users/${user.id}/stock`}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                      title="Gérer le stock"
                    >
                      <Package className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users?.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <UserCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun utilisateur trouvé</h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              {params.search ? 'Essayez d\'ajuster votre recherche' : 'Aucun utilisateur dans le système'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
