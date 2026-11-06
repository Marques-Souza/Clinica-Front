import { useState } from 'react'
import api from '../services/api'

function Report() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setError('')
    setLoading(true)
    try {
      const response = await api.get('/reports/me/appointments', {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = 'meu-relatorio-de-consultas.pdf'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setError('Não foi possível gerar o relatório')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold mb-2">Relatório</h1>
      <p className="text-slate-600 mb-6">
        Baixe um PDF com o histórico das suas consultas.
      </p>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <button
        onClick={handleDownload}
        disabled={loading}
        className="h-12 px-6 rounded-xl bg-teal-700 text-white font-semibold disabled:opacity-60"
      >
        {loading ? 'Gerando...' : 'Baixar relatório em PDF'}
      </button>
    </div>
  )
}

export default Report