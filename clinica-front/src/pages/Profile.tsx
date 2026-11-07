import { useEffect, useState, type FormEvent } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import { formatCep, formatCpf, formatPhone } from '../services/format'

type Client = {
  fullName: string
  cpf: string
  phone: string
  email: string
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
  number: string
}

function Profile() {
  const [client, setClient] = useState<Client | null>(null)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [cep, setCep] = useState('')
  const [number, setNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/clients/me')
      .then((response) => setClient(response.data))
      .catch(() => setError('Não foi possível carregar seu perfil'))
      .finally(() => setLoading(false))
  }, [])

  function startEditing() {
    if (!client) return
    setFullName(client.fullName)
    setPhone(client.phone)
    setCep(client.cep)
    setNumber(client.number)
    setError('')
    setEditing(true)
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const response = await api.patch('/clients/me', {
        fullName,
        phone,
        cep: cep.replace(/\D/g, ''),
        number,
      })
      setClient(response.data)
      setEditing(false)
    } catch {
      setError('Não foi possível salvar. Confira os dados.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader eyebrow="Conta" title={client?.fullName ?? 'Meu perfil'} />
        <Card><p className="text-ink-soft">Carregando...</p></Card>
      </div>
    )
  }
  if (!client) {
    return (
      <div className="max-w-3xl space-y-6">
        <PageHeader eyebrow="Conta" title="Meu perfil" />
        <Card><p role="alert" className="text-red-700">{error}</p></Card>
      </div>
    )
  }

  const input = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'
  const label = 'mb-1 block text-sm font-semibold text-ink'

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader eyebrow="Conta" title={client.fullName} />

      {!editing ? (
        <Card>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-sm text-ink-soft">Nome</dt><dd className="font-semibold text-ink">{client.fullName}</dd></div>
            <div><dt className="text-sm text-ink-soft">CPF</dt><dd className="font-semibold text-ink">{formatCpf(client.cpf)}</dd></div>
            <div><dt className="text-sm text-ink-soft">E-mail</dt><dd className="font-semibold text-ink">{client.email}</dd></div>
            <div><dt className="text-sm text-ink-soft">Telefone</dt><dd className="font-semibold text-ink">{formatPhone(client.phone)}</dd></div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-ink-soft">Endereço</dt>
              <dd className="font-semibold text-ink">
                {client.street}, {client.number} · {client.neighborhood}
                <br />
                {client.city} - {client.state} · CEP {formatCep(client.cep)}
              </dd>
            </div>
          </dl>
          {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
          <button
            onClick={startEditing}
            className="mt-6 h-12 rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Editar
          </button>
        </Card>
      ) : (
        <Card>
          <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="fullName" className={label}>Nome completo</label>
            <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={150} className={input} />
          </div>

          <div>
            <label htmlFor="phone" className={label}>Telefone</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={input} />
          </div>

          <div>
            <label htmlFor="cep" className={label}>CEP</label>
            <input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} maxLength={9} className={input} />
          </div>

          <div>
            <label htmlFor="number" className={label}>Número</label>
            <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} maxLength={10} className={input} />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="h-12 rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-12 rounded-xl border border-brand px-6 font-semibold text-brand transition-colors hover:bg-mint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Cancelar
            </button>
          </div>
          </form>
        </Card>
      )}
    </div>
  )
}

export default Profile