import { useEffect, useState } from "react"
import { BarChart3, ClipboardList, Download, FileText, FilePlus2, RefreshCw, Users } from "lucide-react"
import { reportsApi } from "../services/schoolApi"

const reportStyles = [
  { icon: ClipboardList, tint: "bg-indigo-50 text-indigo-600" },
  { icon: BarChart3, tint: "bg-emerald-50 text-emerald-600" },
  { icon: Users, tint: "bg-violet-50 text-violet-600" },
]

const formatDate = (value) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

const Reports = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    reportsApi
      .list()
      .then((rows) => {
        if (!cancelled) setReports(rows ?? [])
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_40px_-28px_rgba(16,24,40,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <FileText size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">
              Insights
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">Reports</h1>
            <p className="mt-1 text-sm text-slate-500">Generate and review school performance reports.</p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
          disabled={loading}
          type="button"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <FilePlus2 size={18} />}
          {loading ? "Loading" : "Create Report"}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-extrabold text-slate-900">Available Reports</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {loading ? "Loading reports..." : `${reports.length} generated reports ready for review`}
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="grid place-items-center gap-3 px-6 py-16">
              <span className="loader" />
              <p className="text-sm font-semibold text-slate-400">Loading reports...</p>
            </div>
          ) : reports.length ? (
            reports.map((report, index) => {
            const style = reportStyles[index % reportStyles.length]
            const Icon = style.icon
            const title = report.title ?? report.name ?? `Report #${report.id}`
            const type = report.type ?? report.category ?? "School"
            const updated = report.updated_at ?? report.created_at ?? report.updated
            return (
              <div
                className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between"
                key={report.id ?? title}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${style.tint}`}>
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-extrabold text-slate-900">{title}</h3>
                    <p className="mt-0.5 text-sm text-slate-500">{type} report</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 sm:flex-none">
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Updated</p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatDate(updated)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
                      type="button"
                    >
                      <FileText size={16} />
                      View
                    </button>
                    <button
                      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-100"
                      title="Download"
                      type="button"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )
            })
          ) : (
            <div className="px-6 py-16 text-center text-sm font-semibold text-slate-400">
              No reports found
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Reports
