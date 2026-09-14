import ResourcePage from "../components/ResourcePage"
import { gradesApi, enrollmentsApi, toOptions } from "../services/schoolApi"
import { useLanguage } from "../context/LanguageContext"

const enrollmentLabel = (item) => {
  const student = `${item.student?.first_name ?? ""} ${item.student?.last_name ?? ""}`.trim()
  const course = item.course?.course_name ?? ""
  return [student, course].filter(Boolean).join(" - ")
}

const gradeBadge = (grade) => {
  const tone =
    grade === "A" || grade === "B" ? "badge--green"
      : grade === "C" ? "badge--blue"
      : grade === "D" ? "badge--orange"
      : "badge--gray"
  return <span className={`badge ${tone}`}>{grade}</span>
}

export default function Grades() {
  const { t } = useLanguage()

  return (
    <ResourcePage
      api={gradesApi}
      managePermission="manage_grades"
      singular={t("lbl.grade")}
      title={t("page.grades")}
      description={t("grades.desc")}
      columns={[
        { key: "id", label: t("lbl.id") },
        { key: "enrollment", label: t("lbl.studentCourse"), render: (item) => enrollmentLabel(item.enrollment) },
        { key: "assignment", label: t("lbl.assignment") },
        { key: "midterm", label: t("lbl.midterm") },
        { key: "final", label: t("lbl.final") },
        { key: "total", label: t("lbl.total") },
        { key: "grade", label: t("lbl.grade"), render: (item) => gradeBadge(item.grade) },
      ]}
      fields={[
        { name: "enrollment_id", label: t("lbl.enrollment"), type: "select", required: true, loadOptions: () => enrollmentsApi.list().then((rows) => toOptions(rows, enrollmentLabel)) },
        { name: "assignment", label: t("lbl.assignment"), type: "number" },
        { name: "midterm", label: t("lbl.midterm"), type: "number" },
        { name: "final", label: t("lbl.final"), type: "number" },
        { name: "total", label: t("lbl.total"), type: "number" },
        { name: "grade", label: t("lbl.grade"), required: true },
      ]}
      searchKeys={["enrollment.student.first_name", "enrollment.student.last_name", "enrollment.course.course_name"]}
    />
  )
}