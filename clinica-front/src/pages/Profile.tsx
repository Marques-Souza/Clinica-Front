import { useEffect, useState, type FormEvent } from 'react'
import api from '../services/api'

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

  if (loading) return <p className="text-slate-600">Carregando...</p>
  if (!client) return <p className="text-red-600">{error}</p>

  const input = 'w-full h-12 rounded-xl border border-slate-300 px-4 mb-4 bg-white'
  const label = 'block text-sm font-semibold mb-1'

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Meu perfil</h1>

      {!editing ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><dt className="text-sm text-slate-500">Nome</dt><dd className="font-semibold">{client.fullName}</dd></div>
            <div><dt className="text-sm text-slate-500">CPF</dt><dd className="font-semibold">{client.cpf}</dd></div>
            <div><dt className="text-sm text-slate-500">E-mail</dt><dd className="font-semibold">{client.email}</dd></div>
            <div><dt className="text-sm text-slate-500">Telefone</dt><dd className="font-semibold">{client.phone}</dd></div>
            <div className="sm:col-span-2">
              <dt className="text-sm text-slate-500">Endereço</dt>
              <dd className="font-semibold">
                {client.street}, {client.number} · {client.neighborhood}
                <br />
                {client.city} - {client.state} · CEP {client.cep}
              </dd>
            </div>
          </dl>
          {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
          <button
            onClick={startEditing}
            className="mt-6 h-12 px-6 rounded-xl bg-brand text-white font-semibold"
          >
            Editar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6">
          <label htmlFor="fullName" className={label}>Nome completo</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={150} className={input} />

          <label htmlFor="phone" className={label}>Telefone</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} className={input} />

          <label htmlFor="cep" className={label}>CEP</label>
          <input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} maxLength={9} className={input} />

          <label htmlFor="number" className={label}>Número</label>
          <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} maxLength={10} className={input} />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="h-12 px-6 rounded-xl bg-brand text-white font-semibold disabled:opacity-60"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="h-12 px-6 rounded-xl border border-slate-300 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default Profile