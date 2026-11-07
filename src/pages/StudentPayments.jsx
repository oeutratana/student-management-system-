import ResourcePage from "../components/ResourcePage"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function StudentPayments() {
  const { t } = useLanguage()

  const methodLabel = (method) =>
    method === "Cash" ? t("val.cash")
      : method === "Card" ? t("val.card")
      : method === "Bank Transfer" ? t("val.bankTransfer")
      : t("val.online")

  const formatMoney = (val) =>
    val === undefined || val === null || val === ""
      ? "-"
      : `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <ResourcePage
      api={studentPortalApi.payments}
      managePermission="manage_payments"
      singular={t("lbl.payment")}
      title={t("page.myPayments")}
      description={t("student.payments.desc")}
      emptyMessage={t("student.emptyRecords")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "amount", label: `${t("lbl.amount")} ($)`, render: (item) => formatMoney(item.amount) },
        { key: "payment_date", label: t("lbl.paymentDate") },
        { key: "payment_method", label: t("lbl.method"), render: (item) => methodLabel(item.payment_method) },
        { key: "reference", label: t("lbl.reference"), render: (item) => item.reference ?? "-" },
      ]}
      fields={[]}
      searchKeys={["payment_method", "reference"]}
    />
  )
}
