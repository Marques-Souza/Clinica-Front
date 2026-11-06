import {useState, type FormEvent} from 'react'
import api from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { getPerfil } from '../services/auth'

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
      if (getPerfil()?.includes('USER')) {
  try {
    await api.get('/clients/me')
    navigate('/home')
  } catch {
    navigate('/perfil/completar')
  }
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
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white text-2xl font-bold">
          +
        </div>
        <span className="text-xl font-bold">
          Clínica<span className="text-teal-700">Vida</span>
        </span>
      </div>
    

    <h1 className="text-3xl font-bold mb-1">Entrar</h1>
    <p className="text-slate-600 mb-6">Acesse sua conta para agendar consultas.</p>

    <form onSubmit={handlerSubmit}>
    <label htmlFor="email" className="block text-sm font-semibold mb-1">E-mail</label>
    <input
      id="email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="Digite seu e-mail"
      className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"/>

    <label htmlFor="password" className="block text-sm font-semibold mb-1">senha</label>
    <input
      id="password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Digite sua senha"
      className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"/>

    {error && (
      <p className="text-red-500 text-sm mb-4">{error}</p>
    )}

    <button 
      type="submit"
      disabled={loading}
      className="w-full h-12 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-60 "
    >
      {loading ? 'Entrando...' : 'Entrar'}
    </button>
    </form>

    <p className="text-center text-slate-500 mt-6">
      Ainda não tem conta?{' '}
      <Link to="/register" className="text-teal-700 font-semibold">Criar conta</Link>
    </p>
  </div>
  </div>
  )
}

export default Login