import ResourcePage from "../components/ResourcePage"
import { feesApi, studentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Fees() {
  const { t } = useLanguage()

  const statusLabel = (status) =>
    status === "Paid" ? t("val.paid") : status === "Overdue" ? t("val.overdue") : t("val.unpaid")

  const statusTone = (status) =>
    status === "Paid" ? "badge--green" : status === "Unpaid" ? "badge--orange" : "badge--gray"

  return (
    <ResourcePage
      api={feesApi}
      managePermission="manage_fees"
      singular={t("lbl.fee")}
      title={t("page.fees")}
      description={t("fees.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "fee_type", label: t("lbl.feeType") },
        { key: "amount", label: t("lbl.amount") },
        { key: "due_date", label: t("lbl.dueDate") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
        ) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "fee_type", label: t("lbl.feeType"), required: true },
        { name: "amount", label: t("lbl.amount"), type: "number", required: true },
        { name: "due_date", label: t("lbl.dueDate"), type: "date", required: true },
        { name: "status", label: t("lbl.status"), type: "select", options: [
          { value: "Unpaid", label: t("val.unpaid") },
          { value: "Paid", label: t("val.paid") },
          { value: "Overdue", label: t("val.overdue") },
        ] },
      ]}
      searchKeys={["student.first_name", "student.last_name", "fee_type"]}
    />
  )
}