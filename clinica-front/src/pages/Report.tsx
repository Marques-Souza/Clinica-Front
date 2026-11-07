import { useState } from 'react'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

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
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Documentos"
        title="Relatório"
        subtitle="Baixe um PDF com o histórico das suas consultas."
      />

      <Card>
        {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
        <button
          onClick={handleDownload}
          disabled={loading}
          className="h-12 w-full rounded-xl bg-brand px-6 font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto"
        >
          {loading ? 'Gerando...' : 'Baixar relatório em PDF'}
        </button>
      </Card>
    </div>
  )
}

export default Report