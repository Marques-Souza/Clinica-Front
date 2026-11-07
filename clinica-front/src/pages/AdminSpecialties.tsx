import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { specialties } from '../services/specialties'

type Config = {
  id: string
  specialty: string
  consultationFee: number
  durationMinutes: number
}

function SpecialtyCard({ value, label }: { value: string; label: string }) {
  const [config, setConfig] = useState<Config | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fee, setFee] = useState('')
  const [duration, setDuration] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get(`/specialties/${value}`)
      .then((response) => setConfig(response.data))
      .catch((err) => {
        // 404 = ainda não configurada, não é erro
        if (!(isAxiosError(err) && err.response?.status === 404)) {
          setError('Não foi possível carregar')
        }
      })
      .finally(() => setLoading(false))
  }, [value])

  function startEditing() {
    setFee(config ? String(config.consultationFee) : '')
    setDuration(config ? String(config.durationMinutes) : '')
    setError('')
    setEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    const body = { consultationFee: Number(fee), durationMinutes: Number(duration) }
    if (!(body.consultationFee > 0) || !(body.durationMinutes > 0)) {
      setError('Valor e duração precisam ser maiores que zero')
      return
    }
    setSaving(true)
    try {
      const response = config
        ? await api.put(`/specialties/${value}`, body)
        : await api.post('/specialties', { specialty: value, ...body })
      setConfig(response.data)
      setEditing(false)
    } catch {
      setError('Não foi possível salvar')
    } finally {
      setSaving(false)
    }
  }

  const input =
    'w-full h-12 rounded-xl border border-brand/20 px-4 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-brand'

  return (
    <Card>
      <h2 className="text-lg font-bold text-brand-dark">{label}</h2>

      {loading && <p className="text-ink-soft mt-2">Carregando...</p>}

      {!loading && !editing && (
        <>
          {config ? (
            <p className="mt-2 text-ink">
              <strong>
                {config.consultationFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>{' '}
              · {config.durationMinutes} min
            </p>
          ) : (
            <p className="mt-2 text-ink-soft">Não configurada</p>
          )}
          {error && <p className="text-red-700 text-sm mt-2">{error}</p>}
          <button
            onClick={startEditing}
            className="mt-4 h-11 px-4 rounded-xl border border-brand text-brand font-semibold hover:bg-mint transition-colors"
          >
            {config ? 'Editar' : 'Configurar'}
          </button>
        </>
      )}

      {editing && (
        <form onSubmit={handleSave} className="mt-3">
          <label htmlFor={`fee-${value}`} className="block text-sm font-semibold text-ink mb-1">
            Valor da consulta (R$)
          </label>
          <input
            id={`fee-${value}`}
            type="number"
            step="0.01"
            min="0.01"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className={`${input} mb-3`}
          />
          <label htmlFor={`dur-${value}`} className="block text-sm font-semibold text-ink mb-1">
            Duração (minutos)
          </label>
          <input
            id={`dur-${value}`}
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={`${input} mb-3`}
          />
          {error && <p className="text-red-700 text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-5 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-11 px-5 rounded-xl border border-slate-300 text-ink font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Card>
  )
}

function AdminSpecialties() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Especialidades"
        subtitle="Defina o valor e a duração da consulta de cada especialidade."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {specialties.map((s) => (
          <SpecialtyCard key={s.value} value={s.value} label={s.label} />
        ))}
      </div>
    </div>
  )
}

export default AdminSpecialties