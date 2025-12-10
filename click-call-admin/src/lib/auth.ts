const getEnv = (key: string) => (import.meta.env as any)[key] || (import.meta.env as any)[`VITE_${key}`]

const ADMIN_EMAIL = getEnv('ADMIN_EMAIL') || ''
const ADMIN_PASSWORD = getEnv('ADMIN_PASSWORD') || ''

export const isLoggedIn = () => localStorage.getItem('cc_admin_auth') === '1'
export const hasAdminCreds = () => !!ADMIN_EMAIL && !!ADMIN_PASSWORD

export const login = (email: string, password: string) => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return false
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem('cc_admin_auth', '1')
    return true
  }
  return false
}

export const logout = () => {
  localStorage.removeItem('cc_admin_auth')
}
