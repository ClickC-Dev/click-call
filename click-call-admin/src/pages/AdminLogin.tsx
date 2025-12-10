import { FormEvent, useState } from 'react'
import { login } from '@/lib/auth'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()
  const loc = useLocation()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const ok = login(email, password)
    if (ok) nav((loc.state as any)?.from?.pathname || '/admin/projects')
    else setError('Credenciais inválidas')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-sm p-6 rounded-xl bg-neutral-900">
        <h1 className="text-2xl font-semibold mb-4">Login do Administrador</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none" required />
          </div>
          <div>
            <label className="text-sm">Senha</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700 focus:outline-none" required />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500">Entrar</button>
        </form>
      </div>
    </div>
  )
}

