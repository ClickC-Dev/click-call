import type { Project } from '../types'

export const canonicalLink = (p: Project) => `https://SEU_DOMINIO/${p.domain_user}/${p.domain_call}`
export const fallbackLink = (p: Project) => `${window.location.origin}/call?user=${encodeURIComponent(p.domain_user)}&call=${encodeURIComponent(p.domain_call)}`
