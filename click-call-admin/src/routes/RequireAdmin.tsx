import { Navigate, useLocation } from 'react-router-dom'
import { isLoggedIn } from '../lib/auth'
import { PropsWithChildren } from 'react'

export default function RequireAdmin({ children }: PropsWithChildren) {
  const loc = useLocation()
  if (!isLoggedIn()) return <Navigate to="/admin/login" state={{ from: loc }} replace />
  return children
}
