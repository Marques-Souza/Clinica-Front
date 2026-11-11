function Logo({ onDark = false }: { onDark?: boolean }) {
  return (
    <div className="flex items-center gap-[15px]">
      <svg width="54" height="54" viewBox="0 0 54 54" aria-hidden="true">
        <circle cx="27" cy="27" r="27" fill="#23B5A5" />
        <circle cx="27" cy="27" r="23" fill="#fff" />
        <circle cx="27" cy="27" r="19" fill="#176B70" />
        <path d="M23 14h8v26h-8zM14 23h26v8H14z" fill="#fff" />
      </svg>
      <div className="[font-family:Arial,Helvetica,sans-serif] leading-[1.15]">
        <p className={`text-[23px] font-normal ${onDark ? 'text-white' : 'text-brand-dark'}`}>
          CLINICA
        </p>
        <p className={`text-[9px] ${onDark ? 'text-[#BDE8E3]' : 'text-slate-600'}`}>
          SAUDE&nbsp; | &nbsp;CUIDADO&nbsp; | &nbsp;BEM-ESTAR
        </p>
      </div>
    </div>
  )
}

export default Logo