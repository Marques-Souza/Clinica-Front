import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'
import CompleteProfile from './pages/CompleteProfile'
import Layout from './components/Layout'
import NewAppointment from './pages/NewAppointment'
import MyAppointments from './pages/MyAppointments'
import Profile from './pages/Profile'
import Report from './pages/Report'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/perfil/completar" element={<CompleteProfile />} />
        <Route path="/consultas/nova" element={<NewAppointment />} />
        <Route path="/consultas" element={<MyAppointments />} />
        <Route path="/relatorio" element={<Report />} />
        
        </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
       
        
      </Routes>
    </BrowserRouter>
  )
}

export default App