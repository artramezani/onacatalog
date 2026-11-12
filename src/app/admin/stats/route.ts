import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: totalCatalogs },
    { count: activeCatalogs },
    { count: totalUsers },
    { count: activeSubs },
    { count: todayUploads },
    { data: recent },
  ] = await Promise.all([
    supabaseAdmin.from('catalogs').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('catalogs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabaseAdmin.from('catalogs').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabaseAdmin
      .from('catalogs')
      .select('id, title, status, page_count, view_count, created_at, profiles(phone)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({
    totalCatalogs, activeCatalogs, totalUsers, activeSubs, todayUploads, recent,
  })
}
