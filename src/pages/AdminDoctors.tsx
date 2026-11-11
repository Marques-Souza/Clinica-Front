import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link } from 'react-router-dom'
import api from '../services/api'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { specialties } from '../services/specialties'

type Doctor = {
  id: string
  fullName: string
  crm: string
  specialty: string
  active: boolean
}

function AdminDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [specialty, setSpecialty] = useState('')
  const [active, setActive] = useState('true')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    let current = true

    api
      .get('/doctors', { params: { page, size: 20 } })
      .then(({ data }) => {
        if (!current) return
        setDoctors(data.content)
        setTotalPages(data.totalPages)
      })
      .catch(() => {
        if (current) setError('Não foi possível carregar os médicos.')
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [page])

  function goToPage(nextPage: number) {
    setLoading(true)
    setError('')
    setPage(nextPage)
  }

  function startEditing(doctor: Doctor) {
    setEditingDoctor(doctor)
    setSpecialty(doctor.specialty)
    setActive(String(doctor.active))
    setError('')
    setSuccess('')
  }

  function stopEditing() {
    setEditingDoctor(null)
    setError('')
  }

  async function saveDoctor() {
    if (!editingDoctor) return
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { data } = await api.patch<Doctor>(`/doctors/${editingDoctor.id}`, {
        specialty,
        active: active === 'true',
      })
      setDoctors((current) => current.map((doctor) => (
        doctor.id === data.id ? data : doctor
      )))
      setEditingDoctor(null)
      setSuccess('Dados do médico atualizados.')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        setError('Médico não encontrado.')
      } else if (isAxiosError(err) && err.response?.status === 403) {
        setError('Você não tem permissão para alterar este médico.')
      } else {
        setError('Não foi possível salvar. Confira os dados e tente novamente.')
      }
    } finally {
      setSaving(false)
    }
  }

  const input =
    'h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        eyebrow="Administração"
        title="Médicos"
        subtitle="Consulte os perfis e gerencie especialidade e situação."
      />

      <Link
        to="/admin/medicos/novo"
        className="inline-flex h-11 items-center rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-dark"
      >
        Criar acesso de médico
      </Link>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="text-sm text-green-800">{success}</p>}
      {loading && <p role="status" className="text-ink-soft">Carregando médicos...</p>}
      {!loading && !error && doctors.length === 0 && (
        <Card><p className="text-ink-soft">Nenhum perfil de médico encontrado.</p></Card>
      )}

      <div className="flex flex-col gap-3">
        {doctors.map((doctor) => {
          const isEditing = editingDoctor?.id === doctor.id
          const specialtyLabel = specialties.find((item) => item.value === doctor.specialty)?.label
            ?? doctor.specialty

          return (
            <Card key={doctor.id}>
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{doctor.fullName}</p>
                    <p className="text-sm text-ink-soft">CRM {doctor.crm} · {specialtyLabel}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      doctor.active
                        ? 'bg-green-100 text-green-900'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {doctor.active ? 'Ativo' : 'Inativo'}
                    </span>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => startEditing(doctor)}
                        disabled={saving}
                        className="h-10 rounded-xl border border-brand px-4 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-60"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="space-y-3 border-t border-slate-200 pt-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`specialty-${doctor.id}`} className="mb-1 block text-sm font-semibold text-ink">
                          Especialidade
                        </label>
                        <select
                          id={`specialty-${doctor.id}`}
                          value={specialty}
                          onChange={(event) => setSpecialty(event.target.value)}
                          className={input}
                        >
                          {specialties.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`status-${doctor.id}`} className="mb-1 block text-sm font-semibold text-ink">
                          Situação
                        </label>
                        <select
                          id={`status-${doctor.id}`}
                          value={active}
                          onChange={(event) => setActive(event.target.value)}
                          className={input}
                        >
                          <option value="true">Ativo</option>
                          <option value="false">Inativo</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveDoctor}
                        disabled={saving}
                        className="h-11 rounded-xl bg-brand px-5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
                      >
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                      <button
                        type="button"
                        onClick={stopEditing}
                        disabled={saving}
                        className="h-11 rounded-xl border border-slate-300 px-5 font-semibold text-ink disabled:opacity-60"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToPage(page - 1)}
            disabled={page === 0}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-ink disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-ink-soft">Página {page + 1} de {totalPages}</span>
          <button
            type="button"
            onClick={() => goToPage(page + 1)}
            disabled={page + 1 >= totalPages}
            className="h-11 rounded-xl border border-slate-300 bg-white px-4 font-semibold text-ink disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminDoctors
