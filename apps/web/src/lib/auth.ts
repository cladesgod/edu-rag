export function setToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function clearToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
}

type JwtPayload = { sub?: string; role?: string; email?: string; exp?: number; [k: string]: unknown }

export function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    try {
      const [, payload] = token.split('.')
      return JSON.parse(atob(payload))
    } catch {
      return null
    }
  }
}

export function getRole(): string | null {
  const t = getToken()
  if (!t) return null
  const p = parseJwt(t)
  return p?.role ?? null
}

export function getEmail(): string | null {
  const t = getToken()
  if (!t) return null
  const p = parseJwt(t)
  return (p?.email as string) || null
}


