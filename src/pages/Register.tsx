import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import api from '../services/api'
import Card from '../components/Card'
import Logo from '../components/Logo'

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
      <Card className="w-full max-w-sm">
        <div className="-mx-6 -mt-6 mb-6 rounded-t-2xl border-b-4 border-accent bg-brand-dark px-5 py-3">
          <Logo onDark />
        </div>

        <h1 className="mb-1 text-3xl font-bold text-ink">Criar conta</h1>
        <p className="mb-6 text-ink-soft">Cadastre-se para agendar consultas.</p>

        <form onSubmit={handleSubmit} className="text-ink">
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            className="mb-4 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <label htmlFor="password" className="mb-1 block text-sm font-semibold">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="5 a 12 caracteres"
            className="mb-4 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <label htmlFor="confirm" className="mb-1 block text-sm font-semibold">Confirmar senha</label>
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repita a senha"
            className="mb-4 h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
          />

          {error && <p className="mb-4 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
          >
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <p className="mt-6 text-center text-ink-soft">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand font-semibold">Entrar</Link>
        </p>
      </Card>
    </div>
  )
}

export default Register