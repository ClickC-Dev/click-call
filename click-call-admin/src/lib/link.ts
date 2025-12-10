import type { Project } from '../types'

const canonicalOrigin = () => {
  const host = (import.meta as any)?.env?.VITE_CANONICAL_HOST
  if (host) return host.startsWith('http') ? host : `https://${host}`
  return window.location.origin
}

export const canonicalLink = (p: Project) => `${canonicalOrigin()}/${encodeURIComponent(p.domain_user)}/${encodeURIComponent(p.domain_call)}`
export const fallbackLink = (p: Project) => `${window.location.origin}/call?user=${encodeURIComponent(p.domain_user)}&call=${encodeURIComponent(p.domain_call)}`
