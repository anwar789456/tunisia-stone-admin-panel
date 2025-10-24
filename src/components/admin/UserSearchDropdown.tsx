'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X, User } from 'lucide-react'

interface UserOption {
  id: string
  email: string
  nom: string
  prenom: string
}

interface UserSearchDropdownProps {
  users: UserOption[]
  value: string
  onChange: (userId: string) => void
  placeholder?: string
  required?: boolean
}

export default function UserSearchDropdown({
  users,
  value,
  onChange,
  placeholder = 'Sélectionner un utilisateur',
  required = false,
}: UserSearchDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedUser = users.find((user) => user.id === value)

  // Filter users based on search query
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${user.nom} ${user.prenom}`.toLowerCase()
    const email = user.email.toLowerCase()
    
    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      user.nom.toLowerCase().includes(searchLower) ||
      user.prenom.toLowerCase().includes(searchLower)
    )
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (userId: string) => {
    onChange(userId)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSearchQuery('')
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-left bg-white hover:bg-slate-50 active:bg-slate-100 transition flex items-center justify-between min-h-[44px] touch-manipulation"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <User className="w-4 h-4 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
          {selectedUser ? (
            <span className="text-slate-900 truncate text-sm sm:text-base">
              {selectedUser.nom} {selectedUser.prenom} ({selectedUser.email})
            </span>
          ) : (
            <span className="text-slate-400 text-sm sm:text-base">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          {selectedUser && (
            <X
              className="w-5 h-5 sm:w-4 sm:h-4 text-slate-400 hover:text-slate-600 p-0.5"
              onClick={handleClear}
            />
          )}
          <ChevronDown
            className={`w-5 h-5 sm:w-4 sm:h-4 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden max-h-[70vh] flex flex-col">
          {/* Search Input */}
          <div className="p-2 sm:p-2 border-b border-slate-200 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-9 pr-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-sm text-slate-900 min-h-[44px] touch-manipulation"
              />
            </div>
          </div>

          {/* User List */}
          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(70vh - 120px)' }}>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user.id)}
                  className={`w-full px-3 sm:px-4 py-3 sm:py-3 text-left hover:bg-blue-50 active:bg-blue-100 transition flex flex-col gap-1 min-h-[60px] touch-manipulation ${
                    value === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="font-medium text-slate-900 text-sm sm:text-base">
                    {user.nom} {user.prenom}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 truncate">{user.email}</div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-slate-500">
                <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm">Aucun utilisateur trouvé</p>
                {searchQuery && (
                  <p className="text-xs mt-1">
                    Essayez une autre recherche
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Results Count */}
          {searchQuery && filteredUsers.length > 0 && (
            <div className="px-3 sm:px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex-shrink-0">
              {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
      )}

      {/* Hidden input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          onChange={() => {}}
          required
          className="absolute opacity-0 pointer-events-none"
          tabIndex={-1}
        />
      )}
    </div>
  )
}
