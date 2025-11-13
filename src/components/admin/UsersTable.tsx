'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { UserCircle, Package, Calendar, BarChart3, Activity } from 'lucide-react'
import UserFilters from './UserFilters'

interface User {
  id: string
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
  societe: string | null
  slug: string
  is_pro: boolean
  user_created_at: string | null
}

interface UsersTableProps {
  users: User[]
  thirtyDaysAgo: Date
}

export default function UsersTable({ users, thirtyDaysAgo }: UsersTableProps) {
  const [search, setSearch] = useState('')
  const [userType, setUserType] = useState<'all' | 'pro' | 'standard'>('all')
  const [sortBy, setSortBy] = useState('newest')

  // Client-side filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users]

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      filtered = filtered.filter(user => {
        const nom = (user.nom || '').toLowerCase()
        const prenom = (user.prenom || '').toLowerCase()
        const email = (user.email || '').toLowerCase()
        const societe = (user.societe || '').toLowerCase()
        const telephone = (user.telephone || '').toLowerCase()
        
        return nom.includes(searchLower) ||
               prenom.includes(searchLower) ||
               email.includes(searchLower) ||
               societe.includes(searchLower) ||
               telephone.includes(searchLower)
      })
    }

    // Apply user type filter
    if (userType === 'pro') {
      filtered = filtered.filter(u => u.is_pro)
    } else if (userType === 'standard') {
      filtered = filtered.filter(u => !u.is_pro)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.user_created_at || 0).getTime() - new Date(b.user_created_at || 0).getTime()
        case 'newest':
          return new Date(b.user_created_at || 0).getTime() - new Date(a.user_created_at || 0).getTime()
        case 'name-asc':
          return (a.nom || '').localeCompare(b.nom || '')
        case 'name-desc':
          return (b.nom || '').localeCompare(a.nom || '')
        case 'email-asc':
          return (a.email || '').localeCompare(b.email || '')
        case 'email-desc':
          return (b.email || '').localeCompare(a.email || '')
        default:
          return new Date(b.user_created_at || 0).getTime() - new Date(a.user_created_at || 0).getTime()
      }
    })

    return filtered
  }, [users, search, userType, sortBy])

  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-200">
      <div className="p-3 sm:p-4 md:p-6 border-b border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Liste des Utilisateurs</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="w-4 h-4" />
            <span>{filteredAndSortedUsers.length} utilisateur{filteredAndSortedUsers.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <UserFilters 
          search={search}
          setSearch={setSearch}
          userType={userType}
          setUserType={setUserType}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
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
                Date d&apos;inscription
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredAndSortedUsers.map((user) => {
              const joinDate = user.user_created_at 
                ? new Date(user.user_created_at).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })
                : '-'
              
              const joinTime = user.user_created_at 
                ? new Date(user.user_created_at).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })
                : ''
              
              return (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
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
                    <div className="text-sm text-slate-900">{joinDate}</div>
                    {joinTime && (
                      <div className="text-xs text-slate-500">{joinTime}</div>
                    )}
                    {user.user_created_at && new Date(user.user_created_at) >= thirtyDaysAgo && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                        Nouveau
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/dashboard/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir Profil
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-slate-200">
        {filteredAndSortedUsers.map((user) => {
          const joinDate = user.user_created_at 
            ? new Date(user.user_created_at).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : '-'
          
          return (
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
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Calendar className="w-3 h-3" />
                        <span>{joinDate}</span>
                      </div>
                      {user.user_created_at && new Date(user.user_created_at) >= thirtyDaysAgo && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 pt-1">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <BarChart3 className="w-3 h-3" />
                        <span>- annonces</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Package className="w-3 h-3" />
                        <span>- stock</span>
                      </div>
                    </div>
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
          )
        })}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <UserCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">Aucun utilisateur trouvé</h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {search ? 'Essayez d\'ajuster votre recherche' : 'Aucun utilisateur dans le système'}
          </p>
        </div>
      )}
    </div>
  )
}
