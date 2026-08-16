import ResourcePage from "../components/ResourcePage"
import { classesApi, departmentsApi, usersApi, toOptions } from "../services/schoolApi"

export default function Classes() {
  return (
    <ResourcePage
      api={classesApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "class_name", label: "Class" },
        { key: "department", label: "Department", render: (item) => item.department?.name ?? "-" },
        { key: "teacher", label: "Teacher", render: (item) => item.teacher?.name ?? "-" },
        { key: "academic_year", label: "Academic Year" },
        { key: "semester", label: "Semester" },
        { key: "students", label: "Students", render: (item) => item.students?.length ?? 0 },
      ]}
      description="Manage school classes and their assigned department, teacher and term."
      fields={[
        { name: "department_id", label: "Department", type: "select", required: true, loadOptions: () => departmentsApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "teacher_id", label: "Teacher", type: "select", required: true, loadOptions: () => usersApi.list().then((rows) => toOptions(rows, "name")) },
        { name: "class_name", label: "Class Name", required: true },
        { name: "academic_year", label: "Academic Year", required: true },
        { name: "semester", label: "Semester", required: true },
      ]}
      searchKeys={["class_name", "department.name", "teacher.name", "academic_year"]}
      title="Classes"
    />
  )
}
