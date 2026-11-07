import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

function CreateDoctor() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (password.length < 5 || password.length > 12) {
      setError('A senha deve ter de 5 a 12 caracteres')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/doctor', { email, password })
      setSuccess(`Usuário criado para ${email}. O médico deve entrar e completar o perfil.`)
      setEmail('')
      setPassword('')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('E-mail já cadastrado')
      } else {
        setError('Não foi possível criar o médico')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Criar médico"
        subtitle="Cria o acesso do médico. Os dados profissionais ele preenche no primeiro login."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-ink">E-mail do médico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-semibold text-ink">Senha inicial</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="5 a 12 caracteres"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="text-sm text-green-800">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Criando...' : 'Criar médico'}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default CreateDoctor