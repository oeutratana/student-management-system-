import ResourcePage from "../components/ResourcePage"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function StudentCourses() {
  const { t } = useLanguage()

  const statusLabel = (status) => {
    if (status === "Active") return t("val.active")
    if (status === "Completed") return t("val.completed")
    if (status === "Dropped") return t("val.dropped")
    return status ?? "-"
  }

  const statusTone = (status) =>
    status === "Active" ? "badge--green" : status === "Completed" ? "badge--blue" : "badge--gray"

  return (
    <ResourcePage
      api={studentPortalApi.courses}
      managePermission="manage_courses"
      singular={t("lbl.course")}
      title={t("page.myCourses")}
      description={t("student.courses.desc")}
      emptyMessage={t("student.emptyRecords")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "course", label: t("lbl.course"), render: (item) => item.course?.course_name ?? "-" },
        { key: "course_code", label: t("lbl.courseCode"), render: (item) => item.course?.course_code ?? "-" },
        { key: "credit", label: t("lbl.credits"), render: (item) => item.course?.credit ?? "-" },
        { key: "semester", label: t("lbl.semester") },
        { key: "academic_year", label: t("lbl.academicYear") },
        { key: "status", label: t("lbl.status"), render: (item) => (
          <span className={`badge ${statusTone(item.status)}`}>{statusLabel(item.status)}</span>
        ) },
      ]}
      fields={[]}
      searchKeys={["course.course_name", "course.course_code", "semester", "academic_year"]}
    />
  )
}
