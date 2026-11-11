import { useEffect, useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

type User = {
  id: string
  email: string
  perfil: string
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

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .get('/users', { params: { page, size: 20 } })
      .then((response) => {
        setUsers(response.data.content)
        setTotalPages(response.data.totalPages)
      })
      .catch(() => setError('Não foi possível carregar os usuários'))
      .finally(() => setLoading(false))
  }, [page])

  const visible = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) &&
      (filter === '' || u.perfil.includes(filter)),
  )

  const chip = (active: boolean) =>
    `h-11 px-4 rounded-full border font-semibold text-sm ${
      active ? 'bg-brand text-white border-brand' : 'bg-white text-ink border-slate-300'
    }`

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Usuários"
        subtitle="Todos os acessos cadastrados no sistema."
      />

      <div className="space-y-3">
        <label htmlFor="search" className="sr-only">Buscar por e-mail</label>
        <input
          id="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por e-mail"
          className="w-full h-12 rounded-xl border border-brand/20 px-4 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-brand"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={chip(filter === f.value)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-ink-soft">Carregando...</p>}
      {error && <p className="text-red-700">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="text-ink-soft">Nenhum usuário encontrado.</p>
      )}

      <div className="flex flex-col gap-3">
        {visible.map((u) => {
          const info = perfilInfo(u.perfil)
          return (
            <Card key={u.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink break-all">{u.email}</p>
                <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full ${info.style}`}>
                  {info.label}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold text-ink disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-ink-soft">Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
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