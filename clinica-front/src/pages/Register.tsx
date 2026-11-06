import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import api from '../services/api'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 5 || password.length > 12) {
      setError('A senha deve ter de 5 a 12 caracteres')
      return
    }
    if (password !== confirm) {
      setError('As senhas não conferem')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/register', { email, password })
      navigate('/login')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('E-mail já cadastrado')
      } else {
        setError('Não foi possível criar a conta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white text-2xl font-bold">
            +
          </div>
          <span className="text-xl font-bold">
            Clínica
          </span>
        </div>

        <h1 className="text-3xl font-bold mb-1">Criar conta</h1>
        <p className="text-slate-600 mb-6">Cadastre-se para agendar consultas.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="block text-sm font-semibold mb-1">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"
          />

          <label htmlFor="password" className="block text-sm font-semibold mb-1">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="5 a 12 caracteres"
            className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"
          />

          <label htmlFor="confirm" className="block text-sm font-semibold mb-1">Confirmar senha</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            className="w-full h-12 rounded-xl border border-slate-300 px-4 mb-4"
          />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-brand text-white font-semibold disabled:opacity-60"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center text-slate-600 mt-6">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand font-semibold">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default Register