import { useEffect, useState } from 'react'
import api from '../services/api'

type Appointment = {
  id: string
  appointmentCode: string
  doctor: { fullName: string; specialty: string }
  scheduledAt: string
  durationMinutes: number
  consultationFee: number
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED'
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED'
}

const statusInfo = {
  SCHEDULED: { label: 'Agendada', style: 'bg-blue-100 text-blue-900' },
  COMPLETED: { label: 'Concluída', style: 'bg-green-100 text-green-900' },
  CANCELLED: { label: 'Cancelada', style: 'bg-red-100 text-red-900' },
}

const paymentInfo = {
  PENDING: { label: 'Pagamento pendente', style: 'bg-yellow-100 text-yellow-900' },
  PAID: { label: 'Pago', style: 'bg-green-100 text-green-900' },
  CANCELLED: { label: 'Pagamento cancelado', style: 'bg-slate-200 text-slate-800' },
}

// "2026-11-10 14:30:00" -> "10/11/2026 14:30"
function formatDate(value: string) {
  return new Date(value.replace(' ', 'T')).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    api
      .get('/appointments', { params: { page, size: 10 } })
      .then((response) => {
        setAppointments(response.data.content)
        setTotalPages(response.data.totalPages)
      })
      .catch(() => setError('Não foi possível carregar suas consultas'))
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Minhas consultas</h1>

      {loading && <p className="text-slate-600">Carregando...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <p className="text-slate-600">Você ainda não tem consultas agendadas.</p>
      )}

      <div className="flex flex-col gap-3">
        {appointments.map((a) => (
          <article key={a.id} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-2 mb-1">
              <strong className="text-lg">{a.doctor.specialty}</strong>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo[a.status].style}`}>
                {statusInfo[a.status].label}
              </span>
            </div>
            <p className="text-slate-600">
              {a.doctor.fullName} · {formatDate(a.scheduledAt)} · {a.durationMinutes} min
            </p>
            <p className="text-slate-500 text-sm mb-3">Código {a.appointmentCode}</p>
            <div className="flex items-center justify-between">
              <strong>
                {a.consultationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${paymentInfo[a.paymentStatus].style}`}>
                {paymentInfo[a.paymentStatus].label}
              </span>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-slate-600">Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page + 1 >= totalPages}
            className="h-11 px-4 rounded-xl border border-slate-300 bg-white font-semibold disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

export default MyAppointments