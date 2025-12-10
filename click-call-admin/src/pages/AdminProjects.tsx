import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteProject, loadProjects, loadLocalProjects } from '../store/projects'
import { canonicalLink } from '../lib/link'
import { sb } from '../lib/supabase'
import type { Project } from '../types'
import { fallbackLink } from '../lib/link'

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const nav = useNavigate()

  useEffect(() => {
    (async () => setProjects(await loadProjects()))()
  }, [])

  const onRemove = async (id: string) => {
    await deleteProject(id)
    setProjects(await loadProjects())
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'click-call-projects.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const syncToSupabase = async () => {
    const client = sb()
    if (!client) {
      alert('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no ambiente de produção.')
      return
    }
    const local = loadLocalProjects()
    if (!local.length) {
      alert('Nenhum projeto local para sincronizar.')
      return
    }
    const isUuid = (s?: string) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
    const good = local.filter(p => isUuid(p.id))
    const bad = local.filter(p => !isUuid(p.id)).map(({ id, ...rest }) => rest)
    const ins = bad.length ? await client.from('call_projects').insert(bad) : { error: null, status: 200 }
    const ups = good.length ? await client.from('call_projects').upsert(good, { onConflict: 'id' }) : { error: null, status: 200 }
    const error = ins.error || ups.error
    const status = ins.status || ups.status
    if (error) {
      alert('Erro ao sincronizar: ' + (error.message ?? JSON.stringify(error) ?? 'desconhecido') + ' | status: ' + status)
      return
    }
    alert('Projetos sincronizados com sucesso.')
    setProjects(await loadProjects())
  }

  const diagnoseSupabase = async () => {
    const client = sb()
    if (!client) {
      alert('Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e redeploy.')
      return
    }
    const sel = await client.from('call_projects').select('*').limit(1)
    alert('Diagnóstico select: status=' + sel.status + ' error=' + (sel.error?.message ?? JSON.stringify(sel.error) ?? 'none'))
  }

  const importJson = (file: File) => {
    const r = new FileReader()
    r.onload = () => {
      try {
        const arr = JSON.parse(String(r.result))
        if (Array.isArray(arr)) {
          localStorage.setItem('cc_projects', JSON.stringify(arr))
          setProjects(arr)
        }
      } catch {}
    }
    r.readAsText(file)
  }

  const rows = useMemo(() => projects.map(p => (
    <tr key={p.id} className="border-b border-neutral-800">
      <td className="py-2">{p.name}</td>
      <td className="py-2">@{p.caller_name}</td>
      <td className="py-2 text-xs text-neutral-400 break-all">{canonicalLink(p)}</td>
      <td className="py-2 flex gap-2">
        <button onClick={()=>nav(`/admin/projects/${p.id}/edit`)} className="px-2 py-1 rounded bg-neutral-700">Editar</button>
        <button onClick={()=>onRemove(p.id)} className="px-2 py-1 rounded bg-red-600">Remover</button>
        <a href={`/${encodeURIComponent(p.domain_user)}/${encodeURIComponent(p.domain_call)}`} target="_blank" className="px-2 py-1 rounded bg-emerald-600">Preview</a>
        <button onClick={()=>navigator.clipboard.writeText(canonicalLink(p))} className="px-2 py-1 rounded bg-neutral-700">Copiar link</button>
      </td>
    </tr>
  )), [projects])

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Projetos</h1>
          <div className="flex gap-2">
            <Link to="/admin/projects/new" className="px-3 py-2 rounded bg-emerald-600">Novo</Link>
            <button onClick={exportJson} className="px-3 py-2 rounded bg-neutral-700">Exportar</button>
            <label className="px-3 py-2 rounded bg-neutral-700 cursor-pointer">
              Importar
              <input type="file" accept="application/json" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f) importJson(f)}} />
            </label>
            <button onClick={syncToSupabase} className="px-3 py-2 rounded bg-[#fc0f57] hover:bg-[#e30e51]">Sincronizar com Supabase</button>
            <button onClick={diagnoseSupabase} className="px-3 py-2 rounded border border-neutral-700">Diagnosticar Supabase</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-neutral-400">
              <th className="text-left">Nome</th>
              <th className="text-left">@caller</th>
              <th className="text-left">Link público</th>
              <th className="text-left">Ações</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </div>
  )
}
