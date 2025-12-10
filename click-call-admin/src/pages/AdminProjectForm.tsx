import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../types'
import { getProjectById, upsertProject } from '../store/projects'
import { uid } from '../lib/id'
import { DEFAULT_AVATAR_URL, DEFAULT_BG, DEFAULT_INITIAL_MESSAGE, DEFAULT_INTRO_CTA_TEXT, DEFAULT_NOEL_AUDIO_URL, DEFAULT_RINGTONE_URL } from '../constants'
import { canonicalLink } from '../lib/link'

export default function AdminProjectForm({ mode }: { mode: 'new' | 'edit' }) {
  const { id } = useParams()
  const nav = useNavigate()
  const [p, setP] = useState<Project | null>(null)

  useEffect(() => {
    if (mode === 'edit' && id) {
      (async () => {
        const found = await getProjectById(id)
        if (found) setP(found)
      })()
    }
  }, [mode, id])

  useEffect(() => {
    if (mode === 'new') {
      setP({
        id: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : uid(),
        name: 'Natal',
        slug: 'noel',
        domain_user: 'clickc',
        domain_call: 'noel',
        caller_name: 'Papai Noel',
        avatar_url: 'https://gorjpnrijxdiuuwmyfak.supabase.co/storage/v1/object/public/Call/Presente%20-%20Cliente.webp',
        bg: DEFAULT_BG,
        audio_url: DEFAULT_NOEL_AUDIO_URL,
        initial_message: DEFAULT_INITIAL_MESSAGE,
        intro_cta_text: 'Estou pronto',
        cta_text: '',
        cta_url: ''
      })
    }
  }, [mode])

  const set = (k: keyof Project, v: any) => setP(prev => prev ? { ...prev, [k]: v } : prev)

  const link = useMemo(() => p ? canonicalLink(p) : '', [p])

  const save = async () => {
    if (!p) return
    await upsertProject(p)
    nav('/admin/projects')
  }

  if (!p) return null

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">{mode === 'new' ? 'Criar Projeto' : 'Editar Projeto'}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Nome</label>
            <input value={p.name} onChange={e=>set('name', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div>
            <label className="text-sm">Slug</label>
            <input value={p.slug} onChange={e=>set('slug', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div>
            <label className="text-sm">Usuário</label>
            <input value={p.domain_user} onChange={e=>set('domain_user', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div>
            <label className="text-sm">Projeto</label>
            <input value={p.domain_call} onChange={e=>set('domain_call', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div>
            <label className="text-sm">Caller name</label>
            <input value={p.caller_name} onChange={e=>set('caller_name', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div>
            <label className="text-sm">Avatar URL</label>
            <input value={p.avatar_url} onChange={e=>set('avatar_url', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Background</label>
            <input value={p.bg} onChange={e=>set('bg', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Áudio URL (conectado)</label>
            <input value={p.audio_url} onChange={e=>set('audio_url', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" placeholder={DEFAULT_NOEL_AUDIO_URL} />
            <p className="text-xs text-neutral-400 mt-1">Se vazio, usa síntese de voz pt-BR</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm">Mensagem inicial</label>
            <textarea value={p.initial_message} onChange={e=>set('initial_message', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" rows={3} />
          </div>
          <div>
            <label className="text-sm">Texto CTA</label>
            <input value={p.cta_text} onChange={e=>set('cta_text', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
          <div>
            <label className="text-sm">URL CTA</label>
            <input value={p.cta_url} onChange={e=>set('cta_url', e.target.value)} className="mt-1 w-full px-3 py-2 rounded bg-neutral-800 border border-neutral-700" />
          </div>
        </div>
        <div className="text-xs text-neutral-400">Domínio: {p.domain_user}/{p.domain_call}</div>
        <div className="flex items-center gap-2">
          <button onClick={save} className="px-4 py-2 rounded bg-emerald-600">Salvar</button>
          <a href={`/${encodeURIComponent(p.domain_user)}/${encodeURIComponent(p.domain_call)}`} target="_blank" className="px-4 py-2 rounded bg-neutral-700">Preview</a>
          <button onClick={()=>navigator.clipboard.writeText(link)} className="px-4 py-2 rounded bg-neutral-700">Copiar link</button>
        </div>
        <div className="text-xs text-neutral-400">Ringtone padrão: {DEFAULT_RINGTONE_URL}</div>
      </div>
    </div>
  )
}
