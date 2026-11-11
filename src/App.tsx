import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'
import CompleteProfile from './pages/CompleteProfile'
import Layout from './components/Layout'
import NewAppointment from './pages/NewAppointment'
import MyAppointments from './pages/MyAppointments'
import Profile from './pages/Profile'
import Report from './pages/Report'
import SearchAppointment from './pages/SearchAppointment'
import DoctorProfile from './pages/DoctorProfile'
import CreateDoctor from './pages/CreateDoctor'
import HomeSwitch from './pages/HomeSwitch'
import AdminSpecialties from './pages/AdminSpecialties'
import AdminReports from './pages/AdminReports'
import AdminUsers from './pages/AdminUsers'
import AdminDashboard from './pages/AdminDashboard'
import AdminDoctors from './pages/AdminDoctors'
import ChangePassword from './pages/ChangePassword'
import ForgotPassword from './pages/ForgotPassword'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-senha" element={<ForgotPassword />} />
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/home" element={<HomeSwitch />} />
            <Route element={<PrivateRoute perfil={['USER', 'ADMIN']} />}>
              <Route path="/senha" element={<ChangePassword />} />
            </Route>
            <Route element={<PrivateRoute perfil="USER" />}>
              <Route path="/perfil" element={<Profile />} />
              <Route path="/perfil/completar" element={<CompleteProfile />} />
              <Route path="/consultas/nova" element={<NewAppointment />} />
              <Route path="/consultas" element={<MyAppointments />} />
              <Route path="/consultas/buscar" element={<SearchAppointment />} />
              <Route path="/relatorio" element={<Report />} />
            </Route>

            <Route element={<PrivateRoute perfil="DOCTOR" />}>
  <Route path="/medico/perfil" element={<DoctorProfile />} />
</Route>
<Route element={<PrivateRoute perfil="ADMIN" />}>
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
  <Route path="/admin/medicos" element={<AdminDoctors />} />
  <Route path="/admin/medicos/novo" element={<CreateDoctor />} />
  <Route path="/admin/consultas/buscar" element={<SearchAppointment />} />
  <Route path="/admin/especialidades" element={<AdminSpecialties />} />
  <Route path="/admin/relatorios" element={<AdminReports />} />
  <Route path="/admin/usuarios" element={<AdminUsers />} />
</Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App