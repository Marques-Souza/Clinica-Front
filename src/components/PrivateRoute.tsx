import { Navigate, Outlet } from 'react-router-dom'
import { hasPerfil } from '../services/auth'

function PrivateRoute({ perfil }: { perfil?: string }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  if (perfil && !hasPerfil(perfil)) return <Navigate to="/home" replace />
  return <Outlet />
}

export default PrivateRoute