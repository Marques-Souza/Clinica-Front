import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import api from '../services/api'

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

  const input = 'w-full h-12 rounded-xl border border-slate-300 px-4 mb-4'
  const label = 'block text-sm font-semibold mb-1'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <h1 className="text-3xl font-bold mb-1">Complete seu perfil</h1>
        <p className="text-slate-600 mb-6">Precisamos desses dados para agendar suas consultas.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName" className={label}>Nome completo</label>
          <input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={150} className={input} />

          <label htmlFor="cpf" className={label}>CPF</label>
          <input id="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" maxLength={14} className={input} />

          <label htmlFor="phone" className={label}>Telefone</label>
          <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" maxLength={20} className={input} />

          <label htmlFor="cep" className={label}>CEP</label>
          <input id="cep" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" maxLength={9} className={input} />

          <label htmlFor="number" className={label}>Número</label>
          <input id="number" value={number} onChange={(e) => setNumber(e.target.value)} maxLength={10} className={input} />

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-60"
          >
            {loading ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CompleteProfile