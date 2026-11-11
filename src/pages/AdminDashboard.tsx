import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

type DashboardSummary = {
  appointmentsToday: number
  activeDoctors: number
  registeredPatients: number
  dailyAppointments: { date: string; count: number }[]
}

type ChartPeriod = '7-days' | '15-days' | '30-days' | 'this-month' | 'custom'
type DateRange = { startDate: string; endDate: string }

const periodDays = {
  '7-days': 7,
  '15-days': 15,
  '30-days': 30,
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getPresetRange(period: Exclude<ChartPeriod, 'custom'>): DateRange {
  const endDate = new Date()
  endDate.setHours(0, 0, 0, 0)
  const startDate = new Date(endDate)

  if (period === 'this-month') {
    startDate.setDate(1)
  } else {
    startDate.setDate(startDate.getDate() - periodDays[period] + 1)
  }

  return {
    startDate: toDateInputValue(startDate),
    endDate: toDateInputValue(endDate),
  }
}

function formatDay(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
}

function AdminDashboard() {
  const [appliedRange, setAppliedRange] = useState(() => getPresetRange('7-days'))
  const [period, setPeriod] = useState<ChartPeriod>('7-days')
  const [startDate, setStartDate] = useState(appliedRange.startDate)
  const [endDate, setEndDate] = useState(appliedRange.endDate)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterError, setFilterError] = useState('')

  useEffect(() => {
    let active = true

    api
      .get<DashboardSummary>('/admin/dashboard/summary', { params: appliedRange })
      .then(({ data }) => {
        if (active) setSummary(data)
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o resumo da clínica.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [appliedRange])

  function handlePeriodChange(value: ChartPeriod) {
    setPeriod(value)
    setFilterError('')
    if (value === 'custom') return

    const range = getPresetRange(value)
    setStartDate(range.startDate)
    setEndDate(range.endDate)
    setLoading(true)
    setError('')
    setAppliedRange(range)
  }

  function handleCustomRangeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFilterError('')

    if (!startDate || !endDate || startDate > endDate) {
      setFilterError('Informe um intervalo de datas válido.')
      return
    }

    const days =
      (Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) /
        86_400_000 +
      1
    if (days > 366) {
      setFilterError('O período personalizado não pode ultrapassar 366 dias.')
      return
    }

    setLoading(true)
    setError('')
    setAppliedRange({ startDate, endDate })
  }

  const stats = summary
    ? [
        { label: 'Consultas hoje', value: summary.appointmentsToday },
        { label: 'Médicos ativos', value: summary.activeDoctors },
        { label: 'Pacientes cadastrados', value: summary.registeredPatients },
      ]
    : []
  const maxDailyAppointments = Math.max(
    ...(summary?.dailyAppointments.map((day) => day.count) ?? []),
    1,
  )
  const chartDescription = summary?.dailyAppointments
    .map((day) => `${formatDay(day.date)}: ${day.count} consultas`)
    .join(', ')

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Olá, Administrador!"
        subtitle="Bem-vindo ao painel da clínica."
      />

      <section aria-labelledby="summary-heading" className="space-y-3">
        <h2 id="summary-heading" className="font-bold text-ink">Resumo da clínica</h2>
        {loading && <p role="status" className="text-ink-soft">Carregando indicadores...</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="space-y-2">
                <p className="text-sm font-semibold text-ink-soft">{stat.label}</p>
                <p className="text-3xl font-bold text-brand-dark">
                  {stat.value.toLocaleString('pt-BR')}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>

      {summary && (
        <Card>
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-bold text-ink">Consultas por dia</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Total por dia, sem canceladas · {formatDay(appliedRange.startDate)} a {formatDay(appliedRange.endDate)}
              </p>
            </div>
            <div>
              <label htmlFor="chartPeriod" className="mb-1 block text-sm font-semibold text-ink">
                Período
              </label>
              <select
                id="chartPeriod"
                value={period}
                onChange={(event) => handlePeriodChange(event.target.value as ChartPeriod)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-ink sm:w-auto"
              >
                <option value="7-days">Últimos 7 dias</option>
                <option value="15-days">Últimos 15 dias</option>
                <option value="30-days">Últimos 30 dias</option>
                <option value="this-month">Este mês</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>
          </div>

          {period === 'custom' && (
            <form onSubmit={handleCustomRangeSubmit} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="chartStartDate" className="mb-1 block text-sm font-semibold text-ink">
                  De
                </label>
                <input
                  id="chartStartDate"
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-ink"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="chartEndDate" className="mb-1 block text-sm font-semibold text-ink">
                  Até
                </label>
                <input
                  id="chartEndDate"
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  max={toDateInputValue(new Date())}
                  onChange={(event) => setEndDate(event.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-ink"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-11 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
              >
                Aplicar
              </button>
              {filterError && <p role="alert" className="text-sm text-red-700 sm:basis-full">{filterError}</p>}
            </form>
          )}

          <div
            role="img"
            aria-label={`Gráfico de consultas por dia. ${chartDescription}`}
            className="overflow-x-auto"
          >
            <div
              className="flex h-60 items-end gap-2 border-b border-l border-slate-200 px-2 sm:gap-4"
              style={{ minWidth: `${Math.max(summary.dailyAppointments.length, 7) * 64}px` }}
            >
              {summary.dailyAppointments.map((day) => {
                const height = day.count === 0
                  ? 2
                  : Math.max((day.count / maxDailyAppointments) * 100, 8)

                return (
                  <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-xs font-semibold text-ink">{day.count}</span>
                    <div className="flex h-40 w-full items-end">
                      <div
                        className="w-full rounded-t-md bg-brand transition-[height]"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink-soft">{formatDay(day.date)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      )}

      <section aria-labelledby="shortcuts-heading" className="space-y-3">
        <h2 id="shortcuts-heading" className="font-bold text-ink">Atalhos</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/admin/medicos"
            className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-ink transition hover:border-brand hover:shadow-md"
          >
            Gerenciar médicos
          </Link>
          <Link
            to="/admin/especialidades"
            className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-ink transition hover:border-brand hover:shadow-md"
          >
            Especialidades
          </Link>
          <Link
            to="/admin/usuarios"
            className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-ink transition hover:border-brand hover:shadow-md"
          >
            Usuários
          </Link>
          <Link
            to="/admin/relatorios"
            className="rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-ink transition hover:border-brand hover:shadow-md"
          >
            Relatórios
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard
