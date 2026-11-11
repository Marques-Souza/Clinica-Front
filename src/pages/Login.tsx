import {useState, type FormEvent} from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { getPerfil } from '../services/auth'
import Card from '../components/Card'

function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handlerSubmit(e: FormEvent){
    e.preventDefault()
    setError('')
    setLoading(true)

   try{
      const response = await api.post('/auth', {email, password})
      localStorage.setItem('token', response.data.token)

      const perfil = getPerfil()

      if (perfil?.includes('USER')) {
        try {
          await api.get('/clients/me')
          navigate('/home')
        } catch {
          navigate('/perfil/completar')
        }
      } else if (perfil?.includes('DOCTOR')) {
        navigate('/medico/perfil')
      } else {
        navigate('/home')
      }

    }catch{
      setError('E-mail ou senha inválidos')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white text-2xl font-bold">
          +
        </div>
        <span className="text-xl font-bold">
          Clínica
        </span>
      </div>
    

    <h1 className="mb-1 text-3xl font-bold text-ink">Entrar</h1>
    <p className="mb-6 text-ink-soft">Acesse sua conta para agendar consultas.</p>

    <form onSubmit={handlerSubmit}>
    <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ink">E-mail</label>
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Digite seu e-mail"
      className="mb-4 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"/>

    <label htmlFor="password" className="mb-1 block text-sm font-semibold text-ink">senha</label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Digite sua senha"
      className="mb-4 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"/>

    {error && (
      <p className="mb-4 text-sm text-red-700">{error}</p>
    )}

    <button 
      type="submit"
      disabled={loading}
      className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
    >
      {loading ? 'Entrando...' : 'Entrar'}
    </button>
    </form>

    <p className="mt-6 text-center text-ink-soft">
      Ainda não tem conta?{' '}
      <Link to="/register" className="text-brand font-semibold">Criar conta</Link>
    </p>
      </Card>
  </div>
  )
}

export default Login