import ResourcePage from "../components/ResourcePage"
import { studentPortalApi } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

export default function StudentGrades() {
  const { t } = useLanguage()

  const gradeBadge = (grade) => {
    const tone = grade === "A" || grade === "B" || grade === "C" ? "badge--blue" : "badge--gray"
    return <span className={`badge ${tone}`}>{grade || "-"}</span>
  }

  return (
    <ResourcePage
      api={studentPortalApi.grades}
      managePermission="manage_grades"
      singular={t("lbl.grade")}
      title={t("page.myGrades")}
      description={t("student.grades.desc")}
      emptyMessage={t("student.emptyRecords")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "course", label: t("lbl.course"), render: (item) => item.enrollment?.course?.course_name ?? "-" },
        { key: "semester", label: t("lbl.semester"), render: (item) => item.enrollment?.semester ?? "-" },
        { key: "assignment", label: t("lbl.assignment") },
        { key: "midterm", label: t("lbl.midterm") },
        { key: "final", label: t("lbl.final") },
        { key: "total", label: t("lbl.total") },
        { key: "grade", label: t("lbl.grade"), render: (item) => gradeBadge(item.grade) },
      ]}
      fields={[]}
      searchKeys={["enrollment.course.course_name", "grade", "total"]}
    />
  )
}
