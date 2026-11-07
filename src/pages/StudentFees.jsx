import { useMemo, useState } from "react"
import { CheckCircle2, CreditCard } from "lucide-react"
import { Link } from "react-router-dom"
import ResourcePage from "../components/ResourcePage"
import PayWayPaymentModal from "../components/PayWayPaymentModal"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function StudentFees() {
  const { t } = useLanguage()
  const [payingFee, setPayingFee] = useState(null)
  // A payment that went through changes the list, so the page is reloaded.
  const [reloadKey, setReloadKey] = useState(0)
  // The fee that was just paid, so the page can say so.
  const [paidFee, setPaidFee] = useState(null)

  const statusLabel = (status) =>
    status === "Paid" ? t("val.paid") : status === "Overdue" ? t("val.overdue") : t("val.unpaid")

  const statusTone = (status) =>
    status === "Paid" ? "badge--green" : status === "Unpaid" ? "badge--orange" : "badge--gray"

  const feeTypeLabel = (feeType) => {
    if (feeType === "Tuition Fee" || feeType === "Tuition") return t("val.tuitionFee")
    if (feeType === "Registration Fee" || feeType === "Registration") return t("val.registrationFee")
    if (feeType === "Examination Fee" || feeType === "Exam Fee" || feeType === "Exam") return t("val.examinationFee")
    return feeType || "-"
  }

  const statusOptions = useMemo(
    () => [
      { value: "Unpaid", label: t("val.unpaid") },
      { value: "Paid", label: t("val.paid") },
      { value: "Overdue", label: t("val.overdue") },
    ],
    [t],
  )

  const filters = useMemo(
    () => [
      {
        key: "status",
        label: t("lbl.status"),
        options: statusOptions,
      },
    ],
    [t, statusOptions],
  )

  const formatMoney = (val) =>
    val === undefined || val === null || val === ""
      ? "-"
      : `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // What is still owed on a fee: the server works it out from the fee and the
  // payments already recorded against it.
  const outstandingOf = (fee) => {
    if (fee.outstanding !== undefined && fee.outstanding !== null) {
      return Number(fee.outstanding)
    }

    if (fee.status === "Paid") {
      return 0
    }

    return Math.max(0, Number(fee.amount) - Number(fee.paid_amount || 0))
  }

  return (
    <>
      {paidFee && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-emerald-600 text-white">
            <CheckCircle2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-emerald-900">
              {t("payway.paidTitle", { amount: formatMoney(paidFee.amount), fee: paidFee.fee_type })}
            </p>
            <p className="text-xs font-semibold text-emerald-700">{t("payway.paidHint")}</p>
          </div>
          <Link
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
            to="/student/payments"
          >
            {t("page.myPayments")}
          </Link>
          <button
            className="text-xs font-bold text-emerald-700 underline-offset-2 hover:underline"
            onClick={() => setPaidFee(null)}
            type="button"
          >
            {t("payway.close")}
          </button>
        </div>
      )}

      <ResourcePage
        key={reloadKey}
        api={studentPortalApi.fees}
        managePermission="manage_fees"
        singular={t("lbl.fee")}
        title={t("page.myFees")}
        description={t("student.fees.desc")}
        emptyMessage={t("student.emptyRecords")}
        filters={filters}
        columns={[
          { key: "id", label: t("lbl.id") },
          { key: "fee_type", label: t("lbl.feeType"), render: (item) => feeTypeLabel(item.fee_type) },
          { key: "amount", label: `${t("lbl.amount")} ($)`, render: (item) => formatMoney(item.amount) },
          {
            key: "outstanding",
            label: t("payway.outstanding"),
            render: (item) => formatMoney(outstandingOf(item)),
          },
          { key: "due_date", label: t("lbl.dueDate") },
          { key: "status", label: t("lbl.status"), render: (item) => (
            <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
          ) },
          {
            key: "actions",
            label: t("res.actions"),
            render: (item) => {
              if (item.status === "Paid" || outstandingOf(item) <= 0) {
                return <span className="text-xs font-semibold text-slate-400">-</span>
              }

              return (
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
                  onClick={() => setPayingFee(item)}
                  type="button"
                >
                  <CreditCard size={15} />
                  {t("payway.payNow")}
                </button>
              )
            },
          },
        ]}
        fields={[]}
        searchKeys={["fee_type", "status"]}
      />

      <PayWayPaymentModal
        fee={payingFee}
        onClose={() => setPayingFee(null)}
        onPaid={(fee) => {
          setPaidFee(fee)
          setReloadKey((key) => key + 1)
        }}
        open={Boolean(payingFee)}
      />
    </>
  )
}
