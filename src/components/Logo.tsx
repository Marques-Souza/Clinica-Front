function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <svg width="44" height="44" viewBox="0 0 48 48" role="img" aria-label="Clínica">
        <circle cx="24" cy="24" r="21" fill="#fff" stroke="#23B5A5" strokeWidth="4" />
        <path d="M24 14v20M14 24h20" stroke="#176B70" strokeWidth="6" strokeLinecap="round" />
      </svg>
      <div className="leading-tight">
        <p className={`text-xl font-bold tracking-wide uppercase ${onDark ? 'text-white' : 'text-brand-dark'}`}>
          Clínica
        </p>
        <p className={`text-[10px] tracking-widest uppercase ${onDark ? 'text-mint' : 'text-slate-600'}`}>
          Saúde | Cuidado | Bem-estar
        </p>
      </div>
    </div>
  )
}

export default Logo