import ResourcePage from "../components/ResourcePage"
import { enrollmentsApi, studentsApi, coursesApi, toOptions } from "../services/schoolApi"

const studentName = (item) => `${item.student?.first_name ?? ""} ${item.student?.last_name ?? ""}`.trim() || "-"

export default function Enrollments() {
  return (
    <ResourcePage
      api={enrollmentsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "student", label: "Student", render: studentName },
        { key: "course", label: "Course", render: (item) => item.course?.course_name ?? "-" },
        { key: "semester", label: "Semester" },
        { key: "academic_year", label: "Academic Year" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Active" ? "badge--green" : item.status === "Completed" ? "badge--blue" : "badge--gray"}`}>{item.status}</span>
        ) },
      ]}
      description="Enroll students into courses for each academic term."
      fields={[
        { name: "student_id", label: "Student", type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "course_id", label: "Course", type: "select", required: true, loadOptions: () => coursesApi.list().then((rows) => toOptions(rows, "course_name")) },
        { name: "semester", label: "Semester", required: true },
        { name: "academic_year", label: "Academic Year", required: true },
        { name: "status", label: "Status", type: "select", required: true, options: [
          { value: "Active", label: "Active" },
          { value: "Completed", label: "Completed" },
          { value: "Dropped", label: "Dropped" },
        ] },
      ]}
      searchKeys={["student.first_name", "student.last_name", "course.course_name", "academic_year"]}
      title="Enrollments"
    />
  )
}
