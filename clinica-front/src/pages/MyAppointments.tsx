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
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [newDate, setNewDate] = useState('')

  async function handleCancel(id: string) {
  if (!window.confirm('Deseja realmente cancelar esta consulta?')) return
  setCancellingId(id)
  setError('')
  try {
    const response = await api.put(`/appointments/${id}`, { status: 'CANCELLED' })
    setAppointments((list) => list.map((a) => (a.id === id ? response.data : a)))
  } catch {
    setError('Não foi possível cancelar a consulta')
  } finally {
    setCancellingId(null)
  }
}

async function handleReschedule(id: string) {
    if (!newDate) {
      setError('Escolha a nova data e hora')
      return
    }
    setError('')
    try {
      // "2026-11-10T14:30" -> "2026-11-10 14:30:00"
      const scheduledAt = newDate.replace('T', ' ') + ':00'
      const response = await api.put(`/appointments/${id}`, { scheduledAt })
      setAppointments((list) => list.map((a) => (a.id === id ? response.data : a)))
      setReschedulingId(null)
      setNewDate('')
    } catch {
      setError('Não foi possível remarcar. A data precisa ser no futuro.')
    }
  }

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
                       {a.status === 'SCHEDULED' && (
              <div className="mt-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setReschedulingId(reschedulingId === a.id ? null : a.id)
                      setNewDate('')
                    }}
                    className="h-11 px-4 rounded-xl border border-teal-700 text-teal-700 font-semibold"
                  >
                    Remarcar
                  </button>
                  <button
                    onClick={() => handleCancel(a.id)}
                    disabled={cancellingId === a.id}
                    className="h-11 px-4 rounded-xl border border-red-300 text-red-700 font-semibold disabled:opacity-60"
                  >
                    {cancellingId === a.id ? 'Cancelando...' : 'Cancelar consulta'}
                  </button>
                </div>

                {reschedulingId === a.id && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <input
                      type="datetime-local"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="h-12 rounded-xl border border-slate-300 px-4 bg-white"
                    />
                    <button
                      onClick={() => handleReschedule(a.id)}
                      className="h-12 px-5 rounded-xl bg-teal-700 text-white font-semibold"
                    >
                      Confirmar nova data
                    </button>
                  </div>
                )}
              </div>
            )}


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