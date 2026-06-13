import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifySession, SESSION_COOKIE } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase-server'

async function requireAuth(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  return token ? verifySession(token) : false
}

export async function POST(request: NextRequest) {
  if (!(await requireAuth())) {
    return Response.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const folder = (formData.get('folder') as string | null) ?? `tmp/${crypto.randomUUID()}`

  if (!file || !(file instanceof Blob)) {
    return Response.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  }

  const fileName = file instanceof File ? file.name : 'upload'
  const contentType = file instanceof File ? file.type : 'application/octet-stream'
  const safeName = fileName.replace(/[^a-z0-9.\-_]/gi, '_')
  const path = `${folder}/${Date.now()}-${safeName}`

  const supabase = createServerClient()
  const { error } = await supabase.storage
    .from('facas')
    .upload(path, file, { contentType, upsert: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data } = supabase.storage.from('facas').getPublicUrl(path)
  return Response.json({ url: data.publicUrl })
}
