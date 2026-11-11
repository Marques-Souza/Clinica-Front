import { Navigate } from 'react-router-dom'
import { hasPerfil } from '../services/auth'
import Home from './Home'
import DoctorAgenda from './DoctorAgenda'

function HomeSwitch() {
  if (hasPerfil('ADMIN')) return <Navigate to="/admin/dashboard" replace />
  return hasPerfil('DOCTOR') ? <DoctorAgenda /> : <Home />
}

export default HomeSwitch