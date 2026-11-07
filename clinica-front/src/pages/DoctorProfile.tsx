import { useEffect, useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import { specialties, specialtyLabel } from '../services/specialties'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { formatCpf } from '../services/format'

type Doctor = {
  fullName: string
  cpf: string
  crm: string
  specialty: string
  active: boolean
  email: string
}

function DoctorProfile() {
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [crm, setCrm] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/doctors/me')
      .then((response) => setDoctor(response.data))
      .catch((err) => {
        if (!(isAxiosError(err) && err.response?.status === 404)) {
          setError('Não foi possível carregar seu perfil')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!specialty) {
      setError('Escolha a especialidade')
      return
    }
    setSaving(true)
    try {
      const response = await api.put('/doctors/me', {
        fullName,
        cpf: cpf.replace(/\D/g, ''),
        crm: crm.toUpperCase(),
        specialty,
      })
      setDoctor(response.data)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError('Esse perfil já existe ou o CPF/CRM já está em uso')
      } else {
        setError('Confira os dados. CRM no formato 123456-SP e CPF válido.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader eyebrow="Conta" title={doctor?.fullName ?? 'Meu perfil'} />
        <Card><p className="text-ink-soft">Carregando...</p></Card>
      </div>
    )
  }

  if (doctor) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader eyebrow="Conta" title={doctor.fullName} />
        <Card>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-sm text-ink-soft">Nome</dt><dd className="font-semibold text-ink">{doctor.fullName}</dd></div>
            <div><dt className="text-sm text-ink-soft">E-mail</dt><dd className="font-semibold text-ink">{doctor.email}</dd></div>
            <div><dt className="text-sm text-ink-soft">CPF</dt><dd className="font-semibold text-ink">{formatCpf(doctor.cpf)}</dd></div>
            <div><dt className="text-sm text-ink-soft">CRM</dt><dd className="font-semibold text-ink">{doctor.crm}</dd></div>
            <div><dt className="text-sm text-ink-soft">Especialidade</dt><dd className="font-semibold text-ink">{specialtyLabel(doctor.specialty)}</dd></div>
            <div>
              <dt className="text-sm text-ink-soft">Situação</dt>
              <dd className="font-semibold text-ink">{doctor.active ? 'Ativo' : 'Inativo'}</dd>
            </div>
          </dl>
        </Card>
      </div>
    )
  }

  const input = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'
  const label = 'mb-1 block text-sm font-semibold text-ink'

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Conta"
        title="Complete seu perfil"
        subtitle="Precisamos desses dados para você receber consultas."
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className={label}>Nome completo</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={150} className={input} />
        </div>

        <div>
          <label htmlFor="cpf" className={label}>CPF</label>
          <input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" maxLength={14} className={input} />
        </div>

        <div>
          <label htmlFor="crm" className={label}>CRM</label>
          <input id="crm" value={crm} onChange={(e) => setCrm(e.target.value)} placeholder="123456-SP" maxLength={9} className={input} />
        </div>

        <div>
          <label htmlFor="specialty" className={label}>Especialidade</label>
          <select id="specialty" value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={input}>
            <option value="">Selecione</option>
            {specialties.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
        >
          {saving ? 'Salvando...' : 'Salvar perfil'}
        </button>
        </form>
      </Card>
    </div>
  )
}

export default DoctorProfile
