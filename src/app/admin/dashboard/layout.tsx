import { redirect } from 'next/navigation'
import { getAdminProfile } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TESTING: Skip profile check - allow anyone to access
  const profile = await getAdminProfile()

  // Create a dummy profile if none exists
  const displayProfile = profile || {
    id: 'guest',
    email: 'guest@admin.com',
    nom: 'Guest',
    prenom: 'Admin',
    telephone: null,
    societe: null,
    category: null,
    slug: null,
    avatar_url: null,
    is_pro: false,
    is_admin: true
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav profile={displayProfile} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
