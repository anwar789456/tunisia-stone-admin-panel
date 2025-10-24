import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, ShoppingBag, Package, MessageSquare } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: usersCount },
    { count: postsCount },
    { count: stockCount },
    { count: demandsCount }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('marketplace_posts').select('*', { count: 'exact', head: true }),
    supabase.from('stock_marbre').select('*', { count: 'exact', head: true }),
    supabase.from('postdemands').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    {
      name: 'Total Utilisateurs',
      value: usersCount || 0,
      icon: Users,
      href: '/admin/dashboard/users',
      color: 'bg-blue-500',
    },
    {
      name: 'Annonces Marketplace',
      value: postsCount || 0,
      icon: ShoppingBag,
      href: '/admin/dashboard/marketplace',
      color: 'bg-green-500',
    },
    {
      name: 'Articles en Stock',
      value: stockCount || 0,
      icon: Package,
      href: '/admin/dashboard/users',
      color: 'bg-purple-500',
    },
    {
      name: 'Demandes de Posts',
      value: demandsCount || 0,
      icon: MessageSquare,
      href: '/admin/dashboard/demands',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Bienvenue sur votre panneau d'administration</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md active:scale-95 transition p-4 sm:p-5 md:p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.name}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 sm:mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Actions Rapides</h2>
          <div className="space-y-2 sm:space-y-3">
            <Link
              href="/admin/dashboard/users"
              className="block p-3 sm:p-4 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 rounded-lg transition"
            >
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Gérer les Utilisateurs</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Voir et modifier les profils utilisateurs</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Informations Système</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 text-sm sm:text-base">Statut de la Plateforme</span>
              <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                Actif
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600 text-sm sm:text-base">Base de données</span>
              <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                Connectée
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
