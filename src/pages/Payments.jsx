import { CalendarDays, CreditCard, Hash, Wallet } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { feesApi, paymentsApi, studentOptionLabel, studentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Payments() {
  const { t } = useLanguage()

  const methodLabel = (method) =>
    method === "Cash" ? t("val.cash")
      : method === "Card" ? t("val.card")
      : method === "Bank Transfer" ? t("val.bankTransfer")
      : t("val.online")

  const feeTypeLabel = (feeType) => {
    if (feeType === "Tuition Fee" || feeType === "Tuition") return t("val.tuitionFee")
    if (feeType === "Registration Fee" || feeType === "Registration") return t("val.registrationFee")
    if (feeType === "Examination Fee" || feeType === "Exam Fee" || feeType === "Exam") return t("val.examinationFee")
    return feeType || "-"
  }

  const feeOptionLabel = (item) => {
    const student = item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : ""
    return [student, feeTypeLabel(item.fee_type)].filter(Boolean).join(" - ")
  }

  const formatMoney = (val) =>
    val === undefined || val === null || val === ""
      ? "-"
      : `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <ResourcePage
      api={paymentsApi}
      managePermission="manage_payments"
      singular={t("lbl.payment")}
      title={t("page.payments")}
      description={t("payments.desc")}
      defaultView="grid"
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-extrabold text-sky-700 ring-1 ring-inset ring-sky-700/10">
              {methodLabel(item.payment_method)}
            </span>
          }
          fields={[
            {
              key: "amount",
              icon: <Wallet size={13} />,
              label: t("lbl.amount"),
              value: formatMoney(item.amount),
            },
            {
              key: "date",
              icon: <CalendarDays size={13} />,
              label: t("lbl.paymentDate"),
              value: item.payment_date ?? "-",
            },
            {
              key: "reference",
              icon: <Hash size={13} />,
              label: t("lbl.reference"),
              value: item.reference ?? "-",
            },
          ]}
          icon={<CreditCard size={24} />}
          subtitle={feeTypeLabel(item.fee?.fee_type)}
          title={
            item.student?.first_name
              ? `${item.student.first_name} ${item.student.last_name ?? ""}`.trim()
              : "-"
          }
          tone="sky"
        />
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "fee", label: t("lbl.fee"), render: (item) => feeTypeLabel(item.fee?.fee_type) },
        { key: "amount", label: `${t("lbl.amount")} ($)`, render: (item) => formatMoney(item.amount) },
        { key: "payment_date", label: t("lbl.paymentDate") },
        { key: "payment_method", label: t("lbl.method"), render: (item) => methodLabel(item.payment_method) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, studentOptionLabel)) },
        { name: "fee_id", label: t("lbl.fee"), type: "select", loadOptions: () => feesApi.list().then((rows) => toOptions(rows, feeOptionLabel)) },
        { name: "amount", label: `${t("lbl.amount")} ($)`, type: "number", step: "0.01", min: "0", required: true },
        { name: "payment_date", label: t("lbl.paymentDate"), type: "date", required: true },
        { name: "payment_method", label: t("lbl.method"), type: "select", required: true, options: [
          { value: "Cash", label: t("val.cash") },
          { value: "Card", label: t("val.card") },
          { value: "Bank Transfer", label: t("val.bankTransfer") },
          { value: "Online", label: t("val.online") },
        ] },
        { name: "reference", label: t("lbl.reference") },
      ]}
      searchKeys={["student.first_name", "student.last_name", "fee.fee_type", "payment_method"]}
    />
  )
}