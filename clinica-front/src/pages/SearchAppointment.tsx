import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

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
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Consultas"
        title="Buscar por código"
        subtitle="Digite o código para ver os detalhes"
      />

      <Card>
        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="code" className="mb-1 block text-sm font-semibold text-ink">Código da consulta</label>
            <input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex.: 20261109-0e501cac"
              className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="h-12 rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 sm:mt-6"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </Card>

      {error && <p role="alert" className="text-red-700">{error}</p>}

      {appointment && (
        <Card>
          <p className="text-sm text-ink-soft">Código</p>
          <p className="mb-4 text-xl font-bold text-ink">{appointment.appointmentCode}</p>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-sm text-ink-soft">Paciente</dt><dd className="font-semibold text-ink">{appointment.patient.fullName}</dd></div>
            <div><dt className="text-sm text-ink-soft">Médico</dt><dd className="font-semibold text-ink">{appointment.doctor.fullName}</dd></div>
            <div><dt className="text-sm text-ink-soft">Especialidade</dt><dd className="font-semibold text-ink">{appointment.doctor.specialty}</dd></div>
            <div>
              <dt className="text-sm text-ink-soft">Data e hora</dt>
              <dd className="font-semibold text-ink">
                {new Date(appointment.scheduledAt.replace(' ', 'T')).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}{' '}
                · {appointment.durationMinutes} min
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Valor</dt>
              <dd className="font-semibold text-ink">
                {appointment.consultationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Pagamento</dt>
              <dd className="font-semibold text-ink">
                {methodLabel[appointment.paymentMethod] ?? appointment.paymentMethod} ·{' '}
                {paymentLabel[appointment.paymentStatus] ?? appointment.paymentStatus}
              </dd>
            </div>
            <div><dt className="text-sm text-ink-soft">Status</dt><dd className="font-semibold text-ink">{statusLabel[appointment.status] ?? appointment.status}</dd></div>
            {appointment.reason && (
              <div className="sm:col-span-2">
                <dt className="text-sm text-ink-soft">Motivo</dt>
                <dd className="font-semibold text-ink">{appointment.reason}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}
    </div>
  )
}

export default SearchAppointment
