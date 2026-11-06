import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'

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
    'w-full rounded-xl border border-brand/20 bg-mint/60 px-4 text-brand-dark accent-brand [color-scheme:light] placeholder:text-slate-400 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20'

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
      <div className="max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Consulta agendada!</h1>
        <p className="text-slate-600">Código da consulta</p>
        <p className="text-xl font-bold text-brand mb-4">{created.appointmentCode}</p>
        <p className="text-slate-600">Médico</p>
        <p className="font-semibold mb-4">{created.doctor.fullName}</p>
        <p className="text-slate-600">Valor</p>
        <p className="font-semibold mb-6">
          {created.consultationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
        <button
          onClick={() => setCreated(null)}
          className="w-full h-12 rounded-xl bg-brand text-white font-semibold"
        >
          Agendar outra
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-brand">Agendamento</p>
        <h1 className="text-3xl font-bold text-brand-dark">Nova consulta</h1>
        <p className="mt-2 text-slate-600">Escolha a especialidade, data e horário para sua consulta.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-brand/10 bg-white p-5 shadow-sm sm:p-8">
        <h2 className="mb-1 font-bold text-brand-dark">Especialidade</h2>
        <p className="mb-4 text-sm text-slate-500">Selecione o tipo de atendimento.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          {specialties.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSpecialty(s.value)}
              className={`h-24 rounded-2xl border font-semibold transition-colors ${
                specialty === s.value
                  ? 'border-brand bg-brand text-white shadow-sm'
                  : 'border-brand/15 bg-mint/50 text-brand-dark hover:border-brand/40 hover:bg-mint'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label htmlFor="scheduledAt" className="mb-2 block font-semibold text-brand-dark">Data e hora</label>
        <input
          id="scheduledAt"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          className={`${fieldClass} mb-6 h-12`}
        />

        <label htmlFor="payment" className="mb-2 block font-semibold text-brand-dark">Forma de pagamento</label>
        <select
          id="payment"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={`${fieldClass} mb-6 h-12`}
        >
          {payments.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <label htmlFor="reason" className="mb-2 block font-semibold text-brand-dark">Motivo (opcional)</label>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          rows={3}
          className={`${fieldClass} mb-6 p-4`}
        />

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-brand text-white font-semibold disabled:opacity-60"
        >
          {loading ? 'Agendando...' : 'Agendar consulta'}
        </button>
      </form>
    </div>
  )
}

export default NewAppointment