const getEnv = (key: string) => (import.meta.env as any)[key] || (import.meta.env as any)[`VITE_${key}`]

const ADMIN_EMAIL = getEnv('ADMIN_EMAIL') || ''
const ADMIN_PASSWORD = getEnv('ADMIN_PASSWORD') || ''

export const isLoggedIn = () => localStorage.getItem('cc_admin_auth') === '1'
export const hasAdminCreds = () => !!ADMIN_EMAIL && !!ADMIN_PASSWORD

export const login = (email: string, password: string) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false
  const e = String(email).trim().toLowerCase()
  const ep = String(ADMIN_EMAIL).trim().toLowerCase()
  const p = String(password)
  const pp = String(ADMIN_PASSWORD)
  if (e === ep && p === pp) {
    localStorage.setItem('cc_admin_auth', '1')
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem('cc_admin_auth')
}
