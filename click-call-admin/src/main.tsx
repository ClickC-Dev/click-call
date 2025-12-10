import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'
import AdminLogin from './pages/AdminLogin'
import AdminProjects from './pages/AdminProjects'
import AdminProjectForm from './pages/AdminProjectForm'
import PublicCall from './pages/PublicCall'
import RequireAdmin from './routes/RequireAdmin'

const router = createBrowserRouter([
  { path: '/admin/login', element: <AdminLogin /> },
  { path: '/admin/projects', element: <RequireAdmin><AdminProjects /></RequireAdmin> },
  { path: '/admin/projects/new', element: <RequireAdmin><AdminProjectForm mode="new" /></RequireAdmin> },
  { path: '/admin/projects/:id/edit', element: <RequireAdmin><AdminProjectForm mode="edit" /></RequireAdmin> },
  { path: '/:user/:call', element: <PublicCall /> },
  { path: '/call', element: <PublicCall /> },
  { path: '/', element: <Navigate to="/admin/login" replace /> },
  { path: '*', element: <Navigate to="/admin/login" replace /> }
])

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
