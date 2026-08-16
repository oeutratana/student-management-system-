import ResourcePage from "../components/ResourcePage"
import { parentsApi, studentsApi, toOptions } from "../services/schoolApi"

export default function Parents() {
  return (
    <ResourcePage
      api={parentsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "occupation", label: "Occupation" },
        { key: "phone", label: "Phone" },
        { key: "email", label: "Email" },
        { key: "student_id", label: "Student", render: (item) => item.student?.first_name ? `${item.student.first_name} ${item.student.last_name}` : "-" },
      ]}
      description="Manage parent / guardian profiles linked to students."
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone" },
        { name: "occupation", label: "Occupation" },
        { name: "address", label: "Address", type: "textarea" },
        { name: "student_id", label: "Student", type: "select", loadOptions: () => studentsApi.list().then((rows) => toOptions(rows, (item) => `${item.first_name} ${item.last_name}`)) },
      ]}
      searchKeys={["name", "email", "occupation"]}
      title="Parents"
    />
  )
}
