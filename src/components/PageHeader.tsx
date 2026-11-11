type PageHeaderProps = {
  eyebrow?: string
  title: string
  subtitle?: string
}

function PageHeader({ eyebrow, title, subtitle }: PageHeaderProps) {
  return (
    <header className="rounded-2xl border border-brand/10 bg-linear-to-r from-mint to-white p-6 sm:p-8">
      {eyebrow && (
        <p className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-bold text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
    </header>
  )
}

export default PageHeader
