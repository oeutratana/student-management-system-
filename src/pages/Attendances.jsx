import ResourcePage from "../components/ResourcePage"
import { attendancesApi, studentsApi, classesApi, toOptions } from "../services/schoolApi"

export default function Attendances() {
  return (
    <ResourcePage
      api={attendancesApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "student", label: "Student", render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
        { key: "class", label: "Class", render: (item) => item.class?.class_name ?? item.student?.class?.class_name ?? "-" },
        { key: "date", label: "Date" },
        { key: "status", label: "Status", render: (item) => (
          <span className={`badge ${item.status === "Present" ? "badge--green" : item.status === "Late" ? "badge--orange" : "badge--gray"}`}>{item.status}</span>
        ) },
      ]}
      description="Track daily attendance records for each student."
      fields={[
        { name: "student_id", label: "Student", type: "select", required: true, loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
        { name: "class_id", label: "Class", type: "select", loadOptions: () => classesApi.list().then((rows) => toOptions(rows, "class_name")) },
        { name: "date", label: "Date", type: "date", required: true },
        { name: "status", label: "Status", type: "select", required: true, options: [
          { value: "Present", label: "Present" },
          { value: "Absent", label: "Absent" },
          { value: "Late", label: "Late" },
        ] },
      ]}
      searchKeys={["student.first_name", "student.last_name", "date", "status"]}
      title="Attendances"
    />
  )
}
