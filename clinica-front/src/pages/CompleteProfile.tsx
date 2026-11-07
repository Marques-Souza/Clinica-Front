import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

function onlyDigits(value: string) {
  return value.replace(/\D/g, '')
}

function CompleteProfile() {
  const [fullName, setFullName] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [cep, setCep] = useState('')
  const [number, setNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.put('/clients/me', {
        fullName,
        cpf: onlyDigits(cpf),
        phone,
        cep: onlyDigits(cep),
        number,
      })
      navigate('/home')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        navigate('/home')
      } else {
        setError('Confira os dados e tente novamente')
      }
    } finally {
      setLoading(false)
    }
  }

  const input = 'h-12 w-full rounded-xl border border-slate-300 bg-white px-4 focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'
  const label = 'mb-1 block text-sm font-semibold text-ink'

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Conta"
        title="Complete seu perfil"
        subtitle="Precisamos desses dados para agendar suas consultas."
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
            <label htmlFor="phone" className={label}>Telefone</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} className={input} />
          </div>

          <div>
            <label htmlFor="cep" className={label}>CEP</label>
            <input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" maxLength={9} className={input} />
          </div>

          <div>
            <label htmlFor="number" className={label}>Número</label>
            <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} maxLength={10} className={input} />
          </div>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default CompleteProfile