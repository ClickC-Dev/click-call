import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteProject, loadProjects } from '../store/projects'
import type { Project } from '../types'
import { fallbackLink } from '../lib/link'

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const nav = useNavigate()

  useEffect(() => {
    setProjects(loadProjects())
  }, [])

  const onRemove = (id: string) => {
    deleteProject(id)
    setProjects(loadProjects())
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
      <td className="py-2 text-xs text-neutral-400 break-all">{fallbackLink(p)}</td>
      <td className="py-2 flex gap-2">
        <button onClick={()=>nav(`/admin/projects/${p.id}/edit`)} className="px-2 py-1 rounded bg-neutral-700">Editar</button>
        <button onClick={()=>onRemove(p.id)} className="px-2 py-1 rounded bg-red-600">Remover</button>
        <a href={`/${encodeURIComponent(p.domain_user)}/${encodeURIComponent(p.domain_call)}`} target="_blank" className="px-2 py-1 rounded bg-emerald-600">Preview</a>
        <button onClick={()=>navigator.clipboard.writeText(fallbackLink(p))} className="px-2 py-1 rounded bg-neutral-700">Copiar link</button>
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
