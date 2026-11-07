import { useMemo } from "react"
import { CalendarDays, ReceiptText, Wallet } from "lucide-react"
import EntityCard from "../components/EntityCard"
import ResourcePage from "../components/ResourcePage"
import { feesApi, studentOptionLabel, studentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Fees() {
  const { t } = useLanguage()

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

  const feeTypeOptions = useMemo(
    () => [
      { value: "Tuition Fee", label: t("val.tuitionFee") },
      { value: "Registration Fee", label: t("val.registrationFee") },
      { value: "Examination Fee", label: t("val.examinationFee") },
    ],
    [t],
  )

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
        key: "fee_type",
        label: t("lbl.feeType"),
        options: feeTypeOptions,
      },
      {
        key: "status",
        label: t("lbl.status"),
        options: statusOptions,
      },
    ],
    [t, feeTypeOptions, statusOptions],
  )

  const formatMoney = (val) =>
    val === undefined || val === null || val === ""
      ? "-"
      : `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const studentName = (item) =>
    item.student?.first_name
      ? `${item.student.first_name} ${item.student.last_name ?? ""}`.trim()
      : "-"

  return (
    <ResourcePage
      api={feesApi}
      managePermission="manage_fees"
      singular={t("lbl.fee")}
      title={t("page.fees")}
      description={t("fees.desc")}
      defaultView="grid"
      filters={filters}
      gridCard={(item, { actions }) => (
        <EntityCard
          actions={actions}
          badge={
            <span className={`badge ${statusTone(item.status)}`}>
              {statusLabel(item.status)}
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
              key: "due",
              icon: <CalendarDays size={13} />,
              label: t("lbl.dueDate"),
              value: item.due_date ?? "-",
            },
          ]}
          icon={<ReceiptText size={24} />}
          subtitle={feeTypeLabel(item.fee_type)}
          title={studentName(item)}
          tone={item.status === "Paid" ? "emerald" : item.status === "Overdue" ? "rose" : "amber"}
        />
      )}
      columns={[
        { key: "id", label: t("lbl.id") },
        {
          key: "student",
          label: t("lbl.student"),
          render: (item) =>
            item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-",
        },
        {
          key: "fee_type",
          label: t("lbl.feeType"),
          render: (item) => feeTypeLabel(item.fee_type),
        },
        {
          key: "amount",
          label: `${t("lbl.amount")} ($)`,
          render: (item) => formatMoney(item.amount),
        },
        { key: "due_date", label: t("lbl.dueDate") },
        {
          key: "status",
          label: t("lbl.status"),
          render: (item) => (
            <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
          ),
        },
      ]}
      fields={[
        {
          name: "student_id",
          label: t("lbl.student"),
          type: "select",
          required: true,
          loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, studentOptionLabel)),
        },
        {
          name: "fee_type",
          label: t("lbl.feeType"),
          type: "select",
          required: true,
          options: feeTypeOptions,
        },
        {
          name: "amount",
          label: `${t("lbl.amount")} ($)`,
          type: "number",
          step: "0.01",
          min: "0",
          required: true,
        },
        { name: "due_date", label: t("lbl.dueDate"), type: "date", required: true },
        {
          name: "status",
          label: t("lbl.status"),
          type: "select",
          options: statusOptions,
        },
      ]}
      searchKeys={["student.first_name", "student.last_name", "fee_type"]}
    />
  )
}