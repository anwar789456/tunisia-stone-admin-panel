import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UserStockManager from '@/components/admin/UserStockManager'
import { ArrowLeft, Package } from 'lucide-react'
import Link from 'next/link'

export default async function UserStockPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch user info
  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !user) {
    notFound()
  }

  // Fetch user's stock
  const { data: stock } = await supabase
    .from('stock_marbre')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <Link
        href={`/admin/dashboard/users/${id}`}
        className="inline-flex items-center text-sm sm:text-sm text-slate-600 hover:text-slate-900 mb-4 sm:mb-6 min-h-[44px] touch-manipulation"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour au Profil
      </Link>

      <UserStockManager userId={id} initialStock={stock || []} />
    </div>
  )
}
