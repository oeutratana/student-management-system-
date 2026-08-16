import ResourcePage from "../components/ResourcePage"
import { coursesApi, departmentsApi, toOptions } from "../services/schoolApi"

export default function Courses() {
  return (
    <ResourcePage
      api={coursesApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "course_code", label: "Code" },
        { key: "course_name", label: "Course" },
        { key: "department", label: "Department", render: (item) => item.department?.name ?? "-" },
        { key: "credit", label: "Credits" },
      ]}
      description="Create and maintain the courses offered by each department."
      fields={[
        { name: "department_id", label: "Department", type: "select", required: true, loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "course_code", label: "Course Code", required: true },
        { name: "course_name", label: "Course Name", required: true },
        { name: "credit", label: "Credits", type: "number" },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      searchKeys={["course_code", "course_name", "department.name"]}
      title="Courses"
    />
  )
}
