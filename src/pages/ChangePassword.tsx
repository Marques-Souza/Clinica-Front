import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 5 || newPassword.length > 12) {
      setError('A nova senha deve ter de 5 a 12 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não conferem')
      return
    }

    setLoading(true)
    try {
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
        confirmPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Senha atualizada com sucesso')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setError('A senha atual está incorreta ou a confirmação não confere')
      } else if (isAxiosError(err) && err.response?.status === 422) {
        setError('Confira os dados: as senhas devem ter de 5 a 12 caracteres')
      } else {
        setError('Não foi possível atualizar a senha. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const input =
    'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'
  const label = 'mb-1 block text-sm font-semibold text-ink'

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Conta"
        title="Alterar senha"
        subtitle="Informe sua senha atual e escolha uma nova senha."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className={label}>Senha atual</label>
            <input
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              minLength={5}
              maxLength={12}
              required
              className={input}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className={label}>Nova senha</label>
            <input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={5}
              maxLength={12}
              required
              className={input}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={label}>Confirmar nova senha</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={5}
              maxLength={12}
              required
              className={input}
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {success && <p role="status" className="text-sm text-green-800">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Atualizando...' : 'Atualizar senha'}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default ChangePassword
