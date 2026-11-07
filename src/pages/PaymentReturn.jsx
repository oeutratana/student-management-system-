import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

// How often the gateway is asked about the payment, and how long the page
// keeps asking before it gives up.
const POLL_INTERVAL = 4000
const MAX_POLLS = 30

const STORAGE_KEY = "payway.tran_id"

/**
 * Where the gateway sends the customer back to after paying.
 *
 * The page does not believe the query string: it asks the server, which asks
 * the gateway, and the answer decides what is shown.
 */
export default function PaymentReturn() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")

  const tranId =
    searchParams.get("tran_id") ||
    searchParams.get("tranId") ||
    sessionStorage.getItem(STORAGE_KEY) ||
    ""

  // A page without a transaction has nothing to ask about.
  const status = !tranId ? "unknown" : result ?? "checking"

  useEffect(() => {
    if (!tranId) {
      return undefined
    }

    let cancelled = false
    let polls = 0
    let timer = null

    const check = async () => {
      polls += 1

      try {
        const payload = await studentPortalApi.paymentStatus(tranId)

        if (cancelled) return

        const state = payload?.transaction?.status

        if (state === "Paid") {
          setResult("paid")
          sessionStorage.removeItem(STORAGE_KEY)
          return
        }

        if (["Failed", "Canceled", "Expired", "Refunded"].includes(state)) {
          setResult("failed")
          sessionStorage.removeItem(STORAGE_KEY)
          return
        }
      } catch (err) {
        if (cancelled) return

        setError(err?.message || t("payway.statusFailed"))
      }

      if (polls >= MAX_POLLS) {
        setResult("timeout")
        return
      }

      timer = setTimeout(check, POLL_INTERVAL)
    }

    check()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [tranId, t])

  const content = () => {
    if (status === "checking") {
      return (
        <div className="grid place-items-center gap-3 py-12 text-center">
          <span className="loader" />
          <p className="text-sm font-semibold text-slate-500">{t("payway.checking")}</p>
        </div>
      )
    }

    if (status === "paid") {
      return (
        <div className="grid place-items-center gap-3 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={34} />
          </span>
          <p className="text-lg font-extrabold text-slate-900">{t("payway.successTitle")}</p>
          <p className="max-w-sm text-sm font-semibold text-slate-500">{t("payway.successHint")}</p>
        </div>
      )
    }

    if (status === "failed" || status === "timeout" || status === "unknown") {
      return (
        <div className="grid place-items-center gap-3 py-12 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
            <XCircle size={34} />
          </span>
          <p className="text-lg font-extrabold text-slate-900">{t("payway.failedTitle")}</p>
          <p className="max-w-sm text-sm font-semibold text-slate-500">
            {error || t("payway.notCompleted")}
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_12px_40px_-28px_rgba(16,24,40,0.25)] sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            {status === "checking" ? (
              <Loader2 className="animate-spin" size={22} />
            ) : (
              <CheckCircle2 size={22} />
            )}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {t("payway.returnTitle")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{t("payway.returnHint")}</p>
          </div>
        </div>

        {content()}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 border-t border-slate-100 pt-5">
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5"
            to="/student/fees"
          >
            {t("page.myFees")}
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
            to="/student/payments"
          >
            {t("page.myPayments")}
          </Link>
        </div>
      </section>
    </div>
  )
}
