import ResourcePage from "../components/ResourcePage"
import { gradesApi, enrollmentsApi, toOptions } from "../services/schoolApi"

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
  return (
    <ResourcePage
      api={gradesApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "enrollment", label: "Student / Course", render: (item) => enrollmentLabel(item.enrollment) },
        { key: "assignment", label: "Assignment" },
        { key: "midterm", label: "Midterm" },
        { key: "final", label: "Final" },
        { key: "total", label: "Total" },
        { key: "grade", label: "Grade", render: (item) => gradeBadge(item.grade) },
      ]}
      description="Record assignment, midterm and final scores with calculated totals."
      fields={[
        { name: "enrollment_id", label: "Enrollment", type: "select", required: true, loadOptions: () => enrollmentsApi.list().then((rows) => toOptions(rows, enrollmentLabel)) },
        { name: "assignment", label: "Assignment", type: "number" },
        { name: "midterm", label: "Midterm", type: "number" },
        { name: "final", label: "Final", type: "number" },
        { name: "total", label: "Total", type: "number" },
        { name: "grade", label: "Grade", required: true },
      ]}
      searchKeys={["enrollment.student.first_name", "enrollment.student.last_name", "enrollment.course.course_name"]}
      title="Grades"
    />
  )
}
