import { Navigate, Outlet } from 'react-router-dom'
import { hasPerfil } from '../services/auth'

function PrivateRoute({ perfil }: { perfil?: string | string[] }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  const allowed = Array.isArray(perfil) ? perfil.some(hasPerfil) : perfil ? hasPerfil(perfil) : true
  if (!allowed) return <Navigate to="/home" replace />
  return <Outlet />
}

export default PrivateRoute