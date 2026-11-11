function digits(value: string) {
  return value.replace(/\D/g, '')
}

export function firstTwoNames(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).join(' ')
}

export function formatCpf(value: string) {
  const raw = digits(value)
  if (raw.length !== 11) return value
  return raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatPhone(value: string) {
  const raw = digits(value)
  if (raw.length === 11) return raw.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (raw.length === 10) return raw.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return value
}

export function formatCep(value: string) {
  const raw = digits(value)
  if (raw.length !== 8) return value
  return raw.replace(/(\d{5})(\d{3})/, '$1-$2')
}
