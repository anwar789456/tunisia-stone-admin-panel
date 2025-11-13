import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Users, TrendingUp, Calendar, Award } from 'lucide-react'
import UserAnalyticsCharts from '@/components/admin/UserAnalyticsCharts'
import UsersTable from '@/components/admin/UsersTable'

export default async function UsersPage() {
  const supabase = await createClient()

  // ✅ Create admin client using service role key for listUsers()
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // --- Fetch ALL profiles (no filtering on server) ---
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1000)

  if (profilesError) console.error('Error fetching profiles:', profilesError)
  console.log('Profiles fetched:', profiles?.length || 0)

  // --- Fetch auth users ---
  let authUsers: any[] = []
  try {
    const { data, error: authError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1000 }) // ✅ uses admin client
    if (authError) console.error('Error fetching auth users:', authError)
    else {
      authUsers = data?.users || []
      console.log('Auth users fetched:', authUsers.length)
    }
  } catch (err) {
    console.error('Exception fetching auth users:', err)
  }

  // --- Merge profiles with auth data ---
  const users = profiles?.map(profile => {
    const authUser = authUsers.find(u => u.id === profile.id) // ✅ match by id, not email
    return {
      ...profile,
      user_created_at: authUser?.created_at || null,
      email: profile.email || authUser?.email || null, // fallback if missing
    }
  }) || []

  console.log('Final users with dates:', users?.length || 0)

  // --- Analytics logic unchanged ---
  const totalUsers = users?.length || 0
  const proUsers = users?.filter(u => u.is_pro).length || 0
  const standardUsers = totalUsers - proUsers

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const newUsersThisMonth = users?.filter(u => u.user_created_at && new Date(u.user_created_at) >= thirtyDaysAgo).length || 0

  const sixtyDaysAgo = new Date()
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
  const previousMonthUsers = users?.filter(u => {
    if (!u.user_created_at) return false
    const createdDate = new Date(u.user_created_at)
    return createdDate >= sixtyDaysAgo && createdDate < thirtyDaysAgo
  }).length || 0

  const growthRate = previousMonthUsers > 0
    ? ((newUsersThisMonth - previousMonthUsers) / previousMonthUsers * 100).toFixed(1)
    : newUsersThisMonth > 0 ? '100' : '0'

  const usersByMonth = users?.reduce((acc: Record<string, number>, user) => {
    if (!user.user_created_at) return acc
    const month = new Date(user.user_created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })
    acc[month] = (acc[month] || 0) + 1
    return acc
  }, {}) || {}

  const chartData = {
    usersByMonth,
    proVsStandard: { pro: proUsers, standard: standardUsers },
    totalUsers,
    usersData: users || []
  }

  return (
    <div className="w-full max-w-full space-y-9">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">Utilisateurs</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">Gérer tous les utilisateurs de la plateforme</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Utilisateurs</p>
              <h3 className="text-3xl font-bold mt-2">{totalUsers}</h3>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Pro Users */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Utilisateurs Pro</p>
              <h3 className="text-3xl font-bold mt-2">{proUsers}</h3>
              <p className="text-purple-100 text-xs mt-1">{totalUsers > 0 ? ((proUsers / totalUsers) * 100).toFixed(1) : 0}% du total</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Award className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* New Users This Month */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Nouveaux (30j)</p>
              <h3 className="text-3xl font-bold mt-2">{newUsersThisMonth}</h3>
              <p className="text-green-100 text-xs mt-1">Ce mois-ci</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Taux de Croissance</p>
              <h3 className="text-3xl font-bold mt-2">{growthRate}%</h3>
              <p className="text-orange-100 text-xs mt-1">vs mois précédent</p>
            </div>
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <UserAnalyticsCharts data={chartData} />

      {/* Users Table */}
      <UsersTable users={users} thirtyDaysAgo={thirtyDaysAgo} />
    </div>
  )
}
