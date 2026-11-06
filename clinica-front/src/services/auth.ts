export function getPerfil(): string | null {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(payload)).perfil ?? null
  } catch {
    return null
  }
}