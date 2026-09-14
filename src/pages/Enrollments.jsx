import ResourcePage from "../components/ResourcePage"
import { enrollmentsApi, studentsApi, coursesApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const studentName = (item) => `${item.student?.first_name ?? ""} ${item.student?.last_name ?? ""}`.trim() || "-"

export default function Enrollments() {
  const { t } = useLanguage()

  const statusLabel = (status) =>
    status === "Active" ? t("val.active") : status === "Completed" ? t("val.completed") : t("val.dropped")

  return (
    <ResourcePage
      api={enrollmentsApi}
      managePermission="manage_enrollments"
      singular={t("lbl.enrollment")}
      title={t("page.enrollments")}
      description={t("enrollments.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "student", label: t("lbl.student"), render: studentName },
        { key: "course", label: t("lbl.course"), render: (item) => item.course?.course_name ?? "-" },
        { key: "semester", label: t("lbl.semester") },
        { key: "academic_year", label: t("lbl.academicYear") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${item.status === "Active" ? "badge--green" : item.status === "Completed" ? "badge--blue" : "badge--gray"}`}>{statusLabel(item.status)}</span>
        ) },
      ]}
      fields={[
        { name: "student_id", label: t("lbl.student"), type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "course_id", label: t("lbl.course"), type: "select", required: true, loadOptions: () => coursesApi.list().then((rows) => toOptions(rows, "course_name")) },
        { name: "semester", label: t("lbl.semester"), required: true },
        { name: "academic_year", label: t("lbl.academicYear"), required: true },
        { name: "status", label: t("lbl.status"), type: "select", required: true, options: [
          { value: "Active", label: t("val.active") },
          { value: "Completed", label: t("val.completed") },
          { value: "Dropped", label: t("val.dropped") },
        ] },
      ]}
      searchKeys={["student.first_name", "student.last_name", "course.course_name", "academic_year"]}
    />
  )
}