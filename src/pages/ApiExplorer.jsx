import { useCallback, useEffect, useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  Database,
  Inbox,
  RefreshCw,
  Server,
  XCircle,
} from "lucide-react"
import { authApi, dashboardApi, reportsApi } from "../services/schoolApi"
import {
  announcementsApi,
  attendancesApi,
  classesApi,
  coursesApi,
  departmentsApi,
  enrollmentsApi,
  examsApi,
  feesApi,
  gradesApi,
  parentsApi,
  paymentsApi,
  studentsApi,
  teachersApi,
  usersApi,
} from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const resources = [
  { key: "me", labelKey: "api.profile", path: "GET /me", fetch: authApi.me },
  { key: "dashboard", labelKey: "page.dashboard", path: "GET /dashboard", fetch: dashboardApi.index },
  { key: "users", labelKey: "page.users", path: "GET /users", fetch: usersApi.list },
  { key: "students", labelKey: "page.students", path: "GET /students", fetch: studentsApi.list },
  { key: "teachers", labelKey: "page.teachers", path: "GET /teachers", fetch: teachersApi.list },
  { key: "parents", labelKey: "page.parents", path: "GET /parents", fetch: parentsApi.list },
  { key: "departments", labelKey: "page.departments", path: "GET /departments", fetch: departmentsApi.list },
  { key: "classes", labelKey: "page.classes", path: "GET /classes", fetch: classesApi.list },
  { key: "courses", labelKey: "page.courses", path: "GET /courses", fetch: coursesApi.list },
  { key: "enrollments", labelKey: "page.enrollments", path: "GET /enrollments", fetch: enrollmentsApi.list },
  { key: "grades", labelKey: "page.grades", path: "GET /grades", fetch: gradesApi.list },
  { key: "attendances", labelKey: "page.attendances", path: "GET /attendances", fetch: attendancesApi.list },
  { key: "exams", labelKey: "page.exams", path: "GET /exams", fetch: examsApi.list },
  { key: "fees", labelKey: "page.fees", path: "GET /fees", fetch: feesApi.list },
  { key: "payments", labelKey: "page.payments", path: "GET /payments", fetch: paymentsApi.list },
  { key: "announcements", labelKey: "page.announcements", path: "GET /announcements", fetch: announcementsApi.list },
  { key: "reports", labelKey: "page.reports", path: "GET /reports", fetch: reportsApi.list },
]

const countOf = (data) => (Array.isArray(data) ? data.length : data ? 1 : 0)

const ApiExplorer = () => {
  const { t } = useLanguage();
  const [results, setResults] = useState(resources.map((resource) => ({ ...resource, status: "idle", count: 0, data: null, error: "" })))
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const settled = await Promise.all(
      resources.map(async (resource) => {
        try {
          const data = await resource.fetch()
          return { ...resource, status: "ok", count: countOf(data), data, error: "" }
        } catch (err) {
          return { ...resource, status: "error", count: 0, data: null, error: err.message, statusCode: err.status }
        }
      }),
    )
    setResults(settled)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll()
  }, [fetchAll])

  const okCount = results.filter((result) => result.status === "ok").length
  const failCount = results.filter((result) => result.status === "error").length
  const totalRecords = results.reduce((sum, result) => sum + result.count, 0)

  const toggle = (key) => setExpanded((current) => (current === key ? null : key))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_40px_-28px_rgba(16,24,40,0.25)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <Server size={22} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-indigo-500">
              {t("api.eyebrow")}
            </p>
            <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">{t("api.title")}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("api.desc")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-600">
              <CheckCircle2 size={16} />
              {okCount} {t("api.ok")}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-500">
              <XCircle size={16} />
              {failCount} {t("api.failed")}
            </span>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-600/35 disabled:translate-y-0 disabled:opacity-60"
            disabled={loading}
            onClick={fetchAll}
            type="button"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
            {loading ? t("api.fetching") : t("api.fetchAll")}
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid place-items-center gap-3 rounded-3xl border border-slate-200/80 bg-white py-16 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
          <span className="loader" />
          <p className="text-sm font-semibold text-slate-400">{t("api.fetchingEndpoints", { n: resources.length })}</p>
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {results.map((result) => {
            const isOk = result.status === "ok"
            const isExpanded = expanded === result.key
            return (
              <section
                className={`overflow-hidden rounded-3xl border bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ${
                  isOk ? "border-slate-200/80" : "border-rose-200/70"
                }`}
                key={result.key}
              >
                <button
                  className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-slate-50/70"
                  onClick={() => toggle(result.key)}
                  type="button"
                >
                  <span
                    className={`grid h-10 w-10 flex-none place-items-center rounded-xl ${
                      isOk ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                    }`}
                  >
                    {isOk ? <Database size={18} /> : <XCircle size={18} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <strong className="text-sm font-extrabold text-slate-900">{t(result.labelKey)}</strong>
                      <code className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500">
                        {result.path}
                      </code>
                    </span>
                    <span className="mt-1 block text-xs font-semibold">
                      {isOk ? (
                        <span className="text-emerald-600">
                          {result.count} {result.count === 1 ? t("api.recordsOne") : t("api.recordsMany")}
                        </span>
                      ) : (
                        <span className="text-rose-500">
                          HTTP {result.statusCode ?? "error"} - {result.error}
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronDown
                    className={`flex-none text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    size={18}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-slate-100">
                    {isOk ? (
                      result.count ? (
                        <pre className="max-h-96 overflow-auto bg-slate-950 p-5 text-[12px] leading-5 text-slate-200">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      ) : (
                        <div className="grid place-items-center gap-3 px-6 py-12 text-slate-400">
                          <Inbox size={26} />
                          <p className="text-sm font-bold">{t("api.noRecords")}</p>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-3 bg-rose-50 px-5 py-5">
                        <XCircle className="flex-none text-rose-500" size={20} />
                        <div>
                          <p className="text-sm font-extrabold text-rose-700">{t("api.requestFailed")}</p>
                          <p className="mt-0.5 text-sm text-rose-600">
                            {result.error}
                            {result.statusCode ? ` (HTTP ${result.statusCode})` : ""}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {!loading && (
        <p className="text-center text-xs font-semibold text-slate-400">
          {t("api.summary", {
            n: resources.length,
            total: totalRecords,
            success: okCount,
            fail: failCount > 0 ? t("api.failSuffix", { fail: failCount }) : "",
          })}
        </p>
      )}
    </div>
  )
}

export default ApiExplorer
