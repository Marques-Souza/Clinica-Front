import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { specialtyLabel } from '../services/specialties'

type Appointment = {
  id: string
  appointmentCode: string
  patient: { fullName: string }
  doctor: { specialty: string }
  scheduledAt: string
  durationMinutes: number
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
  reason: string | null
}

const statusInfo = {
  SCHEDULED: { label: 'Agendada', style: 'bg-blue-100 text-blue-900' },
  COMPLETED: { label: 'Concluída', style: 'bg-green-100 text-green-900' },
  CANCELLED: { label: 'Cancelada', style: 'bg-red-100 text-red-900' },
}

function DoctorAgenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [onlyUpcoming, setOnlyUpcoming] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/appointments', { params: { page: 0, size: 50, sort: 'scheduledAt,asc' } })
      .then((response) => setAppointments(response.data.content))
      .catch(() => setError('Não foi possível carregar sua agenda'))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const visible = appointments.filter((a) => {
    if (!onlyUpcoming) return true
    return a.status === 'SCHEDULED' && new Date(a.scheduledAt.replace(' ', 'T')) >= now
  })

  // agrupa por dia: { "2026-11-18": [consultas...] }
  const byDay: Record<string, Appointment[]> = {}
  visible.forEach((a) => {
    const day = a.scheduledAt.slice(0, 10)
    byDay[day] = [...(byDay[day] ?? []), a]
  })

  const chip = (active: boolean) =>
    `h-11 px-4 rounded-full border font-semibold text-sm ${
      active ? 'bg-brand text-white border-brand' : 'bg-white text-ink border-slate-300'
    }`

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Agenda"
        title="Minhas consultas"
        subtitle="Consultas marcadas com você, por dia e horário."
      />

      <div className="flex gap-2">
        <button onClick={() => setOnlyUpcoming(true)} className={chip(onlyUpcoming)}>
          Próximas
        </button>
        <button onClick={() => setOnlyUpcoming(false)} className={chip(!onlyUpcoming)}>
          Todas
        </button>
      </div>

      {loading && <p className="text-ink-soft">Carregando...</p>}
      {error && <p className="text-red-700">{error}</p>}
      {!loading && !error && visible.length === 0 && (
        <Card>
          <p className="text-ink">Nenhuma consulta {onlyUpcoming ? 'próxima' : ''} por aqui.</p>
          <p className="text-ink-soft text-sm mt-1">
            Confira se seu perfil está completo em{' '}
            <Link to="/medico/perfil" className="text-brand font-semibold">Meu perfil</Link>.
          </p>
        </Card>
      )}

      {Object.entries(byDay).map(([day, list]) => (
        <section key={day}>
          <h2 className="font-bold text-ink capitalize mb-3">
            {new Date(day + 'T00:00:00').toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </h2>
          <div className="flex flex-col gap-3">
            {list.map((a) => (
              <Card key={a.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-2xl font-bold text-brand-dark">{a.scheduledAt.slice(11, 16)}</p>
                    <p className="font-semibold text-ink">{a.patient.fullName}</p>
                    <p className="text-sm text-ink-soft">
                      {specialtyLabel(a.doctor.specialty)} · {a.durationMinutes} min
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo[a.status].style}`}>
                    {statusInfo[a.status].label}
                  </span>
                </div>
                {a.reason && <p className="text-sm text-ink mt-3">Motivo: {a.reason}</p>}
                <p className="text-xs text-ink-soft mt-2">Código {a.appointmentCode}</p>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default DoctorAgenda