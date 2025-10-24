'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, LogOut, Shield, MessageSquare, ShoppingBag, Menu, X } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function AdminNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { href: '/admin/dashboard/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/dashboard/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/admin/dashboard/demands', label: 'Demandes', icon: MessageSquare },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="flex items-center" onClick={closeMobileMenu}>
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <span className="ml-2 text-base sm:text-xl font-bold text-slate-900 hidden xs:block">
                Panneau Admin
              </span>
              <span className="ml-2 text-base font-bold text-blue-600 xs:hidden">
                Admin
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-8 md:flex md:space-x-2 lg:space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = item.href === '/admin/dashboard' 
                  ? pathname === '/admin/dashboard'
                  : pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium rounded-md transition ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">{item.label.split(' ')[0]}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - User & Logout (Desktop) */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <span className="text-xs lg:text-sm text-slate-600 truncate max-w-[120px] lg:max-w-none">
              {profile.nom} {profile.prenom}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-2 lg:px-3 py-2 text-xs lg:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition"
            >
              <LogOut className="w-4 h-4 lg:mr-2" />
              <span className="hidden lg:inline">Déconnexion</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-3 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === '/admin/dashboard' 
                ? pathname === '/admin/dashboard'
                : pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`flex items-center px-3 py-3 text-base font-medium rounded-lg transition ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              )
            })}
          </div>
          <div className="pt-3 pb-3 border-t border-slate-200 px-3">
            <div className="flex items-center px-3 mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {profile.nom?.[0]}{profile.prenom?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-slate-900">
                  {profile.nom} {profile.prenom}
                </div>
                <div className="text-sm text-slate-500">{profile.email}</div>
              </div>
            </div>
            <button
              onClick={() => {
                handleLogout()
                closeMobileMenu()
              }}
              className="flex items-center w-full px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
