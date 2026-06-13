import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import type { FacaFormData } from '@/types/faca'

async function requireAuth(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  return token ? verifySession(token) : false
}

export async function GET(request: NextRequest) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const tipo = searchParams.get('tipo')
  const q = searchParams.get('q')

  const supabase = createServerClient()
  let query = supabase.from('facas').select('*').order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (tipo) query = query.eq('tipo', tipo)
  if (q) query = query.or(`numero_serie.ilike.%${q}%,nome.ilike.%${q}%`)

  const { data, error } = await query
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body: FacaFormData = await request.json()
  const supabase = createServerClient()

  const { data, error } = await supabase.from('facas').insert(body).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
