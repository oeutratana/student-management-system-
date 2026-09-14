import { useEffect, useState } from "react"
import {
  Bell,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  RefreshCw,
  School,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react"
import { apiRequest } from "../services/apiClient"
import { useLanguage } from "../context/LanguageContext"

const formatNumber = (value) => Number(value ?? 0).toLocaleString()

const formatMoney = (value) =>
  `$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const kpiCards = (reports, t) => [
  { label: t("reports.students"), value: reports.students, icon: Users, tint: "bg-indigo-50 text-indigo-600" },
  { label: t("reports.classes"), value: reports.classes, icon: School, tint: "bg-violet-50 text-violet-600" },
  { label: t("reports.courses"), value: reports.courses, icon: GraduationCap, tint: "bg-emerald-50 text-emerald-600" },
  { label: t("reports.exams"), value: reports.exams, icon: Bell, tint: "bg-amber-50 text-amber-500" },
  {
    label: t("reports.avgGrade"),
    value: reports.average_grade != null ? `${Number(reports.average_grade).toFixed(1)}%` : "-",
    icon: Trophy,
    tint: "bg-rose-50 text-rose-500",
  },
  {
    label: reports.fees_collected != null ? t("reports.feesCollected") : t("reports.paymentsTotal"),
    value: reports.fees_collected != null
      ? formatMoney(reports.fees_collected)
      : formatMoney(reports.payments_total),
    icon: CircleDollarSign,
    tint: "bg-sky-50 text-sky-600",
  },
]

const attendanceRows = (reports, t) => {
  const a = reports.attendance ?? {}
  const rows = [
    { label: t("val.present"), value: a.present, color: "text-emerald-600 bg-emerald-500" },
    { label: t("val.absent"), value: a.absent, color: "text-rose-500 bg-rose-500" },
  ]
  if (a.late != null) rows.push({ label: t("val.late"), value: a.late, color: "text-amber-500 bg-amber-400" })
  if (a.excused != null) rows.push({ label: t("val.excused"), value: a.excused, color: "text-slate-500 bg-slate-400" })
  return rows
}

const Reports = () => {
  const { t } = useLanguage()
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const load = () => {
    setLoading(true)
    setError("")
    apiRequest("/reports")
      .then((data) => setReports(data ?? {}))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const attendance = reports?.attendance ?? {}
  const attendanceTotal = attendance.total ?? 0
  const attendanceRate = attendanceTotal
    ? Math.round(((attendance.present ?? 0) / attendanceTotal) * 100)
    : 0
  const fees = reports?.fees

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_40px_-28px_rgba(16,24,40,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <FileText size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">
              {t("reports.eyebrow")}
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">{t("reports.title")}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("reports.desc")}
            </p>
          </div>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35"
          disabled={loading}
          onClick={load}
          type="button"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          {loading ? t("reports.loading") : t("reports.refresh")}
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <div className="grid place-items-center gap-3 rounded-3xl border border-slate-200/80 bg-white py-24 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="loader" />
          <p className="text-sm font-semibold text-slate-400">{t("reports.loadingReports")}</p>
        </div>
      ) : !reports ? (
        <div className="rounded-3xl border border-slate-200/80 bg-white px-6 py-16 text-center text-sm font-semibold text-slate-400 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          {t("reports.noData")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {kpiCards(reports, t).map((card) => {
              const Icon = card.icon
              return (
                <div
                  className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_30px_-18px_rgba(16,24,40,0.2)]"
                  key={card.label}
                >
                  <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${card.tint}`}>
                    <Icon size={22} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-500">{card.label}</p>
                    <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
                      {card.value ?? 0}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-12 gap-6">
            <section className="col-span-12 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] xl:col-span-7">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CalendarDays size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t("reports.attendanceSummary")}</h2>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                  <TrendingUp size={13} />
                  {t("reports.percentPresent", { rate: attendanceRate })}
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                {attendanceRows(reports, t).map((row) => {
                  const percent = attendanceTotal ? Math.round(((row.value ?? 0) / attendanceTotal) * 100) : 0
                  return (
                    <div className="flex flex-1 flex-col items-center gap-2" key={row.label}>
                      <p className="text-2xl font-extrabold text-slate-900">{formatNumber(row.value)}</p>
                      <div className="flex h-28 w-full max-w-16 items-end justify-center rounded-xl bg-slate-50">
                        <div
                          className={`w-full rounded-t-xl ${row.color.split(" ")[1]}`}
                          style={{ height: `${Math.max(percent, 2)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${row.color.split(" ")[0]}`}>{row.label}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="col-span-12 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] xl:col-span-5">
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                  <CircleDollarSign size={20} />
                </span>
                <h2 className="text-lg font-bold text-slate-900">{t("reports.feeCollection")}</h2>
              </div>

              {fees ? (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-600/25">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-200">{t("reports.totalFeeAmount")}</p>
                    <p className="mt-1 text-3xl font-extrabold">{formatMoney(fees.total_amount)}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-emerald-50 p-3">
                      <p className="text-xl font-extrabold text-slate-900">{formatNumber(fees.paid)}</p>
                      <p className="text-xs font-bold text-emerald-600">{t("reports.paid")}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-xl font-extrabold text-slate-900">{formatNumber(fees.unpaid)}</p>
                      <p className="text-xs font-bold text-amber-500">{t("reports.unpaid")}</p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-3">
                      <p className="text-xl font-extrabold text-slate-900">{formatNumber(fees.overdue)}</p>
                      <p className="text-xs font-bold text-rose-500">{t("reports.overdue")}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid place-items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-8 text-center">
                  <ClipboardCheck size={28} className="text-slate-300" />
                  <div>
                    <p className="font-extrabold text-slate-700">{formatMoney(reports.fees_collected)}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">{t("reports.collectedFrom")}</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  )
}

export default Reports