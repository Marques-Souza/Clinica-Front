import { useState, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import api from '../services/api'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'

async function downloadPdf(url: string, filename: string, params?: Record<string, string>) {
  const response = await api.get(url, { params, responseType: 'blob' })
  const objectUrl = window.URL.createObjectURL(response.data)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(objectUrl)
}

function AdminReports() {
  const [crm, setCrm] = useState('')
  const [loadingAll, setLoadingAll] = useState(false)
  const [loadingDoctor, setLoadingDoctor] = useState(false)
  const [error, setError] = useState('')

  async function handleAll() {
    setError('')
    setLoadingAll(true)
    try {
      await downloadPdf('/reports/admin/appointments', 'relatorio-geral-de-consultas.pdf')
    } catch {
      setError('Não foi possível gerar o relatório geral')
    } finally {
      setLoadingAll(false)
    }
  }

  async function handleDoctor(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoadingDoctor(true)
    try {
      await downloadPdf(
        '/reports/admin/appointments/doctor',
        `relatorio-${crm}.pdf`,
        { crm },
      )
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError('Médico não encontrado para esse CRM')
      } else {
        setError('Não foi possível gerar o relatório do médico')
      }
    } finally {
      setLoadingDoctor(false)
    }
  }

  const primary =
    'h-12 px-6 rounded-xl bg-brand text-white font-semibold hover:bg-brand-dark transition-colors disabled:opacity-60'

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Relatórios"
        subtitle="Baixe o demonstrativo de consultas em PDF."
      />

      {error && <p className="text-red-700">{error}</p>}

      <Card>
        <h2 className="text-lg font-bold text-brand-dark">Relatório geral</h2>
        <p className="text-ink-soft mt-1 mb-4">Todas as consultas da clínica.</p>
        <button onClick={handleAll} disabled={loadingAll} className={primary}>
          {loadingAll ? 'Gerando...' : 'Baixar relatório geral'}
        </button>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark">Relatório por médico</h2>
        <p className="text-ink-soft mt-1 mb-4">Consultas de um médico, pelo CRM.</p>
        <form onSubmit={handleDoctor} className="flex flex-col sm:flex-row gap-2">
          <label htmlFor="crm" className="sr-only">CRM do médico</label>
          <input
            id="crm"
            value={crm}
            onChange={(e) => setCrm(e.target.value.toUpperCase())}
            placeholder="123456-SP"
            maxLength={9}
            className="flex-1 h-12 rounded-xl border border-brand/20 px-4 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-accent focus:border-brand"
          />
          <button type="submit" disabled={loadingDoctor || !crm.trim()} className={primary}>
            {loadingDoctor ? 'Gerando...' : 'Baixar relatório'}
          </button>
        </form>
      </Card>
    </div>
  )
}

export default AdminReports