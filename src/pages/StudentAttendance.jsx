import ResourcePage from "../components/ResourcePage"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function StudentAttendance() {
  const { t } = useLanguage()

  const statusLabel = (status) => {
    if (status === "Present") return t("val.present")
    if (status === "Late") return t("val.late")
    if (status === "Absent") return t("val.absent")
    if (status === "Excused") return t("val.excused")
    return status ?? "-"
  }

  const statusTone = (status) => {
    if (status === "Present") return "badge--green"
    if (status === "Late") return "badge--orange"
    return "badge--gray"
  }

  return (
    <ResourcePage
      api={studentPortalApi.attendance}
      managePermission="manage_attendance"
      singular={t("lbl.attendance")}
      title={t("page.myAttendance")}
      description={t("student.attendance.desc")}
      emptyMessage={t("student.emptyRecords")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "date", label: t("lbl.date") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
        ) },
        { key: "note", label: t("lbl.note"), render: (item) => item.note ?? "-" },
      ]}
      fields={[]}
      searchKeys={["date", "status", "note"]}
    />
  )
}
