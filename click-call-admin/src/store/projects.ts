import type { Project } from '../types'
import { sb } from '../lib/supabase'

const isUuid = (s?: string) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)

const KEY = 'cc_projects'

export const loadProjects = async (): Promise<Project[]> => {
  const client = sb()
  if (client) {
    const { data, error } = await client.from('call_projects').select('*').order('created_at', { ascending: false })
    if (!error && Array.isArray(data)) return data as unknown as Project[]
  }
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
    return []
  } catch {
    return []
  }
}

export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(KEY, JSON.stringify(projects))
}

export const getProjectById = async (id: string) => {
  const client = sb()
  if (client) {
    const { data } = await client.from('call_projects').select('*').eq('id', id).single()
    if (data) return data as unknown as Project
  }
  const arr = await loadProjects()
  return arr.find(p => p.id === id)
}

export const getProjectBySegments = async (user?: string | null, call?: string | null) => {
  const u = user || ''
  const c = call || ''
  const client = sb()
  if (client) {
    const { data } = await client.from('call_projects').select('*').eq('domain_user', u).eq('domain_call', c).single()
    if (data) return data as unknown as Project
  }
  const arr = await loadProjects()
  return arr.find(p => p.domain_user === u && p.domain_call === c) || null
}

export const upsertProject = async (project: Project) => {
  const client = sb()
  if (client) {
    if (!isUuid(project.id)) {
      const { id, ...rest } = project as any
      await client.from('call_projects').insert(rest)
      return
    }
    await client.from('call_projects').upsert(project, { onConflict: 'id' })
    return
  }
  const arr = await loadProjects()
  const idx = arr.findIndex(p => p.id === project.id)
  if (idx >= 0) arr[idx] = project
  else arr.push(project)
  saveProjects(arr)
}

export const deleteProject = async (id: string) => {
  const client = sb()
  if (client) {
    await client.from('call_projects').delete().eq('id', id)
    return
  }
  const arr = (await loadProjects()).filter(p => p.id !== id)
  saveProjects(arr)
}
export const loadLocalProjects = (): Project[] => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) return arr
    return []
  } catch {
    return []
  }
}
