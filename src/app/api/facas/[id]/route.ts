import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'
import type { FacaFormData } from '@/types/faca'

async function requireAuth(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return token ? verifySession(token) : false
}

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params
  const supabase = createServerClient()
  const { data, error } = await supabase.from('facas').select('*').eq('id', id).single()
  if (error) return Response.json({ error: error.message }, { status: error.code === 'PGRST116' ? 404 : 500 })
  return Response.json(data)
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params
  const body: Partial<FacaFormData> = await req.json()
  const supabase = createServerClient()
  const { data, error } = await supabase.from('facas').update(body).eq('id', id).select().single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { id } = await params
  const supabase = createServerClient()

  // Busca as URLs das fotos para limpar o Storage
  const { data: faca } = await supabase
    .from('facas')
    .select('fotos, foto_destaque')
    .eq('id', id)
    .single()

  if (faca) {
    const urls: string[] = []
    if (faca.foto_destaque) urls.push(faca.foto_destaque as string)
    if (Array.isArray(faca.fotos)) urls.push(...(faca.fotos as string[]))

    const MARKER = '/object/public/facas/'
    const paths = urls
      .map((url) => {
        const idx = url.indexOf(MARKER)
        return idx >= 0 ? decodeURIComponent(url.slice(idx + MARKER.length)) : null
      })
      .filter((p): p is string => p !== null)

    if (paths.length > 0) {
      await supabase.storage.from('facas').remove(paths)
    }
  }

  const { error } = await supabase.from('facas').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
