import ResourcePage from "../components/ResourcePage"
import { paymentsApi, studentsApi, feesApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const feeLabel = (item) => {
  const student = item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : ""
  return [student, item.fee_type].filter(Boolean).join(" - ")
}

export default function Payments() {
  const { t } = useLanguage()

  const methodLabel = (method) =>
    method === "Cash" ? t("val.cash")
      : method === "Card" ? t("val.card")
      : method === "Bank Transfer" ? t("val.bankTransfer")
      : t("val.online")

  return (
    <ResourcePage
      api={paymentsApi}
      managePermission="manage_payments"
      singular={t("lbl.payment")}
      title={t("page.payments")}
      description={t("payments.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "fee", label: t("lbl.fee"), render: (item) => item.fee?.fee_type ?? "-" },
        { key: "amount", label: t("lbl.amount") },
        { key: "payment_date", label: t("lbl.paymentDate") },
        { key: "payment_method", label: t("lbl.method"), render: (item) => methodLabel(item.payment_method) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "fee_id", label: t("lbl.fee"), type: "select", loadOptions: () => feesApi.list().then((rows) => toOptions(rows, feeLabel)) },
        { name: "amount", label: t("lbl.amount"), type: "number", required: true },
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