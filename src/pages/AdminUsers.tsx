import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

type User = {
  id: string
  email: string
  perfil: string
}

type PasswordResetAudit = {
  id: string
  actorEmailMasked: string
  targetEmailMasked: string
  createdAt: string
}

const filters = [
  { value: '', label: 'Todos' },
  { value: 'USER', label: 'Pacientes' },
  { value: 'DOCTOR', label: 'Médicos' },
  { value: 'ADMIN', label: 'Admins' },
]

function perfilInfo(perfil: string) {
  if (perfil.includes('ADMIN')) return { label: 'Admin', style: 'bg-purple-100 text-purple-900' }
  if (perfil.includes('DOCTOR')) return { label: 'Médico', style: 'bg-blue-100 text-blue-900' }
  return { label: 'Paciente', style: 'bg-green-100 text-green-900' }
}

function maskEmail(email: string) {
  const atIndex = email.lastIndexOf('@')
  if (atIndex <= 0 || atIndex === email.length - 1) return '***'

  const localPart = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)
  const lastDotIndex = domain.lastIndexOf('.')
  const domainName = lastDotIndex > 0 ? domain.slice(0, lastDotIndex) : domain
  const suffix = lastDotIndex > 0 ? domain.slice(lastDotIndex) : ''

  return `${localPart[0]}***@${domainName[0]}***${suffix}`
}

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)
  const [auditPage, setAuditPage] = useState(0)
  const [auditTotalPages, setAuditTotalPages] = useState(0)
  const [passwordResetAudits, setPasswordResetAudits] = useState<PasswordResetAudit[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')
  const [auditRetry, setAuditRetry] = useState(0)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const nextSearch = searchInput.trim()
      if (nextSearch === search) return

      setLoading(true)
      setError('')
      setSearch(nextSearch)
      setPage(0)
    }, 300)

    return () => window.clearTimeout(timeout)
  }, [searchInput, search])

  useEffect(() => {
    const controller = new AbortController()
    api
      .get('/users', {
        params: {
          page,
          size: 20,
          search: search || undefined,
          perfil: filter || undefined,
        },
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return
        setUsers(response.data.content)
        setTotalPages(response.data.totalPages)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError('Não foi possível carregar os usuários')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [page, search, filter])

  function goToPage(nextPage: number) {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  useEffect(() => {
    if (!auditOpen) return

    const controller = new AbortController()
    api
      .get('/users/audit/password-resets', {
        params: { page: auditPage, size: 10 },
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted) return
        setPasswordResetAudits(response.data.content)
        setAuditTotalPages(response.data.totalPages)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAuditError('Não foi possível carregar o histórico de redefinições')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAuditLoading(false)
      })

    return () => controller.abort()
  }, [auditOpen, auditPage, auditRetry])

  const chip = (active: boolean) =>
    `h-11 px-4 rounded-full border font-semibold text-sm ${
      active ? 'bg-brand text-white border-brand' : 'bg-white text-ink border-slate-300'
    }`

  function openPasswordReset(user: User) {
    setPasswordTarget(user)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
  }

  function closePasswordReset() {
    setPasswordTarget(null)
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordTarget) return

    if (newPassword.length < 5 || newPassword.length > 12) {
      setPasswordError('A nova senha deve ter de 5 a 12 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A nova senha e a confirmação não conferem')
      return
    }

    setPasswordLoading(true)
    try {
      await api.patch(`/users/${passwordTarget.id}/password/reset`, {
        newPassword,
        confirmPassword,
      })
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess('Senha do médico redefinida com sucesso')
      if (auditOpen) {
        setAuditPage(0)
        setAuditLoading(true)
        setAuditError('')
        setAuditRetry((retry) => retry + 1)
      }
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setPasswordError('A nova senha e a confirmação não conferem')
      } else if (isAxiosError(err) && err.response?.status === 422) {
        setPasswordError('A senha deve ter de 5 a 12 caracteres')
      } else if (isAxiosError(err) && err.response?.status === 403) {
        setPasswordError('Você não tem permissão para redefinir esta senha')
      } else {
        setPasswordError('Não foi possível redefinir a senha. Tente novamente.')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        subtitle="Consulte os acessos e redefina senhas de médicos."
      />

      <div className="space-y-3">
        <label htmlFor="search" className="sr-only">Buscar por e-mail</label>
        <input
          id="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar por e-mail"
          className="w-full h-12 rounded-xl border border-brand/20 px-4 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-brand"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => {
                if (filter !== f.value) {
                  setFilter(f.value)
                  setPage(0)
                  setLoading(true)
                  setError('')
                }
              }}
              className={chip(filter === f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-ink-soft">Carregando...</p>}
      {error && <p className="text-red-700">{error}</p>}
      {!loading && !error && users.length === 0 && (
        <p className="text-ink-soft">Nenhum usuário encontrado.</p>
      )}

      <div className="flex flex-col gap-3">
        {users.map((u) => {
          const info = perfilInfo(u.perfil)
          return (
            <Card key={u.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-500 break-all">
                    <span
                      role="img"
                      aria-label="E-mail mascarado"
                      className="inline-block select-none blur-[2px] opacity-60"
                    >
                      {maskEmail(u.email)}
                    </span>
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${info.style}`}>
                      {info.label}
                    </span>
                    {u.perfil.includes('DOCTOR') && (
                      <button
                        type="button"
                        disabled={passwordLoading}
                        onClick={() => openPasswordReset(u)}
                        className="h-10 rounded-xl border border-brand px-3 text-xs font-semibold text-brand hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
                      >
                        Redefinir senha
                      </button>
                    )}
                  </div>
                </div>

                {passwordTarget?.id === u.id && (
                  <form onSubmit={handlePasswordReset} className="space-y-3 border-t border-slate-200 pt-4">
                    <p className="font-semibold text-ink">Redefinir senha do médico</p>
                    <div>
                      <label htmlFor="adminNewPassword" className="mb-1 block text-sm font-semibold text-ink">
                        Nova senha
                      </label>
                      <input
                        id="adminNewPassword"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        minLength={5}
                        maxLength={12}
                        required
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="adminConfirmPassword" className="mb-1 block text-sm font-semibold text-ink">
                        Confirmar nova senha
                      </label>
                      <input
                        id="adminConfirmPassword"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        minLength={5}
                        maxLength={12}
                        required
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    {passwordError && <p role="alert" className="text-sm text-red-700">{passwordError}</p>}
                    {passwordSuccess && <p role="status" className="text-sm text-green-800">{passwordSuccess}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={passwordLoading}
                        className="h-11 rounded-xl bg-brand px-4 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                      >
                        {passwordLoading ? 'Salvando...' : 'Salvar nova senha'}
                      </button>
                      <button
                        type="button"
                        onClick={closePasswordReset}
                        disabled={passwordLoading}
                        className="h-11 rounded-xl border border-slate-300 px-4 font-semibold text-ink disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <section className="space-y-3">
        <button
          type="button"
          aria-expanded={auditOpen}
          onClick={() => {
            const shouldOpen = !auditOpen
            setAuditOpen(shouldOpen)
            if (shouldOpen) {
              setAuditPage(0)
              setAuditLoading(true)
              setAuditError('')
            }
          }}
          className="h-11 rounded-xl border border-brand px-4 font-semibold text-brand hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {auditOpen ? 'Ocultar histórico' : 'Histórico de redefinições'}
        </button>

        {auditOpen && (
          <div className="space-y-3">
            {auditLoading && <p className="text-ink-soft">Carregando histórico...</p>}
            {auditError && (
              <div className="flex flex-wrap items-center gap-3">
                <p role="alert" className="text-red-700">{auditError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setAuditLoading(true)
                    setAuditError('')
                    setAuditRetry((retry) => retry + 1)
                  }}
                  className="font-semibold text-brand underline"
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {!auditLoading && !auditError && passwordResetAudits.length === 0 && (
              <p className="text-ink-soft">Nenhuma redefinição de senha registrada.</p>
            )}
            {!auditError && passwordResetAudits.map((audit) => (
              <Card key={audit.id}>
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-ink">
                    Senha de <span className="font-semibold">{audit.targetEmailMasked}</span>
                    {' '}redefinida por <span className="font-semibold">{audit.actorEmailMasked}</span>
                  </p>
                  <time className="shrink-0 text-ink-soft" dateTime={audit.createdAt}>
                    {new Date(audit.createdAt).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </time>
                </div>
              </Card>
            ))}

            {auditTotalPages > 1 && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setAuditLoading(true)
                    setAuditError('')
                    setAuditPage(auditPage - 1)
                  }}
                  disabled={auditPage === 0 || auditLoading}
                  className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-ink disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-ink-soft">
                  Página {auditPage + 1} de {auditTotalPages}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuditLoading(true)
                    setAuditError('')
                    setAuditPage(auditPage + 1)
                  }}
                  disabled={auditPage + 1 >= auditTotalPages || auditLoading}
                  className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-ink disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-ink disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-ink-soft">Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page + 1 >= totalPages}
            className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-ink disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminUsers