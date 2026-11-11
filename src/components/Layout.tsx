import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { hasPerfil } from '../services/auth'

function Layout() {
  const navigate = useNavigate()
  const isUser = hasPerfil('USER')
  const isDoctor = hasPerfil('DOCTOR')
  const isAdmin = hasPerfil('ADMIN')

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const link = ({ isActive }: { isActive: boolean }) =>
    `flex h-11 items-center justify-center rounded-xl px-2 text-center text-xs font-semibold transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-4 sm:text-sm ${
      isActive ? 'bg-white/15 text-white' : 'text-white/80'
    }`

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-brand-dark border-b-4 border-accent">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo onDark />
          <button onClick={logout} className="h-11 px-2 sm:px-4 font-semibold text-white">
            Sair
          </button>
        </div>

        <nav className="max-w-5xl mx-auto px-4 sm:px-6 pb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <NavLink to="/home" end className={link}>Início</NavLink>
          {isUser && (
            <>
              <NavLink to="/consultas/nova" className={link}>Agendar consulta</NavLink>
              <NavLink to="/consultas" end className={link}>Minhas consultas</NavLink>
              <NavLink to="/consultas/buscar" className={link}>Buscar por código</NavLink>
              <NavLink to="/perfil" className={link}>Meu perfil</NavLink>
              <NavLink to="/relatorio" className={link}>Relatório</NavLink>
            </>
          )}

             {isDoctor && (
    <NavLink to="/medico/perfil" className={link}>Meu perfil</NavLink>
  )}

  {isAdmin && (
    <>
      <NavLink to="/admin/medicos/novo" className={link}>Criar médico</NavLink>
      <NavLink to="/admin/especialidades" className={link}>Especialidades</NavLink>
      <NavLink to="/admin/relatorios" className={link}>Relatórios</NavLink>
      <NavLink to="/admin/usuarios" className={link}>Usuários</NavLink>
    </>
  )}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout