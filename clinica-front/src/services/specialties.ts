export const specialties = [
  { value: 'CARDIOLOGY', label: 'Cardiologia' },
  { value: 'PEDIATRICS', label: 'Pediatria' },
  { value: 'ORTHOPEDICS', label: 'Ortopedia' },
  { value: 'DERMATOLOGY', label: 'Dermatologia' },
  { value: 'OPHTHALMOLOGY', label: 'Oftalmologia' },
  { value: 'GYNECOLOGY', label: 'Ginecologia' },
]

export function specialtyLabel(value: string) {
  return specialties.find((s) => s.value === value)?.label ?? value
}
