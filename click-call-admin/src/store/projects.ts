import type { Project } from '../types'

const KEY = 'cc_projects'

export const loadProjects = (): Project[] => {
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

export const getProjectById = (id: string) => loadProjects().find(p => p.id === id)

export const getProjectBySegments = (user?: string | null, call?: string | null) => {
  const u = user || ''
  const c = call || ''
  return loadProjects().find(p => p.domain_user === u && p.domain_call === c)
}

export const upsertProject = (project: Project) => {
  const arr = loadProjects()
  const idx = arr.findIndex(p => p.id === project.id)
  if (idx >= 0) arr[idx] = project
  else arr.push(project)
  saveProjects(arr)
}

export const deleteProject = (id: string) => {
  const arr = loadProjects().filter(p => p.id !== id)
  saveProjects(arr)
}
