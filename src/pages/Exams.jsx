import ResourcePage from "../components/ResourcePage"
import { examsApi, coursesApi, toOptions } from "../services/schoolApi"

export default function Exams() {
  return (
    <ResourcePage
      api={examsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "exam_name", label: "Exam" },
        { key: "course", label: "Course", render: (item) => item.course?.course_name ?? "-" },
        { key: "exam_date", label: "Date" },
        { key: "total_marks", label: "Total Marks" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Scheduled" ? "badge--blue" : item.status === "Completed" ? "badge--green" : "badge--gray"}`}>{item.status}</span>
        ) },
      ]}
      description="Plan and manage examinations for courses."
      fields={[
        { name: "exam_name", label: "Exam Name", required: true },
        { name: "course_id", label: "Course", type: "select", required: true, loadOptions: () => coursesApi.list().then((rows) => toOptions(rows, "course_name")) },
        { name: "exam_date", label: "Exam Date", type: "date", required: true },
        { name: "total_marks", label: "Total Marks", type: "number" },
        { name: "status", label: "Status", type: "select", options: [
          { value: "Scheduled", label: "Scheduled" },
          { value: "Completed", label: "Completed" },
          { value: "Cancelled", label: "Cancelled" },
        ] },
      ]}
      searchKeys={["exam_name", "course.course_name"]}
      title="Exams"
    />
  )
}
