import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

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

type Availability = {
  durationMinutes: number
  availableSlots: string[]
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

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function MyAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [page, setPage] = useState(0)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reschedulingId, setReschedulingId] = useState<string | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityVersion, setAvailabilityVersion] = useState(0)
  const [rescheduleError, setRescheduleError] = useState('')
  const [savingRescheduleId, setSavingRescheduleId] = useState<string | null>(null)

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
    if (!rescheduleDate || !selectedSlot) {
      setRescheduleError('Escolha uma data e um horário disponível')
      return
    }
    setSavingRescheduleId(id)
    setRescheduleError('')
    try {
      const scheduledAt = `${rescheduleDate} ${selectedSlot}:00`
      const response = await api.put(`/appointments/${id}`, { scheduledAt })
      setAppointments((list) => list.map((a) => (a.id === id ? response.data : a)))
      setReschedulingId(null)
      setRescheduleDate('')
      setSelectedSlot('')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setRescheduleError('Esse horário não está mais disponível. Escolha outro.')
        setSelectedSlot('')
        setAvailability(null)
        setAvailabilityError('')
        setAvailabilityLoading(true)
        setAvailabilityVersion((current) => current + 1)
      } else if (isAxiosError(err) && err.response?.status === 422) {
        setRescheduleError('A nova data precisa estar no futuro.')
      } else {
        setRescheduleError('Não foi possível remarcar a consulta. Tente novamente.')
      }
    } finally {
      setSavingRescheduleId(null)
    }
  }

  useEffect(() => {
    if (!reschedulingId || !rescheduleDate) return

    const controller = new AbortController()

    api
      .get<Availability>(`/appointments/${reschedulingId}/available-slots`, {
        params: { date: rescheduleDate },
        signal: controller.signal,
      })
      .then(({ data }) => {
        if (!controller.signal.aborted) setAvailability(data)
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setAvailabilityError('Não foi possível consultar os horários disponíveis.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setAvailabilityLoading(false)
      })

    return () => controller.abort()
  }, [reschedulingId, rescheduleDate, availabilityVersion])

  useEffect(() => {
    api
      .get('/appointments', { params: { page, size: 10 } })
      .then((response) => {
        setAppointments(response.data.content)
        setTotalPages(response.data.totalPages)
      })
      .catch(() => setError('Não foi possível carregar suas consultas'))
      .finally(() => setLoading(false))
  }, [page])

  function goToPage(nextPage: number) {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Consultas" title="Minhas consultas" />

      {loading && <p className="text-ink-soft">Carregando...</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}

      {!loading && !error && appointments.length === 0 && (
        <Card><p className="text-ink-soft">Você ainda não tem consultas agendadas.</p></Card>
      )}

      <div className="flex flex-col gap-6">
        {appointments.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <strong className="text-lg text-ink">{a.doctor.specialty}</strong>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusInfo[a.status].style}`}>
                {statusInfo[a.status].label}
              </span>
            </div>
            <p className="text-ink-soft">
              {a.doctor.fullName} · {formatDate(a.scheduledAt)} · {a.durationMinutes} min
            </p>
            <p className="mb-3 text-sm text-ink-soft">Código {a.appointmentCode}</p>
            <div className="flex items-center justify-between">
              <strong className="text-ink">
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
                    type="button"
                    disabled={savingRescheduleId === a.id}
                    onClick={() => {
                      const shouldOpen = reschedulingId !== a.id
                      setReschedulingId(shouldOpen ? a.id : null)
                      setRescheduleDate('')
                      setSelectedSlot('')
                      setRescheduleError('')
                      setAvailability(null)
                      setAvailabilityError('')
                      setAvailabilityLoading(false)
                    }}
                    className="h-12 rounded-xl border border-brand px-6 font-semibold text-brand transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
                  >
                    Remarcar
                  </button>
                  <button
                    onClick={() => handleCancel(a.id)}
                    disabled={cancellingId === a.id}
                    className="h-12 rounded-xl border border-red-300 px-6 font-semibold text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"
                  >
                    {cancellingId === a.id ? 'Cancelando...' : 'Cancelar consulta'}
                  </button>
                </div>

                {reschedulingId === a.id && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <label htmlFor={`reschedule-date-${a.id}`} className="mb-1 block text-sm font-semibold text-ink">
                        Nova data
                      </label>
                      <input
                        id={`reschedule-date-${a.id}`}
                        type="date"
                        value={rescheduleDate}
                        min={toDateInputValue(new Date())}
                        onChange={(event) => {
                          const nextDate = event.target.value
                          setRescheduleDate(nextDate)
                          setSelectedSlot('')
                          setRescheduleError('')
                          setAvailability(null)
                          setAvailabilityError('')
                          setAvailabilityLoading(Boolean(reschedulingId && nextDate))
                        }}
                        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    {availabilityLoading && (
                      <p role="status" className="text-sm text-ink-soft">Consultando horários disponíveis...</p>
                    )}
                    {availabilityError && <p role="alert" className="text-sm text-red-700">{availabilityError}</p>}
                    {availability?.availableSlots.length === 0 && !availabilityLoading && (
                      <p className="text-sm text-ink-soft">Não há horários disponíveis nessa data.</p>
                    )}
                    {availability && availability.availableSlots.length > 0 && (
                      <fieldset>
                        <legend className="mb-2 text-sm font-semibold text-ink">
                          Horários disponíveis · {availability.durationMinutes} min
                        </legend>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {availability.availableSlots.map((slot) => {
                            const selected = selectedSlot === slot
                            return (
                              <button
                                key={slot}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => {
                                  setSelectedSlot(slot)
                                  setRescheduleError('')
                                }}
                                className={`h-11 rounded-xl border font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                                  selected
                                    ? 'border-brand bg-brand text-white'
                                    : 'border-slate-300 bg-white text-ink hover:border-brand'
                                }`}
                              >
                                {slot}
                              </button>
                            )
                          })}
                        </div>
                      </fieldset>
                    )}
                    {rescheduleError && <p role="alert" className="text-sm text-red-700">{rescheduleError}</p>}
                    <button
                      type="button"
                      onClick={() => handleReschedule(a.id)}
                      disabled={!rescheduleDate || !selectedSlot || savingRescheduleId === a.id}
                      className="h-12 rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
                    >
                      {savingRescheduleId === a.id ? 'Remarcando...' : 'Confirmar novo horário'}
                    </button>
                  </div>
                )}
              </div>
            )}


          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="h-12 rounded-xl border border-brand px-4 font-semibold text-brand transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-ink-soft">Página {page + 1} de {totalPages}</span>
          <button
            onClick={() => goToPage(page + 1)}
            disabled={page + 1 >= totalPages}
            className="h-12 rounded-xl border border-brand px-4 font-semibold text-brand transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

export default MyAppointments