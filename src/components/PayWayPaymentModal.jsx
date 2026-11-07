import { useEffect, useRef, useState } from "react"
import { CheckCircle2, CreditCard, QrCode, RefreshCw, XCircle } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import Modal from "./Modal"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

// How often the gateway is asked about the payment, and how long the page
// keeps asking. A payment is finished within seconds, so the wait is short.
const POLL_INTERVAL = 5000
const MAX_POLLS = 24

const formatMoney = (value) =>
  `$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * The payment of one fee.
 *
 * Starting the payment is done on the server, which answers with the QR code
 * the student pays with. The page then asks the server what the gateway says
 * about the transaction until the money is confirmed - the browser never
 * decides on its own that a payment went through.
 */
function PayWaySheet({ fee, onPaid }) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState("starting")
  const [transaction, setTransaction] = useState(null)
  const [error, setError] = useState("")
  const timerRef = useRef(null)
  const pollsRef = useRef(0)
  const startedRef = useRef(false)

  useEffect(() => {
    // React runs effects twice while developing, and asking twice would open
    // two payment sessions for one click.
    if (startedRef.current) {
      return undefined
    }

    startedRef.current = true

    studentPortalApi
      .payFee(fee.id)
      .then((payload) => {
        setTransaction(payload.transaction)
        setPhase("waiting")

        // The gateway sends the customer back to the payment page; the
        // transaction id is kept so that page can find the payment even when
        // the redirect carries no id of its own.
        if (payload.transaction?.tran_id) {
          sessionStorage.setItem("payway.tran_id", payload.transaction.tran_id)
        }
      })
      .catch((err) => {
        setError(err?.message || t("payway.startFailed"))
        setPhase("failed")
      })

    return undefined
  }, [fee, t])

  // While the sheet is open the gateway is asked about the transaction until
  // it reports a final state.
  useEffect(() => {
    if (phase !== "waiting" || !transaction?.tran_id) {
      return undefined
    }

    let cancelled = false

    const check = async () => {
      pollsRef.current += 1

      try {
        const payload = await studentPortalApi.paymentStatus(transaction.tran_id)

        if (cancelled) return

        const state = payload?.transaction?.status

        if (state === "Paid") {
          setPhase("paid")
          onPaid?.(fee)
          return
        }

        if (["Failed", "Canceled", "Expired", "Refunded"].includes(state)) {
          setPhase("failed")
          setError(t("payway.notCompleted"))
          return
        }
      } catch (err) {
        if (cancelled) return

        setError(err?.message || t("payway.statusFailed"))
      }

      if (pollsRef.current >= MAX_POLLS) {
        setPhase("timeout")
        return
      }

      timerRef.current = setTimeout(check, POLL_INTERVAL)
    }

    timerRef.current = setTimeout(check, POLL_INTERVAL)

    return () => {
      cancelled = true

      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [phase, transaction, onPaid, fee, t])

  const amount = transaction?.amount ?? fee?.outstanding ?? fee?.amount ?? 0

  if (phase === "starting") {
    return (
      <div className="grid place-items-center gap-3 py-10 text-center">
        <span className="loader" />
        <p className="text-sm font-semibold text-slate-500">{t("payway.starting")}</p>
      </div>
    )
  }

  if (phase === "paid") {
    return (
      <div className="grid place-items-center gap-3 py-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={34} />
        </span>
        <p className="text-base font-extrabold text-slate-900">{t("payway.successTitle")}</p>
        <p className="max-w-sm text-sm font-semibold text-slate-500">{t("payway.successHint")}</p>
      </div>
    )
  }

  if (phase === "failed" || phase === "timeout") {
    return (
      <div className="grid place-items-center gap-3 py-10 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-rose-50 text-rose-600">
          <XCircle size={34} />
        </span>
        <p className="text-base font-extrabold text-slate-900">
          {phase === "timeout" ? t("payway.timeoutTitle") : t("payway.failedTitle")}
        </p>
        <p className="max-w-sm text-sm font-semibold text-slate-500">
          {error || t("payway.notCompleted")}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400">
            {t("payway.amountDue")}
          </p>
          <p className="mt-0.5 text-2xl font-extrabold tracking-tight text-slate-900">
            {formatMoney(amount)}
          </p>
        </div>
        <span className="rounded-xl bg-white px-3 py-1.5 text-[11px] font-extrabold text-slate-500 shadow-sm">
          {transaction?.tran_id}
        </span>
      </div>

      {transaction?.qr_image ? (
        <div className="mx-auto w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-4">
          <img
            alt={t("payway.qrAlt")}
            className="h-auto w-full rounded-2xl"
            src={transaction.qr_image}
          />
        </div>
      ) : transaction?.qr_string ? (
        <div className="mx-auto w-full max-w-xs rounded-3xl border border-slate-200 bg-white p-4">
          <QRCodeCanvas
            bgColor="#ffffff"
            fgColor="#0f172a"
            includeMargin
            size={220}
            value={transaction.qr_string}
          />
        </div>
      ) : (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {t("payway.noQr")}
        </p>
      )}

      {transaction?.abapay_deeplink && (
        <a
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
          href={transaction.abapay_deeplink}
        >
          <CreditCard size={17} />
          {t("payway.payWithApp")}
        </a>
      )}

      <div className="flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs font-medium text-indigo-900">
        <QrCode className="mt-0.5 h-4 w-4 flex-none" />
        <span>{t("payway.waitingHint")}</span>
      </div>

      {error && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * The sheet of a student who pays a fee.
 *
 * The payment itself lives in a child component that is mounted per fee, so
 * opening the sheet for another fee starts from the beginning instead of
 * showing the state of the previous one.
 */
export default function PayWayPaymentModal({ open, onClose, fee, onPaid }) {
  const { t } = useLanguage()

  return (
    <Modal
      icon={
        <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25">
          <QrCode size={20} />
        </span>
      }
      onClose={onClose}
      open={open}
      size="max-w-md"
      subtitle={fee ? `${fee.fee_type} · ${formatMoney(fee.amount)}` : ""}
      title={t("payway.title")}
      footer={
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-100"
          onClick={onClose}
          type="button"
        >
          <RefreshCw size={16} />
          {t("payway.checkLater")}
        </button>
      }
    >
      {fee ? <PayWaySheet fee={fee} onPaid={onPaid} /> : null}
    </Modal>
  )
}
