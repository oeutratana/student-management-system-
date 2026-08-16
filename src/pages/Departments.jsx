import ResourcePage from "../components/ResourcePage"
import { departmentsApi } from "../services/schoolApi"

export default function Departments() {
  return (
    <ResourcePage
      api={departmentsApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Department" },
        { key: "description", label: "Description" },
        { key: "classes", label: "Classes", render: (item) => item.classes?.length ?? 0 },
        { key: "courses", label: "Courses", render: (item) => item.courses?.length ?? 0 },
      ]}
      description="Create and maintain academic departments used by classes and courses."
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      searchKeys={["name", "description"]}
      title="Departments"
    />
  )
}
