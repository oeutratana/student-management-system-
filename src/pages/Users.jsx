import ResourcePage from "../components/ResourcePage"
import { usersApi } from "../services/schoolApi"

export default function Users() {
  return (
    <ResourcePage
      api={usersApi}
      columns={[
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "role", label: "Role", render: (item) => <span className={`badge ${item.role === "admin" ? "badge--blue" : "badge--green"}`}>{item.role}</span> },
      ]}
      description="Manage user accounts and assign roles for the system."
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "password", label: "Password", type: "password", required: true },
        { name: "role", label: "Role", type: "select", required: true, options: [
          { value: "admin", label: "Admin" },
          { value: "teacher", label: "Teacher" },
        ] },
      ]}
      searchKeys={["name", "email", "role"]}
      title="Users"
    />
  )
}
