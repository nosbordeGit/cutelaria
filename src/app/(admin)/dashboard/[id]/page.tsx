import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase-server'
import FacaForm from '../_components/FacaForm'
import type { Faca } from '@/types/faca'

export default async function EditarFacaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerClient()
  const { data, error } = await supabase.from('facas').select('*').eq('id', id).single()

  if (error || !data) notFound()

  return <FacaForm faca={data as Faca} />
}
