import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { specialties, specialtyLabel } from '../services/specialties'

const payments = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
  { value: 'CASH', label: 'Dinheiro' },
]

type Appointment = {
  appointmentCode: string
  scheduledAt: string
  consultationFee: number
  doctor: { fullName: string }
}

type Availability = {
  durationMinutes: number
  consultationFee: number
  availableSlots: string[]
}

// "2026-11-10T14:30" -> "10/11/2026 14:30"
function toApiDate(value: string) {
  const [date, time] = value.split('T')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} ${time}`
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatAppointmentDateTime(value: string) {
  const [date, time] = value.replace('T', ' ').split(' ')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} às ${time.slice(0, 5)}`
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function NewAppointment() {
  const [specialty, setSpecialty] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [date, setDate] = useState('')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [availabilityVersion, setAvailabilityVersion] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Appointment | null>(null)
  const selectedSlotIsAvailable = Boolean(
    availability
      && scheduledAt.startsWith(`${date}T`)
      && availability.availableSlots.includes(scheduledAt.slice(11)),
  )
  const fieldClass =
    'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink accent-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'

  useEffect(() => {
    if (!specialty || !date) return

    const controller = new AbortController()

    api
      .get<Availability>('/appointments/available-slots', {
        params: { specialty, date },
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
  }, [specialty, date, availabilityVersion])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!specialty) {
      setError('Escolha uma especialidade')
      return
    }
    if (!scheduledAt) {
      setError('Escolha um horário disponível')
      return
    }
    setLoading(true)
    try {
      const response = await api.post('/appointments', {
        specialty,
        scheduledAt: toApiDate(scheduledAt),
        paymentMethod,
        reason,
      })
      setCreated(response.data)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('Esse horário acabou de ser reservado. Escolha outro.')
        setScheduledAt('')
        setAvailability(null)
        setAvailabilityError('')
        setAvailabilityLoading(true)
        setAvailabilityVersion((current) => current + 1)
      } else if (isAxiosError(err) && err.response?.status === 404) {
        setError('Especialidade sem médico disponível, ou perfil de paciente incompleto.')
      } else {
        setError('Não foi possível agendar. Confira os dados.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (created) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader eyebrow="Agendamento" title="Consulta agendada!" />
        <Card className="max-w-3xl">
          <p className="text-ink-soft">Código da consulta</p>
          <p className="mb-4 text-xl font-bold text-ink">{created.appointmentCode}</p>
          <p className="text-ink-soft">Data e horário</p>
          <p className="mb-4 font-semibold text-ink">
            {formatAppointmentDateTime(created.scheduledAt)}
          </p>
          <p className="text-ink-soft">Médico</p>
          <p className="mb-4 font-semibold text-ink">{created.doctor.fullName}</p>
          <p className="text-ink-soft">Valor</p>
          <p className="mb-6 font-semibold text-ink">
            {formatCurrency(created.consultationFee)}
          </p>
          <button
            onClick={() => {
              setCreated(null)
              setScheduledAt('')
              setAvailability(null)
              setAvailabilityError('')
              setAvailabilityLoading(Boolean(specialty && date))
              setAvailabilityVersion((current) => current + 1)
            }}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Agendar outra
          </button>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Agendamento"
        title="Nova consulta"
        subtitle="Escolha a especialidade, data e horário para sua consulta."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-ink">Especialidade</legend>
            <p className="mb-4 text-sm text-ink-soft">Selecione o tipo de atendimento.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {specialties.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={specialty === s.value}
                  onClick={() => {
                    if (specialty !== s.value) {
                      setSpecialty(s.value)
                      setScheduledAt('')
                      setAvailability(null)
                      setAvailabilityError('')
                      setAvailabilityLoading(Boolean(date))
                    }
                  }}
                  className={`min-h-12 rounded-2xl border px-4 py-3 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    specialty === s.value
                      ? 'border-brand bg-mint text-ink'
                      : 'border-brand/10 bg-linear-to-r from-mint to-white text-ink hover:border-accent'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="appointmentDate" className="mb-1 block text-sm font-semibold text-ink">Data</label>
            <input
              id="appointmentDate"
              type="date"
              value={date}
              min={toDateInputValue(new Date())}
              onChange={(e) => {
                const nextDate = e.target.value
                setDate(nextDate)
                setScheduledAt('')
                setAvailability(null)
                setAvailabilityError('')
                setAvailabilityLoading(Boolean(specialty && nextDate))
              }}
              required
              className={fieldClass}
            />
          </div>

          {availabilityLoading && (
            <p role="status" className="text-sm text-ink-soft">Consultando horários disponíveis...</p>
          )}
          {availabilityError && <p role="alert" className="text-sm text-red-700">{availabilityError}</p>}
          {availability && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 rounded-xl bg-mint/50 px-4 py-3 text-sm text-ink">
              <p><span className="font-semibold">Duração:</span> {availability.durationMinutes} min</p>
              <p>
                <span className="font-semibold">Valor:</span> {formatCurrency(availability.consultationFee)}
              </p>
            </div>
          )}
          {availability?.availableSlots.length === 0 && !availabilityLoading && (
            <p className="text-sm text-ink-soft">Não há horários disponíveis nessa data.</p>
          )}
          {availability && availability.availableSlots.length > 0 && (
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-ink">
                Horários disponíveis · {availability.durationMinutes} min por consulta
              </legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {availability.availableSlots.map((slot) => {
                  const selected = scheduledAt === `${date}T${slot}`
                  return (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setScheduledAt(`${date}T${slot}`)
                        setError('')
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

          {selectedSlotIsAvailable && availability && (
            <section
              aria-labelledby="appointment-summary-title"
              className="space-y-3 rounded-2xl border border-brand/20 bg-white p-4"
            >
              <h2 id="appointment-summary-title" className="font-semibold text-ink">
                Confira sua consulta
              </h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-soft">Especialidade</dt>
                  <dd className="font-semibold text-ink">{specialtyLabel(specialty)}</dd>
                </div>
                <div>
                  <dt className="text-ink-soft">Data e horário</dt>
                  <dd className="font-semibold text-ink">{formatAppointmentDateTime(scheduledAt)}</dd>
                </div>
                <div>
                  <dt className="text-ink-soft">Duração</dt>
                  <dd className="font-semibold text-ink">{availability.durationMinutes} min</dd>
                </div>
                <div>
                  <dt className="text-ink-soft">Forma de pagamento</dt>
                  <dd className="font-semibold text-ink">
                    {payments.find((payment) => payment.value === paymentMethod)?.label}
                  </dd>
                </div>
                <div>
                  <dt className="text-ink-soft">Valor da consulta</dt>
                  <dd className="font-semibold text-ink">
                    {formatCurrency(availability.consultationFee)}
                  </dd>
                </div>
              </dl>
            </section>
          )}

          <div>
            <label htmlFor="payment" className="mb-1 block text-sm font-semibold text-ink">Forma de pagamento</label>
            <select
              id="payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={fieldClass}
            >
              {payments.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="reason" className="mb-1 block text-sm font-semibold text-ink">Motivo (opcional)</label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              className={`${fieldClass} h-auto min-h-28 py-3`}
            />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading || !selectedSlotIsAvailable}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Agendando...' : 'Confirmar agendamento'}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default NewAppointment