import { redirect } from 'next/navigation'
import { getAdminProfile } from '@/lib/auth'
import AdminNav from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if user is an admin
  const profile = await getAdminProfile()

  // Redirect to login if not an admin
  if (!profile) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav profile={profile} />
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {children}
      </main>
    </div>
  )
}
