import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'

type Appointment = {
  appointmentCode: string
  patient: { fullName: string }
  doctor: { fullName: string; specialty: string }
  scheduledAt: string
  durationMinutes: number
  consultationFee: number
  paymentMethod: string
  paymentStatus: string
  status: string
  reason: string | null
}

const statusLabel: Record<string, string> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
}

const paymentLabel: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  CANCELLED: 'Cancelado',
}

const methodLabel: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de crédito',
  CASH: 'Dinheiro',
}

function SearchAppointment() {
  const [code, setCode] = useState('')
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSearch(e: FormEvent) {
    e.preventDefault()
    setError('')
    setAppointment(null)
    setLoading(true)
    try {
      const response = await api.get(`/appointments/code/${code.trim()}`)
      setAppointment(response.data)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError('Consulta não encontrada')
      } else {
        setError('Não foi possível buscar a consulta')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Buscar por código</h1>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
        <label htmlFor="code" className="sr-only">Código da consulta</label>
        <input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex.: 20261109-0e501cac"
          className="flex-1 h-12 rounded-xl border border-slate-300 px-4 bg-white"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="h-12 px-6 rounded-xl bg-brand text-white font-semibold disabled:opacity-60"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-red-600">{error}</p>}

      {appointment && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Código</p>
          <p className="text-xl font-bold text-brand mb-4">{appointment.appointmentCode}</p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-sm text-slate-500">Paciente</dt><dd className="font-semibold">{appointment.patient.fullName}</dd></div>
            <div><dt className="text-sm text-slate-500">Médico</dt><dd className="font-semibold">{appointment.doctor.fullName}</dd></div>
            <div><dt className="text-sm text-slate-500">Especialidade</dt><dd className="font-semibold">{appointment.doctor.specialty}</dd></div>
            <div>
              <dt className="text-sm text-slate-500">Data e hora</dt>
              <dd className="font-semibold">
                {new Date(appointment.scheduledAt.replace(' ', 'T')).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}{' '}
                · {appointment.durationMinutes} min
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Valor</dt>
              <dd className="font-semibold">
                {appointment.consultationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-slate-500">Pagamento</dt>
              <dd className="font-semibold">
                {methodLabel[appointment.paymentMethod] ?? appointment.paymentMethod} ·{' '}
                {paymentLabel[appointment.paymentStatus] ?? appointment.paymentStatus}
              </dd>
            </div>
            <div><dt className="text-sm text-slate-500">Status</dt><dd className="font-semibold">{statusLabel[appointment.status] ?? appointment.status}</dd></div>
            {appointment.reason && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-slate-500">Motivo</dt>
                <dd className="font-semibold">{appointment.reason}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}

export default SearchAppointment
