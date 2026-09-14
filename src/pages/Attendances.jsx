import ResourcePage from "../components/ResourcePage"
import { attendancesApi, studentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function Attendances() {
  const { t } = useLanguage()

  const statusLabel = (status) =>
    status === "Present" ? t("val.present") : status === "Late" ? t("val.late") : t("val.absent")

  const statusTone = (status) =>
    status === "Present" ? "badge--green" : status === "Late" ? "badge--orange" : "badge--gray"

  return (
    <ResourcePage
      api={attendancesApi}
      managePermission="manage_attendance"
      singular={t("lbl.attendance")}
      title={t("page.attendances")}
      description={t("attendances.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "class", label: t("lbl.class"), render: (item) => item.student?.class?.class_name ?? "-" },
        { key: "date", label: t("lbl.date") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
        ) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "date", label: t("lbl.date"), type: "date", required: true },
        { name: "status", label: t("lbl.status"), type: "select", required: true, options: [
          { value: "Present", label: t("val.present") },
          { value: "Absent", label: t("val.absent") },
          { value: "Late", label: t("val.late") },
          { value: "Excused", label: t("val.excused") },
        ] },
        { name: "note", label: t("lbl.note"), type: "textarea" },
      ]}
      searchKeys={["student.first_name", "student.last_name", "date", "status"]}
    />
  )
}