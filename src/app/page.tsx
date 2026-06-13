import { redirect } from 'next/navigation'
import { getSessionFromCookies, verifySession } from '@/lib/auth'

export default async function Home() {
  const token = await getSessionFromCookies()
  const isAuthenticated = token ? await verifySession(token) : false

  if (isAuthenticated) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
