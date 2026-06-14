import type { NextRequest } from 'next/server'
import { createPublicClient } from '@/lib/supabase-server'

function normalize(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]/g, '')
}

export async function GET(request: NextRequest) {
  const serie = request.nextUrl.searchParams.get('serie') ?? ''

  if (!serie.trim()) {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }

  const normalized = normalize(serie)
  const supabase = createPublicClient()

  const { data, error } = await supabase
    .from('facas')
    .select('id, numero_serie')

  if (error) {
    console.error('[buscar] Supabase error:', error)
    return Response.json({ error: 'internal' }, { status: 500 })
  }

  const found = (data ?? []).find(
    (f) => normalize(f.numero_serie ?? '') === normalized
  )

  if (!found) {
    return Response.json({ error: 'not_found' }, { status: 404 })
  }

  return Response.json({ id: found.id, numero_serie: found.numero_serie })
}
