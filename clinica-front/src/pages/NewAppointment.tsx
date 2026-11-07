import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

const specialties = [
  { value: 'CARDIOLOGY', label: 'Cardiologia' },
  { value: 'PEDIATRICS', label: 'Pediatria' },
  { value: 'ORTHOPEDICS', label: 'Ortopedia' },
  { value: 'DERMATOLOGY', label: 'Dermatologia' },
  { value: 'OPHTHALMOLOGY', label: 'Oftalmologia' },
  { value: 'GYNECOLOGY', label: 'Ginecologia' },
]

const payments = [
  { value: 'PIX', label: 'PIX' },
  { value: 'CREDIT_CARD', label: 'Cartão de crédito' },
  { value: 'CASH', label: 'Dinheiro' },
]

type Appointment = {
  appointmentCode: string
  consultationFee: number
  doctor: { fullName: string }
}

// "2026-11-10T14:30" -> "10/11/2026 14:30"
function toApiDate(value: string) {
  const [date, time] = value.split('T')
  const [year, month, day] = date.split('-')
  return `${day}/${month}/${year} ${time}`
}

function NewAppointment() {
  const [specialty, setSpecialty] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<Appointment | null>(null)
  const fieldClass =
    'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-ink accent-brand focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!specialty) {
      setError('Escolha uma especialidade')
      return
    }
    if (!scheduledAt) {
      setError('Escolha a data e a hora')
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
        setError('Nenhum médico disponível nesse horário. Escolha outro.')
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
          <p className="text-ink-soft">Médico</p>
          <p className="mb-4 font-semibold text-ink">{created.doctor.fullName}</p>
          <p className="text-ink-soft">Valor</p>
          <p className="mb-6 font-semibold text-ink">
            {created.consultationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <button
            onClick={() => setCreated(null)}
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
                  onClick={() => setSpecialty(s.value)}
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
            <label htmlFor="scheduledAt" className="mb-1 block text-sm font-semibold text-ink">Data e hora</label>
            <input
              id="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={fieldClass}
            />
          </div>

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
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Agendando...' : 'Agendar consulta'}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default NewAppointment