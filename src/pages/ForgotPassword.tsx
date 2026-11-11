import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [step, setStep] = useState<'request' | 'confirm' | 'done'>('request')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      await api.post('/auth/password-recovery/request', { email })
      setStep('confirm')
      setMessage('Se houver uma conta de cliente com esse e-mail, enviaremos um código válido por 10 minutos.')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 503) {
        setError('O envio de e-mail está temporariamente indisponível. Tente novamente mais tarde.')
      } else {
        setError('Não foi possível solicitar a recuperação. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

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
      await api.post('/auth/password-recovery/confirm', {
        email,
        code,
        newPassword,
        confirmPassword,
      })
      setStep('done')
      setMessage('Senha redefinida com sucesso. Você já pode entrar com a nova senha.')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setError('Código inválido ou expirado. Confira o código e tente novamente.')
      } else if (isAxiosError(err) && err.response?.status === 422) {
        setError('Confira os dados informados e tente novamente.')
      } else {
        setError('Não foi possível redefinir a senha. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const input =
    'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'
  const label = 'mb-1 block text-sm font-semibold text-ink'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-5">
        <PageHeader
          eyebrow="Conta"
          title="Recuperar senha"
          subtitle="A recuperação por código está disponível para contas de cliente."
        />

        {step === 'request' && (
          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label htmlFor="recoveryEmail" className={label}>E-mail cadastrado</label>
              <input
                id="recoveryEmail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className={input}
              />
            </div>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              {loading ? 'Enviando...' : 'Enviar código'}
            </button>
          </form>
        )}

        {step === 'confirm' && (
          <>
            <p role="status" className="text-sm text-ink-soft">{message}</p>
            <form onSubmit={handleConfirmCode} className="space-y-4">
              <div>
                <label htmlFor="recoveryCode" className={label}>Código de 6 dígitos</label>
                <input
                  id="recoveryCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
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
                  minLength={5}
                  maxLength={12}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
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
                  minLength={5}
                  maxLength={12}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  className={input}
                />
              </div>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
              >
                {loading ? 'Redefinindo...' : 'Redefinir senha'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('request')
                  setCode('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setError('')
                  setMessage('')
                }}
                disabled={loading}
                className="w-full text-sm font-semibold text-brand hover:underline disabled:opacity-60"
              >
                Usar outro e-mail ou solicitar outro código
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <p role="status" className="text-sm text-green-800">{message}</p>
        )}

        <p className="text-center text-sm text-ink-soft">
          <Link to="/login" className="font-semibold text-brand hover:underline">Voltar para o login</Link>
        </p>
      </Card>
    </div>
  )
}

export default ForgotPassword
