import { cookies } from 'next/headers'
import { verifyPassword, createSession, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!verifyPassword(password)) {
    return Response.json({ ok: false, message: 'Senha incorreta' }, { status: 401 })
  }

  const token = await createSession()
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return Response.json({ ok: true })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return Response.json({ ok: true })
}
