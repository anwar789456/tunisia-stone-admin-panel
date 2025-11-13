'use client'

import { useState, Dispatch, SetStateAction } from 'react'
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react'

interface UserFiltersProps {
  search: string
  setSearch: Dispatch<SetStateAction<string>>
  userType: 'all' | 'pro' | 'standard'
  setUserType: Dispatch<SetStateAction<'all' | 'pro' | 'standard'>>
  sortBy: string
  setSortBy: Dispatch<SetStateAction<string>>
}

export default function UserFilters({ 
  search, 
  setSearch, 
  userType, 
  setUserType, 
  sortBy, 
  setSortBy 
}: UserFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const clearFilters = () => {
    setSearch('')
    setUserType('all')
    setSortBy('newest')
  }

  const activeFiltersCount = 
    (search ? 1 : 0) + 
    (userType !== 'all' ? 1 : 0) + 
    (sortBy !== 'newest' ? 1 : 0)

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email, société..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg font-medium transition flex items-center gap-2 ${
            showFilters 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtres</span>
          {activeFiltersCount > 0 && (
            <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres Avancés
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Type d&apos;utilisateur
              </label>
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'all' | 'pro' | 'standard')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 bg-white"
              >
                <option value="all">Tous les utilisateurs</option>
                <option value="pro">Utilisateurs Pro</option>
                <option value="standard">Utilisateurs Standard</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Trier par
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-900 bg-white"
              >
                <option value="newest">Plus récents</option>
                <option value="oldest">Plus anciens</option>
                <option value="name-asc">Nom (A-Z)</option>
                <option value="name-desc">Nom (Z-A)</option>
                <option value="email-asc">Email (A-Z)</option>
                <option value="email-desc">Email (Z-A)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
