import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

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

  const shortcut =
    'bg-white rounded-2xl border border-slate-200 p-5 font-semibold min-h-11'

  return (
    <div className="max-w-3xl">
      <p className="text-slate-600">Bem-vindo de volta</p>
      <h1 className="text-3xl font-bold mb-6">Olá!</h1>

      <section className="bg-brand text-white rounded-2xl p-6 mb-4">
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
      </section>

      <Link
        to="/consultas/nova"
        className="flex items-center justify-center h-12 rounded-xl bg-brand text-white font-semibold mb-8"
      >
        Agendar consulta
      </Link>

      <h2 className="font-bold mb-3">Atalhos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link to="/consultas" className={shortcut}>Minhas consultas</Link>
        <Link to="/perfil" className={shortcut}>Meu perfil</Link>
      </div>
    </div>
  )
}

export default Home