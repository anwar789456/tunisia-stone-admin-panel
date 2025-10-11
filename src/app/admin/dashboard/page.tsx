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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
        <p className="text-slate-600 mt-2">Bienvenue sur votre panneau d'administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Actions Rapides</h2>
          <div className="space-y-3">
            <Link
              href="/admin/dashboard/users"
              className="block p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition"
            >
              <h3 className="font-semibold text-slate-900">Gérer les Utilisateurs</h3>
              <p className="text-sm text-slate-600 mt-1">Voir et modifier les profils utilisateurs</p>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Informations Système</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Statut de la Plateforme</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Actif
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-slate-600">Base de données</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Connectée
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
