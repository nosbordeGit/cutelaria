import { SignJWT, jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!)
export const SESSION_COOKIE = 'nosborde_session'

export function verifyPassword(password: string): boolean {
  return password === process.env.ADMIN_PASSWORD
}

export async function createSession(): Promise<string> {
  return new SignJWT({ sub: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

// Lê a sessão do cookie em Server Components e Route Handlers.
// Usa import dinâmico para não arrastar next/headers para proxy.ts.
export async function getSessionFromCookies(): Promise<string | null> {
  const { cookies } = await import('next/headers')
  const store = await cookies()
  return store.get(SESSION_COOKIE)?.value ?? null
}
