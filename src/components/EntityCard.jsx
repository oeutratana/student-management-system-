const tones = {
  indigo: "from-indigo-600 to-violet-600 shadow-indigo-600/25",
  violet: "from-violet-500 to-purple-500 shadow-violet-600/25",
  emerald: "from-emerald-500 to-teal-500 shadow-emerald-600/25",
  sky: "from-sky-500 to-blue-600 shadow-sky-600/25",
  amber: "from-amber-500 to-orange-500 shadow-amber-600/25",
  rose: "from-rose-500 to-red-600 shadow-rose-600/25",
  slate: "from-slate-600 to-slate-800 shadow-slate-700/25",
}

export default function EntityCard({
  actions,
  badge,
  children,
  fields = [],
  footer,
  icon,
  subtitle,
  title,
  tone = "indigo",
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_18px_44px_-32px_rgba(16,24,40,0.3)] transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_1px_2px_rgba(16,24,40,0.04),0_24px_50px_-30px_rgba(79,70,229,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-2xl bg-gradient-to-br text-white shadow-lg ${
            tones[tone] ?? tones.indigo
          }`}
        >
          {icon}
        </span>
        {actions}
      </div>

      <div className="mt-4 min-w-0">
        <h3 className="truncate text-base font-extrabold tracking-tight text-slate-900">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 truncate text-xs font-semibold text-slate-400">{subtitle}</p>
        )}
        {badge && <div className="mt-2.5">{badge}</div>}
      </div>

      {fields.length > 0 && (
        <dl className="mt-4 grid gap-2.5 border-t border-slate-100 pt-4 text-sm">
          {fields.map((field, index) => (
            <div className="flex items-center justify-between gap-3" key={field.key ?? index}>
              <dt className="inline-flex flex-none items-center gap-1.5 text-xs font-semibold text-slate-400">
                {field.icon}
                {field.label}
              </dt>
              <dd className="min-w-0 max-w-[62%] truncate text-right font-bold text-slate-700">
                {field.value ?? "-"}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {children}

      {footer && <div className="mt-auto pt-5">{footer}</div>}
    </article>
  )
}
