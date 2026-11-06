import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import PrivateRoute from './components/PrivateRoute'
import CompleteProfile from './pages/CompleteProfile'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<PrivateRoute />}>
        <Route path="/home" element={<Home />} />
        <Route path="/perfil/completar" element={<CompleteProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
        
      </Routes>
    </BrowserRouter>
  )
}

export default App