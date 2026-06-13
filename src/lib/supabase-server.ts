import { createClient } from '@supabase/supabase-js'

// Leituras públicas (página QR Code — sem acesso a campos privados)
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Operações admin (dashboard, API routes protegidas)
// Requer SUPABASE_SERVICE_ROLE_KEY em .env.local
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
