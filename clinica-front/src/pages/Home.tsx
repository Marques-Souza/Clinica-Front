import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { hasPerfil } from '../services/auth'

type Appointment = {
  id: string
  appointmentCode: string
  doctor: { fullName: string; specialty: string }
  scheduledAt: string
  durationMinutes: number
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
}

function toDate(value: string) {
  return new Date(value.replace(' ', 'T'))
}

function Home() {
  const [next, setNext] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    if (!hasPerfil('USER')) {
  setLoading(false)
  return
}
    api
      .get('/appointments', { params: { page: 0, size: 50 } })
      .then((response) => {
        const upcoming = (response.data.content as Appointment[])
          .filter((a) => a.status === 'SCHEDULED' && toDate(a.scheduledAt) > new Date())
          .sort((a, b) => toDate(a.scheduledAt).getTime() - toDate(b.scheduledAt).getTime())
        setNext(upcoming[0] ?? null)
      })
      .catch(() => setNext(null))
      .finally(() => setLoading(false))
  }, [])

  if (!hasPerfil('USER')) {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Início" title="Olá!" subtitle="Bem-vindo ao sistema." />

      {hasPerfil('ADMIN') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/admin/medicos/novo"
            className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-ink hover:border-brand hover:shadow-md transition"
          >
            Criar médico
          </Link>
          <Link
            to="/admin/especialidades"
            className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-ink hover:border-brand hover:shadow-md transition"
          >
            Especialidades
          </Link>
        </div>
      )}
    </div>
  )
}

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Início" title="Olá!" subtitle="Bem-vindo de volta" />

      <Card variant="brand" className="text-white">
        <p className="text-sm font-semibold tracking-wide">PRÓXIMA CONSULTA</p>
        {loading && <p className="mt-2">Carregando...</p>}
        {!loading && !next && (
          <p className="mt-2 text-lg">Você não tem consultas agendadas.</p>
        )}
        {next && (
          <>
            <p className="mt-2 text-2xl font-bold">{next.doctor.specialty}</p>
            <p>{next.doctor.fullName}</p>
            <p className="mt-3 font-semibold">
              {toDate(next.scheduledAt).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}{' '}
              · {next.durationMinutes} min
            </p>
          </>
        )}
      </Card>

      <Link
        to="/consultas/nova"
        className="flex h-12 items-center justify-center rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        Agendar consulta
      </Link>

      <div className="space-y-3">
        <h2 className="font-bold text-ink">Atalhos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Card compact className="min-h-16 transition hover:border-brand hover:shadow-md">
            <Link to="/consultas" className="flex min-h-16 items-center rounded-2xl p-5 font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Minhas consultas
            </Link>
          </Card>
          <Card compact className="min-h-16 transition hover:border-brand hover:shadow-md">
            <Link to="/perfil" className="flex min-h-16 items-center rounded-2xl p-5 font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Meu perfil
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home