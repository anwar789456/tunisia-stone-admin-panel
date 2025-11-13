'use client'

import { BarChart3, PieChart, TrendingUp, Users } from 'lucide-react'

interface ChartData {
  usersByMonth: Record<string, number>
  proVsStandard: { pro: number; standard: number }
  totalUsers: number
  usersData: any[]
}

export default function UserAnalyticsCharts({ data }: { data: ChartData }) {
  const { usersByMonth, proVsStandard, totalUsers, usersData } = data

  // Prepare timeline data (last 6 months)
  const monthEntries = Object.entries(usersByMonth).slice(-6)
  const maxUsers = Math.max(...monthEntries.map(([_, count]) => count), 1)

  // Pro vs Standard percentages
  const proPercentage = totalUsers > 0 ? (proVsStandard.pro / totalUsers) * 100 : 0
  const standardPercentage = totalUsers > 0 ? (proVsStandard.standard / totalUsers) * 100 : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* User Registration Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Inscriptions par Mois</h3>
            <p className="text-sm text-slate-600 mt-1">Évolution des inscriptions (6 derniers mois)</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        
        <div className="space-y-4">
          {monthEntries.length > 0 ? (
            monthEntries.map(([month, count]) => {
              const percentage = (count / maxUsers) * 100
              return (
                <div key={month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{month}</span>
                    <span className="font-bold text-blue-600">{count} utilisateurs</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>

      {/* Pro vs Standard Distribution */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Distribution des Types</h3>
            <p className="text-sm text-slate-600 mt-1">Répartition Pro vs Standard</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-lg">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        <div className="space-y-6">
          {/* Visual Pie Chart Representation */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {/* Standard Users (Gray) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="20"
                />
                {/* Pro Users (Purple) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#9333ea"
                  strokeWidth="20"
                  strokeDasharray={`${proPercentage * 2.51} ${251 - proPercentage * 2.51}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
                  <p className="text-xs text-slate-600">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                <span className="font-medium text-slate-900">Utilisateurs Pro</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">{proVsStandard.pro}</p>
                <p className="text-xs text-slate-600">{proPercentage.toFixed(1)}%</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-400 rounded-full"></div>
                <span className="font-medium text-slate-900">Utilisateurs Standard</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-600">{proVsStandard.standard}</p>
                <p className="text-xs text-slate-600">{standardPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Top Contributeurs</h3>
            <p className="text-sm text-slate-600 mt-1">Utilisateurs les plus actifs</p>
          </div>
          <div className="bg-yellow-100 p-3 rounded-lg">
            <Users className="w-6 h-6 text-yellow-600" />
          </div>
        </div>

        <div className="space-y-3">
          {usersData.slice(0, 5).map((user, index) => (
            <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-slate-300 text-slate-700' :
                index === 2 ? 'bg-orange-300 text-orange-900' :
                'bg-slate-200 text-slate-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user.nom} {user.prenom}
                </p>
                <p className="text-xs text-slate-600">
                  {user.email || 'Pas d\'email'}
                </p>
              </div>
              {user.is_pro && (
                <span className="px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full">
                  Pro
                </span>
              )}
            </div>
          ))}
          {usersData.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-8">Aucun utilisateur disponible</p>
          )}
        </div>
      </div>
    </div>
  )
}
