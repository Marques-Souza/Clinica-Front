import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from './Logo'

function Layout() {
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    `px-4 h-11 flex items-center rounded-xl font-semibold ${
      isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-600'
    }`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <button onClick={logout} className="h-11 px-4 font-semibold text-slate-600">
            Sair
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-6 pb-3 flex gap-2 overflow-x-auto">
          <NavLink to="/home" className={link}>Início</NavLink>
          <NavLink to="/consultas/nova" className={link}>Agendar consulta</NavLink>
          <NavLink to="/consultas" className={link}>Minhas consultas</NavLink>
          <NavLink to="/perfil" className={link}>Meu perfil</NavLink>
          <NavLink to="/relatorio" className={link}>Relatório</NavLink>
        </nav>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout