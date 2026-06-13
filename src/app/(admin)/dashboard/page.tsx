import { Suspense } from 'react'
import { createServerClient } from '@/lib/supabase-server'
import DashboardClient from './_components/DashboardClient'
import type { Faca } from '@/types/faca'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('facas')
    .select('*')
    .order('created_at', { ascending: false })
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a]" />}>
      <DashboardClient initialFacas={(data ?? []) as Faca[]} />
    </Suspense>
  )
}
