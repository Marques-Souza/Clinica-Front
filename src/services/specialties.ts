export const specialties = [
  { value: 'CARDIOLOGY', label: 'CARDIOLOGIA' },
  { value: 'PEDIATRICS', label: 'PEDIATRIA' },
  { value: 'ORTHOPEDICS', label: 'ORTOPEDIA' },
  { value: 'DERMATOLOGY', label: 'DERMATOLOGIA' },
  { value: 'OPHTHALMOLOGY', label: 'OFTALMOLOGIA' },
  { value: 'GYNECOLOGY', label: 'GINECOLOGIA' },
]

export function specialtyLabel(value: string) {
  return specialties.find((s) => s.value === value)?.label ?? value
}
